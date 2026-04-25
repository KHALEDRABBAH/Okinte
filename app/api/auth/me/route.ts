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
import { getSignedUrl } from '@/lib/storage';

export async function GET() {
  try {
    // Step 1-2: Read and verify JWT from cookie
    const tokenPayload = await getCurrentUser();

    if (!tokenPayload) {
      return NextResponse.json(
        { user: null },
        { status: 200 }
      );
    }

    // Step 3-4: Fetch fresh user data from database
    const user = await db.user.findFirst({
      where: { id: tokenPayload.userId, deletedAt: null },
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
        documents: {
          where: { applicationId: null },
          select: {
            id: true,
            type: true,
            fileName: true,
            mimeType: true,
            fileSize: true,
            uploadedAt: true,
          }
        }
      },
    });

    if (!user) {
      // User was deleted but JWT still valid — force logout by returning null
      return NextResponse.json(
        { user: null },
        { status: 200 }
      );
    }

    // Step 5: Generate signed avatar URL if avatar exists
    let avatarSignedUrl: string | null = null;
    if (user.avatarUrl) {
      avatarSignedUrl = await getSignedUrl(user.avatarUrl, 3600);
    }

    // Step 6: Return user profile with signed avatar URL
    return NextResponse.json({
      user: {
        ...user,
        avatarUrl: avatarSignedUrl || user.avatarUrl,
      }
    });

  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
