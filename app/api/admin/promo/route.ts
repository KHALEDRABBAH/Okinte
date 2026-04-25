export const dynamic = 'force-dynamic';

/**
 * Admin Promo Code Management
 * GET    — List all promo codes
 * POST   — Create new promo code
 * PATCH  — Toggle active/inactive
 * DELETE — Delete promo code
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest, verifyAdminRole } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getUserFromRequest(request);
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }
    const isAdmin = await verifyAdminRole(currentUser.userId);
    if (!isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const promoCodes = await db.promoCode.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ promoCodes });
  } catch (error) {
    console.error('Admin promo list error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getUserFromRequest(request);
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }
    // Re-verify admin role from DB (JWT role could be stale)
    const freshUser = await db.user.findFirst({
      where: { id: currentUser.userId, deletedAt: null },
      select: { role: true },
    });
    if (freshUser?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { code, type, value, maxUses, expiresAt } = body;

    if (!code || !type || value === undefined) {
      return NextResponse.json({ error: 'code, type, and value are required' }, { status: 400 });
    }

    if (!['PERCENTAGE', 'FIXED'].includes(type)) {
      return NextResponse.json({ error: 'type must be PERCENTAGE or FIXED' }, { status: 400 });
    }

    if (type === 'PERCENTAGE' && (value <= 0 || value > 100)) {
      return NextResponse.json({ error: 'Percentage must be between 1 and 100' }, { status: 400 });
    }

    // Check for duplicate code
    const existing = await db.promoCode.findUnique({ where: { code: code.toUpperCase() } });
    if (existing) {
      return NextResponse.json({ error: 'Promo code already exists' }, { status: 409 });
    }

    const promoCode = await db.promoCode.create({
      data: {
        code: code.toUpperCase(),
        type,
        value,
        maxUses: maxUses || null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        isActive: true,
      },
    });

    return NextResponse.json({ promoCode }, { status: 201 });
  } catch (error) {
    console.error('Admin promo create error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const currentUser = await getUserFromRequest(request);
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }
    // Re-verify admin role from DB (JWT role could be stale)
    const freshUser = await db.user.findFirst({
      where: { id: currentUser.userId, deletedAt: null },
      select: { role: true },
    });
    if (freshUser?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { id, isActive } = body;

    if (!id || isActive === undefined) {
      return NextResponse.json({ error: 'id and isActive are required' }, { status: 400 });
    }

    const promoCode = await db.promoCode.update({
      where: { id },
      data: { isActive },
    });

    return NextResponse.json({ promoCode });
  } catch (error) {
    console.error('Admin promo update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const currentUser = await getUserFromRequest(request);
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }
    // Re-verify admin role from DB (JWT role could be stale)
    const freshUser = await db.user.findFirst({
      where: { id: currentUser.userId, deletedAt: null },
      select: { role: true },
    });
    if (freshUser?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    await db.promoCode.delete({ where: { id } });

    return NextResponse.json({ message: 'Promo code deleted' });
  } catch (error) {
    console.error('Admin promo delete error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
