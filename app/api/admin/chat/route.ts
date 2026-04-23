export const dynamic = 'force-dynamic';

/**
 * Admin Chat API
 * GET  — List all conversations or get specific user's chat
 * POST — Admin replies to a user
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
    const userId = searchParams.get('userId');

    if (userId) {
      // Get specific user's chat messages
      const messages = await db.chatMessage.findMany({
        where: { userId },
        orderBy: { createdAt: 'asc' },
      });

      // Mark user messages as read
      await db.chatMessage.updateMany({
        where: { userId, isAdmin: false, isRead: false },
        data: { isRead: true },
      });

      return NextResponse.json({ messages });
    }

    // List all conversations (grouped by user)
    const conversations = await db.chatMessage.groupBy({
      by: ['userId'],
      _count: { id: true },
      _max: { createdAt: true },
      orderBy: { _max: { createdAt: 'desc' } },
    });

    // Batch-fetch all user details in ONE query (eliminates N+1)
    const userIds = conversations.map((c: { userId: string }) => c.userId);
    const [users, unreadCounts, lastMessages] = await Promise.all([
      db.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true, firstName: true, lastName: true, email: true },
      }),
      db.chatMessage.groupBy({
        by: ['userId'],
        where: { userId: { in: userIds }, isAdmin: false, isRead: false },
        _count: { id: true },
      }),
      db.chatMessage.findMany({
        where: { userId: { in: userIds } },
        orderBy: { createdAt: 'desc' },
        distinct: ['userId'],
        select: { userId: true, content: true, isAdmin: true, createdAt: true },
      }),
    ]);

    // Build lookup maps for O(1) access
    const userMap = new Map(users.map((u: { id: string; firstName: string; lastName: string; email: string }) => [u.id, u]));
    const unreadMap = new Map(unreadCounts.map((u: { userId: string; _count: { id: number } }) => [u.userId, u._count.id]));
    const lastMsgMap = new Map(lastMessages.map((m: { userId: string; content: string; isAdmin: boolean; createdAt: Date }) => [m.userId, { content: m.content, isAdmin: m.isAdmin, createdAt: m.createdAt }]));

    const conversationsWithDetails = conversations.map((conv: { userId: string; _count: { id: number } }) => ({
      userId: conv.userId,
      user: userMap.get(conv.userId) || null,
      messageCount: conv._count.id,
      unreadCount: unreadMap.get(conv.userId) || 0,
      lastMessage: lastMsgMap.get(conv.userId) || null,
    }));

    return NextResponse.json({ conversations: conversationsWithDetails });
  } catch (error) {
    console.error('Admin chat GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getUserFromRequest(request);
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }
    // Verify admin role from database
    const isAdmin = await verifyAdminRole(currentUser.userId);
    if (!isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await request.json();
    const { userId, content } = body;

    if (!userId || !content || !content.trim()) {
      return NextResponse.json({ error: 'userId and content are required' }, { status: 400 });
    }

    // Verify user exists
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const message = await db.chatMessage.create({
      data: {
        userId,
        senderId: currentUser.userId,
        content: content.trim(),
        isAdmin: true,
      },
    });

    // Send email notification to user (non-blocking)
    try {
      const { sendChatNotificationEmail } = await import('@/lib/email');
      await sendChatNotificationEmail(user.email, user.firstName, content.trim());
    } catch (emailErr) {
      console.error('Failed to send chat notification email:', emailErr);
    }

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    console.error('Admin chat POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
