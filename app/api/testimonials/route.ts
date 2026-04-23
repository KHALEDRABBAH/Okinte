export const dynamic = 'force-dynamic';

/**
 * POST /api/testimonials
 * 
 * Handles testimonial/review submissions from users.
 * 
 * FLOW:
 * 1. Authenticate user (logged-in users only)
 * 2. Validate request body with Zod schema (rating 1-5, content 10-500 chars)
 * 3. Apply rate limiting (3 testimonials per 30 minutes per user)
 * 4. Create testimonial record in DB (isApproved=false by default)
 * 5. Return success with testimonial ID
 * 
 * MODERATION: Admin must approve testimonials before they appear publicly.
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { testimonialSchema } from '@/lib/validations';
import { rateLimitAsync } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    // Step 1: Authenticate (testimonials require login)
    const currentUser = await getUserFromRequest(request);
    if (!currentUser) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Step 2: Rate limiting (3 testimonials per 30 minutes per user)
    const rl = await rateLimitAsync(`testimonial:${currentUser.userId}`, {
      maxRequests: 3,
      windowMs: 30 * 60 * 1000,
    });
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Too many testimonials submitted. Please wait before submitting another.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } }
      );
    }

    // Step 3: Parse and validate request body
    const body = await request.json();
    const validation = testimonialSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { rating, content } = validation.data;

    // Step 4: Create testimonial record (not approved by default)
    const testimonial = await db.testimonial.create({
      data: {
        userId: currentUser.userId,
        rating,
        content: content.trim(),
        isApproved: false, // Requires admin approval before display
      },
    });

    // Step 5: Return success
    return NextResponse.json(
      {
        message: 'Thank you for your testimonial! It will be reviewed and published soon.',
        testimonialId: testimonial.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Testimonial submission error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
