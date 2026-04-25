import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { generatePresignedUploadUrl } from '@/lib/storage';
import { rateLimitAsync } from '@/lib/rate-limit';

const VALID_DOC_TYPES = ['PASSPORT', 'CV', 'DIPLOMA', 'PAYMENT_RECEIPT'];

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getUserFromRequest(request);
    if (!currentUser) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const rl = await rateLimitAsync(`presigned:${currentUser.userId}`, { maxRequests: 30, windowMs: 15 * 60 * 1000 });
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait.' },
        { status: 429 }
      );
    }

    const { applicationId, type, fileName, mimeType } = await request.json();

    if (!applicationId || !type || !fileName || !mimeType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const upperDocType = type.toUpperCase();
    if (!VALID_DOC_TYPES.includes(upperDocType)) {
      return NextResponse.json({ error: 'Invalid document type' }, { status: 400 });
    }

    // Only PAYMENT_RECEIPT requires a valid application.
    // PASSPORT, CV, and DIPLOMA are global user profile documents.
    const isGlobalDoc = ['PASSPORT', 'CV', 'DIPLOMA'].includes(upperDocType);
    const isProfileMode = applicationId === 'profile';

    if (!isGlobalDoc && isProfileMode) {
      return NextResponse.json({ error: 'Cannot upload application-specific documents to profile' }, { status: 400 });
    }

    if (!isProfileMode && applicationId) {
      const application = await db.application.findFirst({
        where: { id: applicationId, deletedAt: null },
      });

      if (!application || application.userId !== currentUser.userId) {
        return NextResponse.json({ error: 'Application not found or access denied' }, { status: 404 });
      }

      if (application.status !== 'DRAFT' && application.status !== 'RETURNED') {
        return NextResponse.json(
          { error: `Cannot upload documents to application in ${application.status} status.` },
          { status: 422 }
        );
      }
    } else if (!isGlobalDoc && !isProfileMode) {
      // Must have applicationId for PAYMENT_RECEIPT
      return NextResponse.json({ error: 'Application ID required' }, { status: 400 });
    }

    // Build storage path using extension
    const extension = fileName.split('.').pop() || 'bin';
    const pathPrefix = isGlobalDoc ? `users/${currentUser.userId}/profile` : `users/${currentUser.userId}/${applicationId}`;
    const storagePath = `${pathPrefix}/${upperDocType}_${Date.now()}.${extension}`;

    const { url, error } = await generatePresignedUploadUrl(storagePath);

    if (error || !url) {
      return NextResponse.json({ error: 'Failed to generate upload URL' }, { status: 500 });
    }

    return NextResponse.json({ url, storagePath }, { status: 200 });
  } catch (error) {
    console.error('Presigned URL error:', error);
    return NextResponse.json({ error: 'Failed to generate presigned URL.' }, { status: 500 });
  }
}
