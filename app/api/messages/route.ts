export const dynamic = 'force-dynamic';

/**
 * POST /api/messages
 * 
 * WHAT: Handles contact form submissions
 * 
 * FLOW:
 * 1. Parse & validate with Zod (name, email, message required)
 * 2. If user is logged in (has JWT cookie), link message to their account
 * 3. INSERT into messages table
 * 4. Return success
 * 
 * WHO CAN USE: Anyone (logged in or anonymous visitors)
 * The userId is optional — if the user has a valid auth cookie,
 * we link the message to their account for admin convenience.
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { messageSchema } from '@/lib/validations';

export async function POST(request: NextRequest) {
  try {
    // Step 1: Validate input
    const body = await request.json();
    const validation = messageSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // Step 2: Check if logged in (optional — message works without auth)
    const currentUser = await getCurrentUser();

    // Step 3: Save message to database
    const message = await db.message.create({
      data: {
        name: validation.data.name,
        email: validation.data.email,
        phone: validation.data.phone || null,
        message: validation.data.message,
        userId: currentUser?.userId || null,
      },
    });

    // Step 4: Return success
    return NextResponse.json(
      { message: 'Message sent successfully', id: message.id },
      { status: 201 }
    );

  } catch (error) {
    console.error('Message error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
