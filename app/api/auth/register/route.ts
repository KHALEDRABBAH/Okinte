export const dynamic = 'force-dynamic';

/**
 * POST /api/auth/register
 * 
 * WHAT: Creates a new user account with email verification
 * 
 * FLOW:
 * 1. Parse & validate request body with Zod
 * 2. Check if email already exists → 409 if duplicate
 * 3. Hash password with bcrypt (10 salt rounds)
 * 4. Generate email verification token
 * 5. Insert user into database (emailVerified = false)
 * 6. Send verification email
 * 7. Return success (user must verify email before logging in)
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword, createToken, setAuthCookie } from '@/lib/auth';
import { registerSchema } from '@/lib/validations';
import { rateLimitAsync, getClientIp, RATE_LIMITS } from '@/lib/rate-limit';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 3 registrations per 30 minutes per IP
    const ip = getClientIp(request);
    const rl = await rateLimitAsync(`register:${ip}`, RATE_LIMITS.register);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Too many registration attempts. Please wait before trying again.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } }
      );
    }

    // Step 1: Parse and validate the request body
    const body = await request.json();
    const validation = registerSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { firstName, lastName, email, phone, country, city, password } = validation.data;

    // Step 2: Check if email or phone already exists
    const [existingEmail, existingPhone] = await Promise.all([
      db.user.findUnique({ where: { email: email.toLowerCase() }, select: { id: true } }),
      db.user.findFirst({ where: { phone }, select: { id: true } }),
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

    // Step 3: Hash the password (never store raw passwords)
    const passwordHash = await hashPassword(password);

    // Step 4: Generate verification token (valid for 24 hours)
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Step 5: Create the user in the database (NOT verified yet)
    const user = await db.user.create({
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
        lastName: true,
        email: true,
        phone: true,
        country: true,
        city: true,
        role: true,
        tokenVersion: true,
        createdAt: true,
      },
    });

    // Step 6: Send verification email
    const locale = body.locale || 'en';
    const { sendVerificationEmail } = await import('@/lib/email');
    await sendVerificationEmail(user.email, user.firstName, verificationToken, locale)
      .catch(err => console.error('Failed to send verification email:', err));

    // Step 7: Set temporary auth cookie so frontend can create draft app + upload docs
    const jwtToken = await createToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      tokenVersion: user.tokenVersion,
    });
    await setAuthCookie(jwtToken);

    // Step 8: Return success
    return NextResponse.json(
      { 
        message: 'Account created! Please check your email to verify your account.',
        requiresVerification: true,
        user: { id: user.id, email: user.email, firstName: user.firstName },
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

