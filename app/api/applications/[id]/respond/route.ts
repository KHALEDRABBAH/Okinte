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

    // 5. Parse JSON body
    const { comment = '' } = await request.json();

    // 6. Update application: save user response, change status to SUBMITTED
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
        user: {
          select: {
            documents: {
              where: { applicationId: null },
              select: { id: true, type: true, fileName: true },
            }
          }
        }
      },
    });

    // Merge application-specific documents with global user documents
    const mergedDocuments = [
      ...updated.documents,
      ...((updated.user as any).documents || [])
    ];
    
    const { documents: _userDocs, ...userWithoutDocs } = updated.user as any;
    
    const finalApplication = {
      ...updated,
      documents: mergedDocuments,
      user: userWithoutDocs
    };

    return NextResponse.json({
      success: true,
      application: finalApplication,
      message: 'Your response has been submitted. The admin will review it shortly.',
    });

  } catch (error) {
    console.error('Application respond error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
