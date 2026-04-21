export const dynamic = 'force-dynamic';

/**
 * POST /api/auth/check-availability
 * 
 * Checks if an email or phone number is already registered.
 * Used by the apply form to validate BEFORE submission.
 * Returns { emailTaken: boolean, phoneTaken: boolean }
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, phone } = body;

    if (!email && !phone) {
      return NextResponse.json({ error: 'Email or phone is required' }, { status: 400 });
    }

    let emailTaken = false;
    let phoneTaken = false;

    if (email) {
      const existingEmail = await db.user.findUnique({
        where: { email: email.toLowerCase().trim() },
        select: { id: true },
      });
      emailTaken = !!existingEmail;
    }

    if (phone) {
      const existingPhone = await db.user.findFirst({
        where: { phone: phone.trim() },
        select: { id: true },
      });
      phoneTaken = !!existingPhone;
    }

    return NextResponse.json({ emailTaken, phoneTaken });
  } catch (error) {
    console.error('Check availability error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
