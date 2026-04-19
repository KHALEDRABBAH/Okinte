export const dynamic = 'force-dynamic';

/**
 * POST /api/auth/forgot-password
 *
 * Generates a secure password reset token, stores it in the DB,
 * and sends a reset link to the user's email.
 *
 * SECURITY:
 * - Always returns success even if the email doesn't exist (prevents enumeration)
 * - Token expires after 1 hour
 * - Token is a random UUID (crypto-secure)
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email address is required' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Find user — but ALWAYS return success to prevent email enumeration
    const user = await db.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (user) {
      // Generate a secure token and set 1-hour expiry
      const resetToken = randomUUID();
      const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await db.user.update({
        where: { id: user.id },
        data: { resetToken, resetTokenExpiry },
      });

      // Send password reset email (non-blocking)
      const { sendPasswordResetEmail } = await import('@/lib/email');
      await sendPasswordResetEmail(normalizedEmail, user.firstName, resetToken)
        .catch(err => console.error('Failed to send password reset email:', err));
    }

    // Always return the same response regardless of whether the email exists
    return NextResponse.json({
      message: 'If an account with that email exists, a password reset link has been sent.',
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Unable to process your request. Please try again.' },
      { status: 500 }
    );
  }
}
