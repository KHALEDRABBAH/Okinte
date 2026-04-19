export const dynamic = 'force-dynamic';

/**
 * GET /api/services
 * 
 * Returns all active services with their current prices.
 * Used by frontend to display dynamic pricing.
 */
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const services = await db.service.findMany({
      where: { isActive: true },
      select: {
        id: true,
        key: true,
        price: true,
      },
      orderBy: { key: 'asc' },
    });

    return NextResponse.json({ services });
  } catch (error) {
    console.error('Failed to fetch services:', error);
    return NextResponse.json({ error: 'Failed to fetch services' }, { status: 500 });
  }
}
