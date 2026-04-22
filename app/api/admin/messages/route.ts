export const dynamic = 'force-dynamic';

/**
 * GET   /api/admin/messages — List all contact messages
 * PATCH /api/admin/messages — Mark message as read or add reply
 * 
 * GET: ?page=1&limit=20&unread=true
 * PATCH: { messageId, isRead?, repliedBy? }
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest, verifyAdminRole } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getUserFromRequest(request);
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }
    const isAdmin = await verifyAdminRole(currentUser.userId);
    if (!isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const safeLimit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const unreadOnly = searchParams.get('unread') === 'true';
    const skip = (page - 1) * safeLimit;

    const where: any = {};
    if (unreadOnly) where.isRead = false;

    const [messages, total] = await Promise.all([
      db.message.findMany({
        where,
        include: {
          user: {
            select: { firstName: true, lastName: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: safeLimit,
      }),
      db.message.count({ where }),
    ]);

    return NextResponse.json({
      messages,
      pagination: { page, limit: safeLimit, total, totalPages: Math.ceil(total / safeLimit) },
    });

  } catch (error) {
    console.error('Admin messages error:', error);
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
    const { messageId, isRead, repliedBy } = body;

    if (!messageId) {
      return NextResponse.json({ error: 'messageId is required' }, { status: 400 });
    }

    const data: any = {};
    if (typeof isRead === 'boolean') data.isRead = isRead;
    if (repliedBy) {
      data.repliedBy = repliedBy;
      data.repliedAt = new Date();
    }

    const updated = await db.message.update({
      where: { id: messageId },
      data,
    });

    return NextResponse.json({ message: updated });

  } catch (error) {
    console.error('Admin message update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
