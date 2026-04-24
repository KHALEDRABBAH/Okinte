export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword } from '@/lib/auth';
import { registerSchema } from '@/lib/validations';
import { rateLimitAsync, getClientIp, RATE_LIMITS } from '@/lib/rate-limit';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rl = await rateLimitAsync(`register:${ip}`, RATE_LIMITS.register);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Too many registration attempts. Please wait before trying again.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } }
      );
    }

    const body = await request.json();
    const validation = registerSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { firstName, lastName, email, phone, country, city, password } = validation.data;

    // Use Prisma with select to avoid fetching missing columns
    const [existingEmail, existingPhone] = await Promise.all([
      db.user.findUnique({
        where: { email: email.toLowerCase() },
        select: { id: true }
      }),
      db.user.findFirst({
        where: { phone },
        select: { id: true }
      })
    ]);
    
    if (existingEmail) {
      return NextResponse.json(
        { error: 'An account with this email already exists', field: 'email', details: { email: ['This email is already registered. Please use a different email or login.'] } },
        { status: 409 }
      );
    }

    if (existingPhone) {
      return NextResponse.json(
        { error: 'An account with this phone number already exists', field: 'phone', details: { phone: ['This phone number is already registered.'] } },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    let user: { id: string; firstName: string; email: string };
    
    try {
      // @ts-ignore - we know these fields might be missing in older DB but Prisma client expects them
      const created = await db.user.create({
        data: {
          firstName,
          lastName,
          email: email.toLowerCase(),
          phone,
          country,
          city,
          passwordHash,
          emailVerified: false,
          verificationToken,
          verificationTokenExpires,
        },
        select: {
          id: true,
          firstName: true,
          email: true,
        },
      });
      user = created;
    } catch (createErr: any) {
      // Fallback if verificationToken column doesn't exist yet
      const created = await db.user.create({
        data: {
          firstName,
          lastName,
          email: email.toLowerCase(),
          phone,
          country,
          city,
          passwordHash,
          emailVerified: false,
        },
        select: {
          id: true,
          firstName: true,
          email: true,
        },
      });
      user = created;
    }

    const locale = body.locale || 'en';
    try {
      const { sendVerificationEmail } = await import('@/lib/email');
      await sendVerificationEmail(user.email, user.firstName, verificationToken, locale);
    } catch (emailErr) {
      console.error('Failed to send verification email', emailErr);
    }

    return NextResponse.json(
      { 
        message: 'Account created! Please check your email to verify your account.',
        requiresVerification: true,
        user: { email: user.email, firstName: user.firstName },
      }, 
      { status: 201 }
    );

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
