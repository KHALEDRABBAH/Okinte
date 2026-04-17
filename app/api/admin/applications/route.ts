export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/applications         — List all applications (with filters)
 * PATCH /api/admin/applications       — Update application status (approve/reject)
 * 
 * GET:
 *   Query params: ?status=SUBMITTED&page=1&limit=20
 *   Returns: paginated list with user, service, documents, payment
 * 
 * PATCH:
 *   Body: { applicationId, status, notes? }
 *   Allowed transitions: SUBMITTED→UNDER_REVIEW, UNDER_REVIEW→APPROVED/REJECTED
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getUserFromRequest(request);
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Build filter
    const where: any = {};
    if (status) {
      where.status = status;
    }

    // Fetch applications with all related data
    const [applications, total] = await Promise.all([
      db.application.findMany({
        where,
        include: {
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
          service: { select: { key: true, price: true } },
          documents: {
            select: {
              id: true,
              type: true,
              fileName: true,
              fileSize: true,
              uploadedAt: true,
            },
          },
          payment: {
            select: {
              id: true,
              amount: true,
              status: true,
              paidAt: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.application.count({ where }),
    ]);

    return NextResponse.json({
      applications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });

  } catch (error) {
    console.error('Admin applications list error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const currentUser = await getUserFromRequest(request);
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { applicationId, status, notes } = body;

    if (!applicationId || !status) {
      return NextResponse.json(
        { error: 'applicationId and status are required' },
        { status: 400 }
      );
    }

    // Validate status transition
    const validStatuses = ['UNDER_REVIEW', 'APPROVED', 'REJECTED'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Status must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    // Find application
    const application = await db.application.findUnique({
      where: { id: applicationId },
    });

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // Update application
    const updated = await db.application.update({
      where: { id: applicationId },
      data: {
        status,
        notes: notes || application.notes,
        reviewedAt: ['APPROVED', 'REJECTED'].includes(status) ? new Date() : undefined,
      },
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
        service: { select: { key: true } },
      },
    });

    return NextResponse.json({
      application: updated,
      message: `Application ${updated.referenceCode} updated to ${status}`,
    });

  } catch (error) {
    console.error('Admin application update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
