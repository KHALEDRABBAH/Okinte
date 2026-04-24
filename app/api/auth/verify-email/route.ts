export const dynamic = 'force-dynamic';

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

    let user;
    try {
      // @ts-ignore - verificationToken exists in schema but might not in DB yet
      user = await db.user.findFirst({
        where: {
          verificationToken: token,
          verificationTokenExpires: { gt: new Date() },
        },
        select: {
          id: true,
          firstName: true,
          email: true,
          role: true,
          tokenVersion: true,
        }
      });
    } catch (e) {
      // If column doesn't exist, this feature can't work yet
      return NextResponse.json(
        { error: 'Email verification is currently unavailable. Please contact support.' },
        { status: 400 }
      );
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired verification token. Please request a new one.' },
        { status: 400 }
      );
    }

    try {
      // @ts-ignore
      await db.user.update({
        where: { id: user.id },
        data: {
          emailVerified: true,
          verificationToken: null,
          verificationTokenExpires: null,
        },
      });
    } catch (e) {
      // Fallback
      await db.user.update({
        where: { id: user.id },
        data: { emailVerified: true },
      });
    }

    const { sendRegistrationEmail } = await import('@/lib/email');
    await sendRegistrationEmail(user.email, user.firstName)
      .catch(err => console.error('Failed to send welcome email', err));

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

    const user = await db.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        firstName: true,
        email: true,
        emailVerified: true,
      }
    });

    if (!user) {
      return NextResponse.json({ message: 'If an account exists, a verification email will be sent.' });
    }

    if (user.emailVerified) {
      return NextResponse.json({ message: 'Email is already verified. You can log in.' });
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    try {
      // @ts-ignore
      await db.user.update({
        where: { id: user.id },
        data: { verificationToken, verificationTokenExpires },
      });
      
      const locale = body.locale || 'en';
      const { sendVerificationEmail } = await import('@/lib/email');
      await sendVerificationEmail(user.email, user.firstName, verificationToken, locale)
        .catch(err => console.error('Failed to resend verification email', err));
        
    } catch (updateErr) {
      console.error('Could not update verification token (columns may not exist):', updateErr);
    }

    return NextResponse.json({ message: 'Verification email sent! Please check your inbox.' });

  } catch (error) {
    console.error('Resend verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
