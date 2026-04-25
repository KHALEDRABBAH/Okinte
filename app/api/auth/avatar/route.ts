export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { uploadFile, deleteFile } from '@/lib/storage';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getUserFromRequest(request);
    if (!currentUser) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'File must be an image (JPG, PNG, WEBP)' }, { status: 400 });
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File must be less than 5MB' }, { status: 400 });
    }

    const user = await db.user.findFirst({
      where: { id: currentUser.userId, deletedAt: null },
      select: { avatarUrl: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const storagePath = `users/${currentUser.userId}/avatar_${Date.now()}.${ext}`;

    const { path, error: uploadError } = await uploadFile(buffer, storagePath, file.type);

    if (uploadError || !path) {
      return NextResponse.json({ error: `Upload failed: ${uploadError || 'Unknown error'}` }, { status: 500 });
    }

    let updatedUser;
    try {
      updatedUser = await db.user.update({
        where: { id: currentUser.userId },
        data: { avatarUrl: path },
        select: {
          id: true, firstName: true, lastName: true, email: true, phone: true,
          country: true, city: true, role: true, avatarUrl: true, createdAt: true
        }
      });
      
      // Cleanup old avatar if exists and path changed
      if (user.avatarUrl && user.avatarUrl !== path) {
        await deleteFile(user.avatarUrl).catch(err => console.error('Failed to delete old avatar:', err));
      }
    } catch (dbErr) {
      console.error('Failed to update user avatarUrl in DB. Cleaning up uploaded avatar from storage.', dbErr);
      await deleteFile(path);
      return NextResponse.json({ error: 'Failed to update avatar. Please try again.' }, { status: 500 });
    }

    return NextResponse.json({ user: updatedUser }, { status: 200 });

  } catch (error) {
    console.error('Avatar upload error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
