export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/stats
 * 
 * WHAT: Returns platform-wide statistics for the admin dashboard
 * 
 * RECEIVES: Nothing (admin auth required via JWT cookie)
 * VALIDATES: User must have role = ADMIN
 * DB ACTION: Aggregation queries across users, applications, payments, messages
 * RETURNS: { totalUsers, totalApplications, byStatus, totalRevenue, recentApplications, unreadMessages }
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Verify admin access
    const currentUser = await getUserFromRequest(request);
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Run all queries in parallel for speed
    const [
      totalUsers,
      totalApplications,
      applicationsByStatus,
      succeededPayments,
      unreadMessages,
      recentApplications,
    ] = await Promise.all([
      // Total registered users (excluding admins)
      db.user.count({ where: { role: 'USER' } }),

      // Total applications
      db.application.count(),

      // Applications grouped by status
      db.application.groupBy({
        by: ['status'],
        _count: { status: true },
      }),

      // Total revenue from succeeded payments
      db.payment.aggregate({
        where: { status: 'SUCCEEDED' },
        _sum: { amount: true },
        _count: { id: true },
      }),

      // Unread contact messages
      db.message.count({ where: { isRead: false } }),

      // 10 most recent applications with user and service info
      db.application.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { firstName: true, lastName: true, email: true, country: true },
          },
          service: { select: { key: true } },
          payment: { select: { status: true, amount: true } },
        },
      }),
    ]);

    // Format status counts into an object
    const statusCounts: Record<string, number> = {};
    for (const item of applicationsByStatus) {
      statusCounts[item.status] = item._count.status;
    }

    return NextResponse.json({
      stats: {
        totalUsers,
        totalApplications,
        applicationsByStatus: statusCounts,
        totalRevenue: Number(succeededPayments._sum.amount || 0),
        totalPayments: succeededPayments._count.id,
        unreadMessages,
      },
      recentApplications,
    });

  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
