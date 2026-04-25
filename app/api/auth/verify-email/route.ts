export const dynamic = 'force-dynamic';

/**
 * GET /api/auth/verify-email?token=xxx
 * 
 * WHAT: Verifies a user's email address using the token sent via email.
 * 
 * FLOW:
 * 1. Extract token from query string
 * 2. Find user with matching token that hasn't expired
 * 3. Set emailVerified = true, clear token
 * 4. Send welcome email
 * 5. Return success
 * 
 * POST /api/auth/verify-email (resend)
 * Resends the verification email to the user.
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createToken, setAuthCookie } from '@/lib/auth';
import crypto from 'crypto';

export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get('token');
    
    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      );
    }

    // Find user with matching token
    const user = await db.user.findFirst({
      where: {
        verificationToken: token,
        verificationTokenExpires: { gt: new Date() },
        deletedAt: null,
      },
      select: {
        id: true,
        firstName: true,
        email: true,
        role: true,
        tokenVersion: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired verification token. Please request a new one.' },
        { status: 400 }
      );
    }

    // Mark email as verified and clear the token
    await db.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        verificationToken: null,
        verificationTokenExpires: null,
      },
    });

    // Send welcome email now that email is verified
    const { sendRegistrationEmail } = await import('@/lib/email');
    await sendRegistrationEmail(user.email, user.firstName)
      .catch(err => console.error('Failed to send welcome email', err));

    // Auto-login: create JWT and set cookie
    const jwtToken = await createToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      tokenVersion: user.tokenVersion,
    });
    await setAuthCookie(jwtToken);

    return NextResponse.json({
      message: 'Email verified successfully! Your account is now active.',
      verified: true,
    });

  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/auth/verify-email
 * Resend verification email
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const user = await db.user.findFirst({
      where: { email: email.toLowerCase(), deletedAt: null },
      select: {
        id: true,
        firstName: true,
        email: true,
        emailVerified: true,
        verificationToken: true,
        verificationTokenExpires: true,
      },
    });

    if (!user) {
      // Don't reveal if email exists
      return NextResponse.json({ message: 'If an account exists, a verification email will be sent.' });
    }

    if (user.emailVerified) {
      return NextResponse.json({ message: 'Email is already verified. You can log in.' });
    }

    // Reuse existing token if it's still valid (prevents "double click" invalidation bug)
    let verificationToken = user.verificationToken;
    let verificationTokenExpires = user.verificationTokenExpires;

    if (!verificationToken || !verificationTokenExpires || verificationTokenExpires < new Date()) {
      // Generate new token only if missing or expired
      verificationToken = crypto.randomBytes(32).toString('hex');
      verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

      await db.user.update({
        where: { id: user.id },
        data: { verificationToken, verificationTokenExpires },
      });
    }

    // Send verification email
    const locale = body.locale || 'en';
    const { sendVerificationEmail } = await import('@/lib/email');
    await sendVerificationEmail(user.email, user.firstName, verificationToken, locale)
      .catch(err => console.error('Failed to resend verification email', err));

    return NextResponse.json({ message: 'Verification email sent! Please check your inbox.' });

  } catch (error) {
    console.error('Resend verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
