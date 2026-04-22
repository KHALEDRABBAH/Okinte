export const dynamic = 'force-dynamic';

/**
 * GET /api/applications/[id]  — Get a single application with all details
 * 
 * FLOW:
 * 1. Verify user is authenticated
 * 2. Fetch application by ID
 * 3. Verify the user owns this application (or is admin)
 * 4. Return application with service, documents, and payment
 * 
 * SECURITY:
 * - Users can only view their OWN applications
 * - Admins can view ANY application
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { deleteFile } from '@/lib/storage';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const currentUser = await getUserFromRequest(request);
    if (!currentUser) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const application = await db.application.findUnique({
      where: { id },
      include: {
        service: true,
        documents: {
          select: {
            id: true,
            type: true,
            fileName: true,
            mimeType: true,
            fileSize: true,
            uploadedAt: true,
          },
        },
        payment: {
          select: {
            id: true,
            amount: true,
            currency: true,
            status: true,
            paidAt: true,
            stripeSessionId: true,
          },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            country: true,
            city: true,
          },
        },
      },
    });

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // Security: Only owner or admin can view
    if (application.userId !== currentUser.userId && currentUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    return NextResponse.json({ application });

  } catch (error) {
    console.error('Application detail error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const currentUser = await getUserFromRequest(request);
    if (!currentUser) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const application = await db.application.findUnique({
      where: { id },
      include: { documents: true },
    });

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // Only owner can delete (or admin)
    if (application.userId !== currentUser.userId && currentUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Only draft applications can be deleted (protect paid/submitted applications)
    if (application.status !== 'DRAFT') {
      return NextResponse.json(
        { error: 'Only draft applications can be deleted.' },
        { status: 422 }
      );
    }

    // 1. Delete all associated documents from Supabase storage first
    for (const doc of application.documents) {
      if (doc.storagePath) {
         await deleteFile(doc.storagePath);
      }
    }

    // 2. Delete the application (cascade deletes DB document records and payments)
    await db.application.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Application deleted successfully' });

  } catch (error) {
    console.error('Application delete error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
