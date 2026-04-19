export const dynamic = 'force-dynamic';

/**
 * PATCH /api/auth/profile
 *
 * Updates the current user's profile fields (phone, country, city).
 * Only authenticated users can update their own profile.
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { profileUpdateSchema } from '@/lib/validations';

export async function PATCH(request: NextRequest) {
  try {
    const currentUser = await getUserFromRequest(request);
    if (!currentUser) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const validation = profileUpdateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { firstName, lastName, phone, country, city, avatarUrl } = validation.data;

    // Check phone uniqueness if phone is being updated
    if (phone) {
      const existingPhone = await db.user.findFirst({
        where: {
          phone,
          id: { not: currentUser.userId }, // exclude current user
        },
      });
      if (existingPhone) {
        return NextResponse.json(
          { error: 'This phone number is already registered to another account', details: { phone: ['This phone number is already in use.'] } },
          { status: 409 }
        );
      }
    }

    // Build update data — only include provided fields
    const updateData: Record<string, string> = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (phone) updateData.phone = phone;
    if (country) updateData.country = country;
    if (city) updateData.city = city;
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;

    const updatedUser = await db.user.update({
      where: { id: currentUser.userId },
      data: updateData,
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
        createdAt: true,
      },
    });

    return NextResponse.json({ user: updatedUser });

  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: 'Unable to update profile. Please try again.' },
      { status: 500 }
    );
  }
}
