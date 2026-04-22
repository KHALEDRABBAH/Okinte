export const dynamic = 'force-dynamic';

/**
 * POST /api/promo/validate
 * Validates a promo code and returns discount info.
 * Used by frontend before checkout to show discount preview.
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    // Authentication required to prevent promo code enumeration
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting: 10 promo validations per minute per user
    const rl = rateLimit(`promo:${user.userId}`, { maxRequests: 10, windowMs: 60 * 1000 });
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Too many attempts. Please wait.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { code, originalPrice } = body;

    if (!code) {
      return NextResponse.json({ error: 'Promo code is required' }, { status: 400 });
    }

    const promo = await db.promoCode.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!promo) {
      return NextResponse.json({ error: 'Invalid promo code' }, { status: 404 });
    }

    if (!promo.isActive) {
      return NextResponse.json({ error: 'This promo code is no longer active' }, { status: 410 });
    }

    if (promo.expiresAt && new Date() > promo.expiresAt) {
      return NextResponse.json({ error: 'This promo code has expired' }, { status: 410 });
    }

    if (promo.maxUses && promo.currentUses >= promo.maxUses) {
      return NextResponse.json({ error: 'This promo code has reached its usage limit' }, { status: 410 });
    }

    // Calculate discount
    const price = originalPrice ? Number(originalPrice) : 150;
    let discount = 0;

    if (promo.type === 'PERCENTAGE') {
      discount = Math.round((price * Number(promo.value)) / 100 * 100) / 100;
    } else {
      discount = Math.min(Number(promo.value), price);
    }

    const finalPrice = Math.max(0, price - discount);

    return NextResponse.json({
      valid: true,
      code: promo.code,
      type: promo.type,
      value: Number(promo.value),
      discount,
      finalPrice,
    });
  } catch (error) {
    console.error('Promo validation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
