import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

const VALID_DOC_TYPES = ['PASSPORT', 'CV', 'DIPLOMA', 'PAYMENT_RECEIPT'];

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getUserFromRequest(request);
    if (!currentUser) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { applicationId, type, storagePath, fileName, fileSize, mimeType } = await request.json();

    if (!applicationId || !type || !storagePath || !fileName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const upperDocType = type.toUpperCase();
    if (!VALID_DOC_TYPES.includes(upperDocType)) {
      return NextResponse.json({ error: 'Invalid document type' }, { status: 400 });
    }

    // SECURITY CHECK: Prevent users from confirming documents outside their application directory
    const expectedPathPrefix = `users/${currentUser.userId}/${applicationId}/`;
    if (!storagePath.startsWith(expectedPathPrefix)) {
      return NextResponse.json({ error: 'Invalid storage path' }, { status: 403 });
    }

    const application = await db.application.findFirst({
      where: { id: applicationId, deletedAt: null },
    });

    if (!application || application.userId !== currentUser.userId) {
      return NextResponse.json({ error: 'Application not found or access denied' }, { status: 404 });
    }

    // Upsert the document record
    const document = await db.document.upsert({
      where: {
        applicationId_type_unique: {
          applicationId,
          type: upperDocType as any,
        }
      },
      update: {
        fileName,
        storagePath,
        mimeType,
        fileSize,
        uploadedAt: new Date(),
      },
      create: {
        userId: currentUser.userId,
        applicationId,
        type: upperDocType as any,
        fileName,
        storagePath,
        mimeType,
        fileSize,
      },
    });

    return NextResponse.json({ document }, { status: 201 });
  } catch (error) {
    console.error('Confirm document error:', error);
    return NextResponse.json({ error: 'Failed to confirm document record.' }, { status: 500 });
  }
}
