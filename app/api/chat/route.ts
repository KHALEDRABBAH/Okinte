export const dynamic = 'force-dynamic';

/**
 * User Chat API
 * GET  — Get current user's chat messages
 * POST — Send a message from user to admin
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getUserFromRequest(request);
    if (!currentUser) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const messages = await db.chatMessage.findMany({
      where: { userId: currentUser.userId },
      orderBy: { createdAt: 'asc' },
    });

    // Mark admin messages as read
    await db.chatMessage.updateMany({
      where: { userId: currentUser.userId, isAdmin: true, isRead: false },
      data: { isRead: true },
    });

    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Chat GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getUserFromRequest(request);
    if (!currentUser) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const { content } = body;

    if (!content || !content.trim()) {
      return NextResponse.json({ error: 'Message content is required' }, { status: 400 });
    }

    const message = await db.chatMessage.create({
      data: {
        userId: currentUser.userId,
        senderId: currentUser.userId,
        content: content.trim(),
        isAdmin: false,
      },
    });

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    console.error('Chat POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
