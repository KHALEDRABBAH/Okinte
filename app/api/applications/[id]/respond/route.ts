export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * POST /api/applications/[id]/respond
 * 
 * Allows a user to respond to admin feedback on a RETURNED application.
 * The user can:
 * - Submit a text comment/response
 * - Upload replacement documents
 * 
 * This does NOT re-open the full application form.
 * It only accepts a comment + optional new documents, then
 * changes the status from RETURNED → SUBMITTED.
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { uploadFile, deleteFile } from '@/lib/storage';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
const VALID_DOC_TYPES = ['PASSPORT', 'CV', 'DIPLOMA', 'PAYMENT_RECEIPT'];

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 1. Authenticate
    const currentUser = await getUserFromRequest(request);
    if (!currentUser) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // 2. Fetch the application
    const application = await db.application.findFirst({
      where: { id, deletedAt: null },
      include: { documents: true },
    });

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // 3. Security: only the owner can respond
    if (application.userId !== currentUser.userId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // 4. Only RETURNED applications can be responded to
    if (application.status !== 'RETURNED') {
      return NextResponse.json(
        { error: 'Only returned applications can be responded to' },
        { status: 422 }
      );
    }

    // 5. Parse form data
    const formData = await request.formData();
    const comment = formData.get('comment') as string || '';

    // 6. Handle document uploads (optional — user may upload 0..4 replacement docs)
    const uploadedDocs: { type: string; path: string; fileName: string; mimeType: string; fileSize: number }[] = [];

    for (const docType of VALID_DOC_TYPES) {
      const file = formData.get(docType) as File | null;
      if (!file || file.size === 0) continue;

      // Validate file
      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json(
          { error: `${docType}: Invalid file type. Only PDF, JPG, PNG allowed.` },
          { status: 400 }
        );
      }
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `${docType}: File size must be less than 5MB` },
          { status: 400 }
        );
      }

      // Upload to storage
      const ext = file.name.split('.').pop()?.toLowerCase() || 'pdf';
      const storagePath = `users/${currentUser.userId}/${id}/${docType}_${Date.now()}.${ext}`;
      
      const { path, error } = await uploadFile(file, storagePath, file.type);
      if (error || !path) {
        console.error(`Upload failed for ${docType}:`, error);
        return NextResponse.json({ error: `${docType}: Upload failed — ${error || 'Unknown storage error'}` }, { status: 500 });
      }

      uploadedDocs.push({
        type: docType,
        path,
        fileName: file.name,
        mimeType: file.type,
        fileSize: file.size,
      });
    }

    // 7. Update documents in database (replace existing ones of same type)
    for (const doc of uploadedDocs) {
      // Delete old file from storage if it exists
      const existingDoc = application.documents.find((d: { type: string; storagePath: string }) => d.type === doc.type);
      if (existingDoc?.storagePath) {
        try { await deleteFile(existingDoc.storagePath); } catch {}
      }

      // Upsert document record
      await db.document.upsert({
        where: {
          applicationId_type_unique: {
            applicationId: id,
            type: doc.type as any,
          },
        },
        update: {
          fileName: doc.fileName,
          storagePath: doc.path,
          mimeType: doc.mimeType,
          fileSize: doc.fileSize,
          uploadedAt: new Date(),
        },
        create: {
          userId: currentUser.userId,
          applicationId: id,
          type: doc.type as any,
          fileName: doc.fileName,
          storagePath: doc.path,
          mimeType: doc.mimeType,
          fileSize: doc.fileSize,
        },
      });
    }

    // 8. Update application: save user response, change status to SUBMITTED
    const updated = await db.application.update({
      where: { id },
      data: {
        userResponse: comment || null,
        status: 'SUBMITTED',
        submittedAt: new Date(),
      },
      include: {
        service: true,
        documents: {
          select: { id: true, type: true, fileName: true },
        },
        payment: {
          select: { id: true, amount: true, status: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      application: updated,
      message: 'Your response has been submitted. The admin will review it shortly.',
    });

  } catch (error) {
    console.error('Application respond error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
