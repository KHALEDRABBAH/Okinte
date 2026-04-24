export const dynamic = 'force-dynamic';

/**
 * POST /api/auth/reset-password
 *
 * Validates a reset token and sets the new password.
 *
 * SECURITY:
 * - Rate limited: 3 attempts per 15 minutes per IP (prevents brute-force on token)
 * - Token must exist and not be expired
 * - Token is cleared after successful use (one-time use)
 * - Password strength: min 8 chars, 1 uppercase, 1 number
 * - Password is hashed before storage
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword } from '@/lib/auth';
import { rateLimit, getClientIp, RATE_LIMITS } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 3 reset attempts per 15 minutes per IP
    const ip = getClientIp(request);
    const rl = rateLimit(`reset-password:${ip}`, RATE_LIMITS.passwordReset);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Too many reset attempts. Please wait before trying again.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } }
      );
    }

    const body = await request.json();
    const { token, password } = body;

    if (!token || typeof token !== 'string') {
      return NextResponse.json(
        { error: 'Reset token is required' },
        { status: 400 }
      );
    }

    if (!password || typeof password !== 'string' || password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    if (!/[A-Z]/.test(password)) {
      return NextResponse.json(
        { error: 'Password must contain at least one uppercase letter.' },
        { status: 400 }
      );
    }

    if (!/[0-9]/.test(password)) {
      return NextResponse.json(
        { error: 'Password must contain at least one number.' },
        { status: 400 }
      );
    }

    // Find user by reset token
    const user = await db.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: { gt: new Date() }, // Token must not be expired
      },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'This reset link is invalid or has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // Hash the new password and clear the token (one-time use)
    const passwordHash = await hashPassword(password);

    await db.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetToken: null,
        resetTokenExpiry: null,
        tokenVersion: { increment: 1 }, // Invalidate all existing sessions
      },
    });

    return NextResponse.json({
      message: 'Password has been reset successfully. You can now log in with your new password.',
    });

  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'Unable to reset password. Please try again.' },
      { status: 500 }
    );
  }
}
