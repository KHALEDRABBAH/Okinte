export const dynamic = 'force-dynamic';

/**
 * GET /api/documents/[id]
 * 
 * WHAT: Returns a time-limited signed URL for viewing a document
 * 
 * FLOW:
 * 1. Verify user is authenticated
 * 2. Find document by ID
 * 3. Verify the user owns the document (or is admin)
 * 4. Generate a signed URL from Supabase Storage (expires in 1 hour)
 * 5. Return the signed URL
 * 
 * WHY SIGNED URLS?
 * The storage bucket is PRIVATE — files can't be accessed directly.
 * A signed URL is a temporary link that includes a cryptographic token.
 * After 1 hour, the token expires and the URL stops working.
 * This means even if someone captures the URL, it's only valid briefly.
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { getSignedUrl } from '@/lib/storage';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Step 1: Authenticate
    const currentUser = await getUserFromRequest(request);
    if (!currentUser) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Step 2: Find document
    const document = await db.document.findFirst({
      where: { id, deletedAt: null },
    });

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Step 3: Security check — owner or admin only
    if (document.userId !== currentUser.userId && currentUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Step 4: Generate signed URL (expires in 1 hour)
    const signedUrl = await getSignedUrl(document.storagePath, 3600);

    if (!signedUrl) {
      return NextResponse.json({ error: 'Failed to generate download URL' }, { status: 500 });
    }

    // Step 5: Redirect to the signed URL for direct viewing/downloading
    return NextResponse.redirect(signedUrl);

  } catch (error) {
    console.error('Document URL error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
