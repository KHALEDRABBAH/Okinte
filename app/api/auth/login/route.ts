export const dynamic = 'force-dynamic';

/**
 * POST /api/auth/login
 * 
 * WHAT: Authenticates an existing user
 * 
 * FLOW:
 * 1. Parse & validate request body with Zod
 * 2. Find user by email → 401 if not found
 * 3. Compare password with stored hash → 401 if no match
 * 4. Create JWT token with { userId, email, role }
 * 5. Set JWT as httpOnly cookie
 * 6. Return user profile
 * 
 * SECURITY:
 * - We return the SAME error message for "user not found" and "wrong password"
 *   to prevent email enumeration attacks (attacker can't tell if an email exists)
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyPassword, createToken, setAuthCookie } from '@/lib/auth';
import { loginSchema } from '@/lib/validations';

export async function POST(request: NextRequest) {
  try {
    // Step 1: Parse and validate
    const body = await request.json();
    const validation = loginSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { email, password } = validation.data;

    // Step 2: Find user by email
    const user = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      // Generic message to prevent email enumeration
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Step 3: Verify password against stored hash
    const isValid = await verifyPassword(password, user.passwordHash);

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Step 4: Create JWT
    const token = await createToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Step 5: Set cookie
    await setAuthCookie(token);

    // Step 6: Return user (without password hash)
    return NextResponse.json({
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        country: user.country,
        city: user.city,
        role: user.role,
        createdAt: user.createdAt,
      },
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
