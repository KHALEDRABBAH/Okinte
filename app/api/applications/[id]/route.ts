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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await getUserFromRequest(request);
    if (!currentUser) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const application = await db.application.findUnique({
      where: { id: params.id },
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
