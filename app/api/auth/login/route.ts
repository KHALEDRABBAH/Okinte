export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyPassword, createToken, setAuthCookie, generateRefreshToken } from '@/lib/auth';
import { loginSchema } from '@/lib/validations';
import { rateLimitAsync, getClientIp, RATE_LIMITS } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rl = await rateLimitAsync(`login:${ip}`, RATE_LIMITS.login);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please wait 15 minutes before trying again.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } }
      );
    }

    const body = await request.json();
    const validation = loginSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { email, password } = validation.data;

    // Use explicit select to only fetch fields that definitely exist in the old schema
    const user = await db.user.findFirst({
      where: { email: email.toLowerCase(), deletedAt: null },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        country: true,
        city: true,
        role: true,
        passwordHash: true,
        emailVerified: true,
        tokenVersion: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const isValid = await verifyPassword(password, user.passwordHash);

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    if (!user.emailVerified) {
      return NextResponse.json(
        { 
          error: 'Please verify your email address before logging in. Check your inbox for the verification link.',
          requiresVerification: true,
          email: user.email,
        },
        { status: 403 }
      );
    }

    const token = await createToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      tokenVersion: user.tokenVersion,
    });

    const refreshToken = generateRefreshToken();
    const refreshTokenExpires = new Date();
    refreshTokenExpires.setDate(refreshTokenExpires.getDate() + 30); // 30 days

    await db.user.update({
      where: { id: user.id },
      data: {
        refreshToken,
        refreshTokenExpires,
      },
    });

    await setAuthCookie(token, refreshToken);

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
