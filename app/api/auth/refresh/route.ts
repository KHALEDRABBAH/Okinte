import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createToken, generateRefreshToken, setAuthCookie, removeAuthCookie } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // 1. Get the refresh token from the cookie
    const refreshToken = request.cookies.get('okinte-refresh-token')?.value;

    if (!refreshToken) {
      return NextResponse.json({ error: 'Refresh token not found' }, { status: 401 });
    }

    // 2. Verify the refresh token in the database
    const user = await db.user.findFirst({
      where: {
        refreshToken,
        refreshTokenExpires: {
          gt: new Date(), // Check if not expired
        },
        deletedAt: null, // Ensure user is not deleted
      },
    });

    if (!user) {
      // Invalid or expired refresh token -> force logout
      await removeAuthCookie();
      return NextResponse.json({ error: 'Invalid or expired refresh token' }, { status: 401 });
    }

    // 3. Generate new access token
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      tokenVersion: user.tokenVersion,
    };
    const newAccessToken = await createToken(tokenPayload);

    // 4. Generate new refresh token (Refresh Token Rotation for extra security)
    const newRefreshToken = generateRefreshToken();
    const newRefreshTokenExpires = new Date();
    newRefreshTokenExpires.setDate(newRefreshTokenExpires.getDate() + 30); // +30 days

    // Update user in DB with new refresh token
    await db.user.update({
      where: { id: user.id },
      data: {
        refreshToken: newRefreshToken,
        refreshTokenExpires: newRefreshTokenExpires,
      },
    });

    // 5. Set new cookies
    await setAuthCookie(newAccessToken, newRefreshToken);

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error) {
    console.error('Refresh Token Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
