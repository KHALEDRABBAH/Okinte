export const dynamic = 'force-dynamic';

/**
 * POST /api/auth/logout
 * 
 * WHAT: Logs the user out by deleting the auth cookie
 * 
 * FLOW:
 * 1. Delete the "okinte-auth-token" httpOnly cookie
 * 2. Return success message
 * 
 * WHY POST INSTEAD OF GET?
 * Logout changes state (removes the session), so it should be POST.
 * GET requests can be triggered by image tags, prefetching, etc.
 * Using POST prevents accidental logouts from link prefetching.
 */

import { NextResponse } from 'next/server';
import { removeAuthCookie } from '@/lib/auth';

export async function POST() {
  try {
    await removeAuthCookie();

    return NextResponse.json({ message: 'Logged out successfully' });

  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
