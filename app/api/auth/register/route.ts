export const dynamic = 'force-dynamic';

/**
 * POST /api/auth/register
 * 
 * WHAT: Creates a new user account
 * 
 * FLOW:
 * 1. Parse & validate request body with Zod
 * 2. Check if email already exists → 409 if duplicate
 * 3. Hash password with bcrypt (10 salt rounds)
 * 4. Insert user into database
 * 5. Create JWT token with { userId, email, role }
 * 6. Set JWT as httpOnly cookie
 * 7. Return user profile (never return password hash)
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword, createToken, setAuthCookie } from '@/lib/auth';
import { registerSchema } from '@/lib/validations';
import { rateLimitAsync, getClientIp, RATE_LIMITS } from '@/lib/rate-limit';

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
      db.user.findUnique({ where: { email } }),
      db.user.findFirst({ where: { phone } }),
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

    // Step 4: Create the user in the database
    const user = await db.user.create({
      data: {
        firstName,
        lastName,
        email: email.toLowerCase(),
        phone,
        country,
        city,
        passwordHash,
      },
      select: {
        // Only select fields we want to return (NEVER return passwordHash)
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        country: true,
        city: true,
        role: true,
        createdAt: true,
      },
    });

    // Step 5: Create JWT token
    const token = await createToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      tokenVersion: 0, // Default for new users
    });

    // Step 6: Set the token as an httpOnly cookie
    await setAuthCookie(token);

    // Send welcome email (non-blocking)
    const { sendRegistrationEmail } = await import('@/lib/email');
    await sendRegistrationEmail(user.email, user.firstName)
      .catch(err => console.error('Failed to send registration email', err));

    // Step 7: Return the user (without sensitive data)
    return NextResponse.json({ user }, { status: 201 });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
