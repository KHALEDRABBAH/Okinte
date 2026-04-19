export const dynamic = 'force-dynamic';

/**
 * GET /api/auth/me
 * 
 * WHAT: Returns the currently authenticated user's profile
 * 
 * FLOW:
 * 1. Read the JWT from the httpOnly cookie (sent automatically by browser)
 * 2. Verify the JWT signature and check expiry
 * 3. Extract userId from the token payload
 * 4. Query database for fresh user data (role may have changed)
 * 5. Return user profile or 401 if not authenticated
 * 
 * WHY QUERY DB AGAIN?
 * The JWT contains { userId, email, role } from login time.
 * But an admin might have changed the user's role since then.
 * Querying the DB ensures we always return current data.
 */

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    // Step 1-2: Read and verify JWT from cookie
    const tokenPayload = await getCurrentUser();

    if (!tokenPayload) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Step 3-4: Fetch fresh user data from database
    const user = await db.user.findUnique({
      where: { id: tokenPayload.userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        country: true,
        city: true,
        avatarUrl: true,
        role: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      // User was deleted but JWT still valid — force logout
      return NextResponse.json(
        { error: 'User not found' },
        { status: 401 }
      );
    }

    // Step 5: Return user profile
    return NextResponse.json({ user });

  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
