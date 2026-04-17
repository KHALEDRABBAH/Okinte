export const dynamic = 'force-dynamic';

/**
 * POST /api/documents/upload
 * 
 * WHAT: Uploads a single file to Supabase Storage and creates a document record
 * 
 * HOW FILES FLOW:
 * 1. Frontend sends FormData with: file, applicationId, type (passport|cv|diploma|payment_receipt)
 * 2. Server validates: user is authenticated, application exists, file type/size OK
 * 3. Server reads file into a Buffer (raw bytes)
 * 4. Server uploads buffer to Supabase Storage at:
 *    users/{userId}/{applicationId}/{type}_{timestamp}.{ext}
 * 5. Server creates a document record in PostgreSQL with the storage path
 * 6. Returns document metadata (NOT the file — use /api/documents/[id] for signed URL)
 * 
 * SECURITY:
 * - Only authenticated users can upload
 * - Users can only upload to their OWN applications
 * - File type restricted to PDF, JPG, PNG
 * - File size limited to 5MB
 * - Files stored in PRIVATE bucket — no public access
 * 
 * IDEMPOTENT:
 * - If a document of the same type already exists for this application,
 *   it is REPLACED (old file deleted from storage, old record updated)
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { uploadFile, deleteFile } from '@/lib/storage';

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

    // Step 5: Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'File must be PDF, JPG, or PNG' },
        { status: 400 }
      );
    }

    // Step 6: Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size must be less than 5MB' },
        { status: 400 }
      );
    }

    // Step 7: Verify application exists and belongs to user
    const application = await db.application.findUnique({
      where: { id: applicationId },
    });

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    if (application.userId !== currentUser.userId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Step 8: Convert file to Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Step 9: Build storage path
    // Format: users/{userId}/{applicationId}/{TYPE}_{timestamp}.{ext}
    const ext = file.name.split('.').pop()?.toLowerCase() || 'pdf';
    const storagePath = `users/${currentUser.userId}/${applicationId}/${upperDocType}_${Date.now()}.${ext}`;

    // Step 10: Check if a document of this type already exists → replace it
    const existingDoc = await db.document.findFirst({
      where: {
        applicationId,
        type: upperDocType as any,
      },
    });

    if (existingDoc) {
      // Delete old file from Supabase Storage
      await deleteFile(existingDoc.storagePath);
    }

    // Step 11: Upload to Supabase Storage
    const { path, error: uploadError } = await uploadFile(buffer, storagePath, file.type);

    if (uploadError) {
      return NextResponse.json(
        { error: `Upload failed: ${uploadError}` },
        { status: 500 }
      );
    }

    // Step 12: Create or update document record in database
    let document;
    if (existingDoc) {
      document = await db.document.update({
        where: { id: existingDoc.id },
        data: {
          fileName: file.name,
          storagePath: path,
          mimeType: file.type,
          fileSize: file.size,
          uploadedAt: new Date(),
        },
      });
    } else {
      document = await db.document.create({
        data: {
          userId: currentUser.userId,
          applicationId,
          type: upperDocType as any,
          fileName: file.name,
          storagePath: path,
          mimeType: file.type,
          fileSize: file.size,
        },
      });
    }

    // Step 13: Return document metadata
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
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
