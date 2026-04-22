export const dynamic = 'force-dynamic';

/**
 * GET /api/cron/cleanup
 * 
 * Cron job that runs daily at 3:00 AM UTC.
 * Deletes webhook events older than 90 days to prevent unbounded table growth.
 * 
 * Protected by CRON_SECRET to prevent unauthorized access.
 * Configure in vercel.json:
 *   { "crons": [{ "path": "/api/cron/cleanup", "schedule": "0 3 * * *" }] }
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret (Vercel sends this automatically for cron jobs)
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    // Delete webhook events older than 90 days
    const deleted = await db.webhookEvent.deleteMany({
      where: {
        processedAt: { lt: ninetyDaysAgo },
      },
    });

    console.log(`[Cron] Cleaned up ${deleted.count} webhook events older than 90 days`);

    return NextResponse.json({
      success: true,
      deletedCount: deleted.count,
      cutoffDate: ninetyDaysAgo.toISOString(),
    });

  } catch (error) {
    console.error('[Cron] Cleanup error:', error);
    return NextResponse.json({ error: 'Cleanup failed' }, { status: 500 });
  }
}
