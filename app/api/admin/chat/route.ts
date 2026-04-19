export const dynamic = 'force-dynamic';

/**
 * Admin Chat API
 * GET  — List all conversations or get specific user's chat
 * POST — Admin replies to a user
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

    // Get user details and unread counts for each conversation
    const conversationsWithDetails = await Promise.all(
      conversations.map(async (conv) => {
        const user = await db.user.findUnique({
          where: { id: conv.userId },
          select: { id: true, firstName: true, lastName: true, email: true },
        });

        const unreadCount = await db.chatMessage.count({
          where: { userId: conv.userId, isAdmin: false, isRead: false },
        });

        const lastMessage = await db.chatMessage.findFirst({
          where: { userId: conv.userId },
          orderBy: { createdAt: 'desc' },
          select: { content: true, isAdmin: true, createdAt: true },
        });

        return {
          userId: conv.userId,
          user,
          messageCount: conv._count.id,
          unreadCount,
          lastMessage,
        };
      })
    );

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

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    console.error('Admin chat POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
