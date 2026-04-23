export const dynamic = 'force-dynamic';
// Allow up to 60 seconds for file uploads (Vercel default is ~10-15s)
export const maxDuration = 60;

/**
 * POST /api/documents/upload
 * 
 * Uploads a document for an application with improved consistency guarantees.
 * 
 * CONSISTENCY GUARANTEES:
 * 1. Pre-validation: Verify user ownership before any I/O
 * 2. Atomic DB operation: Document record creation/update is transactional
 * 3. Storage cleanup on DB failure: Uploaded file deleted if DB write fails
 * 4. Upsert pattern: Existing document replaced atomically (no orphans)
 * 
 * FLOW:
 * 1. Authenticate & validate request
 * 2. Upload file to storage
 * 3. DB transaction: upsert document record
 * 4. On DB failure: delete uploaded file (cleanup)
 * 
 * The key insight: Storage is written first (idempotent via upsert),
 * then DB record is created. If DB fails, storage cleanup is attempted.
 */
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { uploadFile, deleteFile } from '@/lib/storage';
import { rateLimitAsync } from '@/lib/rate-limit';
import { validateFileWithMagicBytes } from '@/lib/file-validation';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
const VALID_DOC_TYPES = ['PASSPORT', 'CV', 'DIPLOMA', 'PAYMENT_RECEIPT'];

export async function POST(request: NextRequest) {
  try {
    // Step 1: Authenticate
    const currentUser = await getUserFromRequest(request);
    if (!currentUser) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Rate limiting: 30 uploads per 15 minutes per user
    const rl = await rateLimitAsync(`upload:${currentUser.userId}`, { maxRequests: 30, windowMs: 15 * 60 * 1000 });
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Too many upload attempts. Please wait before trying again.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } }
      );
    }

    // Step 2: Parse FormData
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const applicationId = formData.get('applicationId') as string | null;
    const docType = formData.get('type') as string | null;

    // Step 3: Validate all fields exist
    if (!file || !applicationId || !docType) {
      return NextResponse.json(
        { error: 'Missing required fields: file, applicationId, type' },
        { status: 400 }
      );
    }

    // Step 4: Validate document type
    const upperDocType = docType.toUpperCase();
    if (!VALID_DOC_TYPES.includes(upperDocType)) {
      return NextResponse.json(
        { error: `Invalid document type. Must be one of: ${VALID_DOC_TYPES.join(', ')}` },
        { status: 400 }
      );
    }

    // Step 5: Validate file size before any heavy operations
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size must be less than 5MB' },
        { status: 400 }
      );
    }

    // Step 6: Validate file type with magic byte verification
    // Convert file to Buffer for magic byte checking
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const fileValidation = await validateFileWithMagicBytes(buffer, file.type);
    if (!fileValidation.valid) {
      return NextResponse.json(
        { error: fileValidation.error || 'File validation failed' },
        { status: 400 }
      );
    }

    // Step 7: Verify application exists and belongs to user (BEFORE any file I/O)
    const application = await db.application.findUnique({
      where: { id: applicationId },
    });

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    if (application.userId !== currentUser.userId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Step 8: Check application status — only allow uploads for DRAFT or RETURNED applications
    if (application.status !== 'DRAFT' && application.status !== 'RETURNED') {
      return NextResponse.json(
        { error: `Cannot upload documents to application in ${application.status} status. Only DRAFT or RETURNED applications can receive document uploads.` },
        { status: 422 }
      );
    }

    // Step 9: Check for existing document (before upload to know if we need cleanup)
    const existingDoc = await db.document.findFirst({
      where: {
        applicationId,
        type: upperDocType as any,
      },
    });

    // Step 10: Build storage path using verified extension
    const storagePath = `users/${currentUser.userId}/${applicationId}/${upperDocType}_${Date.now()}.${fileValidation.extension}`;

    // Step 11: Upload to storage FIRST
    const { path, error: uploadError } = await uploadFile(buffer, storagePath, fileValidation.mimeType!);

    if (uploadError || !path) {
      return NextResponse.json(
        { error: `Upload failed: ${uploadError || 'Unknown error'}` },
        { status: 500 }
      );
    }

    // Step 12: DB operation in transaction - UPSERT document record
    // This is the critical section for consistency
    let document;
    try {
      // Use upsert to atomically handle existing/new documents
      // This prevents orphaned records on concurrent uploads
      document = await db.document.upsert({
        where: { 
          // Unique constraint on applicationId + type
          applicationId_type_unique: {
            applicationId,
            type: upperDocType as any,
          }
        },
        update: {
          fileName: file.name,
          storagePath: path,
          mimeType: fileValidation.mimeType!,
          fileSize: file.size,
          uploadedAt: new Date(),
        },
        create: {
          userId: currentUser.userId,
          applicationId,
          type: upperDocType as any,
          fileName: file.name,
          storagePath: path,
          mimeType: fileValidation.mimeType!,
          fileSize: file.size,
        },
      });

      // Step 13: Cleanup old file only AFTER successful DB update
      // Delete old storage file if this was an update (not a new create)
      if (existingDoc && existingDoc.storagePath !== path) {
        await deleteFile(existingDoc.storagePath).catch(err => 
          console.error('Failed to cleanup old file (non-critical):', err)
        );
      }
    } catch (dbError) {
      // CRITICAL: DB failed - rollback the uploaded file
      console.error('DB save failed after upload, rolling back storage file:', dbError);
      const deleted = await deleteFile(path);
      if (!deleted) {
        // Log but don't fail - file will be orphaned but won't break anything
        // A cleanup job can handle orphaned files later
        console.error(`STORAGE LEAK: Failed to delete orphaned file ${path}`);
      }
      return NextResponse.json(
        { error: 'Failed to save document record. Please try uploading again.' },
        { status: 500 }
      );
    }

    // Step 14: Return document metadata
    return NextResponse.json({
      document: {
        id: document.id,
        type: document.type,
        fileName: document.fileName,
        fileSize: document.fileSize,
        mimeType: document.mimeType,
        uploadedAt: document.uploadedAt,
      },
    }, { status: 201 });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'File upload failed. Please try again.' }, { status: 500 });
  }
}
