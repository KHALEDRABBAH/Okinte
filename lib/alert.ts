/**
 * Minimal Observability Layer
 * Zero-cost alerts directly to the database and Discord.
 */

import { db } from '@/lib/db';

// Simple in-memory rate limiter for alerts to prevent spamming Discord
// In serverless, this only scopes per isolate, but it's enough to prevent infinite loops
const alertSpamCache = new Map<string, number>();

export async function alertCriticalError(
  entity: 'Webhook' | 'Email' | 'RateLimit' | 'Payment',
  message: string,
  metadata: Record<string, unknown> = {}
) {
  try {
    const now = Date.now();
    const cacheKey = `${entity}:${message}`;
    const lastSent = alertSpamCache.get(cacheKey) || 0;
    
    // Anti-spam cooldown: 1 alert per entity/message every 5 minutes
    if (now - lastSent < 5 * 60 * 1000) {
      return; // Skip alerting
    }
    alertSpamCache.set(cacheKey, now);

    // 1. Log to database for Admin Dashboard
    await (db as any).auditLog.create({
      data: {
        action: 'SYSTEM_ERROR',
        entity,
        newData: { message, ...metadata },
      },
    }).catch((err: unknown) => console.error('Failed to log system error to DB:', err));

    // 2. Ping phone via Discord webhook
    if (process.env.DISCORD_WEBHOOK_URL) {
      await fetch(process.env.DISCORD_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: `🚨 **CRITICAL ${entity.toUpperCase()} FAILURE** 🚨\n**Message:** ${message}\n\`\`\`json\n${JSON.stringify(metadata, null, 2)}\n\`\`\``
        }),
      }).catch((err: unknown) => console.error('Failed to send Discord alert:', err));
    }
  } catch (err: unknown) {
    // NEVER crash the main app if the logger fails
    console.error('CRITICAL LOGGER FAILURE:', err);
  }
}
