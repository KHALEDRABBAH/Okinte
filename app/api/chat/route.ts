export const dynamic = 'force-dynamic';

/**
 * User Chat API
 * GET  — Get current user's chat messages
 * POST — Send a message from user to admin
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { rateLimit, RATE_LIMITS } from '@/lib/rate-limit';

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getUserFromRequest(request);
    if (!currentUser) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const messages = await db.chatMessage.findMany({
      where: { userId: currentUser.userId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    // Reverse to get chronological order for display
    messages.reverse();

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

    // Rate limiting: 20 messages per minute per user
    const rl = rateLimit(`chat:${currentUser.userId}`, RATE_LIMITS.chat);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Too many messages. Please wait before sending another.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } }
      );
    }

    const body = await request.json();
    const { content } = body;

    if (!content || !content.trim()) {
      return NextResponse.json({ error: 'Message content is required' }, { status: 400 });
    }

    if (content.trim().length > 2000) {
      return NextResponse.json(
        { error: 'Message too long. Maximum 2000 characters.' },
        { status: 400 }
      );
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
