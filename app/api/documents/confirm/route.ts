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

    const isGlobalDoc = ['PASSPORT', 'CV', 'DIPLOMA'].includes(upperDocType);
    const isProfileMode = applicationId === 'profile';

    if (!isGlobalDoc && isProfileMode) {
      return NextResponse.json({ error: 'Cannot confirm application-specific documents on profile' }, { status: 400 });
    }

    // SECURITY CHECK: Prevent users from confirming documents outside their allowed directory
    const expectedPathPrefix = isGlobalDoc 
      ? `users/${currentUser.userId}/profile/` 
      : `users/${currentUser.userId}/${applicationId}/`;

    if (!storagePath.startsWith(expectedPathPrefix)) {
      return NextResponse.json({ error: 'Invalid storage path' }, { status: 403 });
    }

    if (!isProfileMode && applicationId) {
      const application = await db.application.findFirst({
        where: { id: applicationId, deletedAt: null },
      });

      if (!application || application.userId !== currentUser.userId) {
        return NextResponse.json({ error: 'Application not found or access denied' }, { status: 404 });
      }
    }

    const targetApplicationId = isGlobalDoc ? null : applicationId;

    // Use findFirst instead of upsert due to nullable applicationId constraint limits
    let document = await db.document.findFirst({
      where: {
        userId: currentUser.userId,
        type: upperDocType as any,
        applicationId: targetApplicationId,
        deletedAt: null,
      }
    });

    if (document) {
      document = await db.document.update({
        where: { id: document.id },
        data: {
          fileName,
          storagePath,
          mimeType,
          fileSize: fileSize || 0,
          uploadedAt: new Date(),
        }
      });
    } else {
      document = await db.document.create({
        data: {
          userId: currentUser.userId,
          applicationId: targetApplicationId,
          type: upperDocType as any,
          fileName,
          storagePath,
          mimeType,
          fileSize: fileSize || 0,
        }
      });
    }

    return NextResponse.json({ document }, { status: 201 });
  } catch (error: any) {
    console.error('Confirm document error:', error);
    return NextResponse.json({ error: `Failed to confirm document record: ${error?.message || 'Unknown error'}` }, { status: 500 });
  }
}
