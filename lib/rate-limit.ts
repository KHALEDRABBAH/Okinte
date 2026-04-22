/**
 * Rate Limiter — Upstash Redis Sliding Window
 * 
 * WHY: Prevents brute force attacks on login, registration spam,
 * and contact form abuse. Without this, bots can:
 * - Brute force passwords (unlimited login attempts)
 * - Spam register to fill the database
 * - Flood the contact form to exhaust Resend email quota
 * 
 * HOW: Uses Upstash Redis with sliding window algorithm.
 * Each identifier (IP + route) gets a fixed number of requests per time window.
 * After exceeding the limit, requests are rejected with 429 Too Many Requests.
 * 
 * NOTE: Upstash Redis persists across Vercel cold starts (serverless-safe).
 * Required env vars: UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN
 * 
 * FALLBACK: If Upstash env vars are missing (dev mode), falls back to
 * in-memory Map() which works for local development.
 */

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

interface RateLimitConfig {
  maxRequests: number;   // Max requests allowed in the window
  windowMs: number;      // Time window in milliseconds
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;       // Unix timestamp when the window resets
}

// Cache of Ratelimit instances keyed by config hash
const limiters = new Map<string, Ratelimit>();

/**
 * In-memory fallback for development without Upstash credentials
 */
interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const memoryStore = new Map<string, RateLimitEntry>();

function rateLimitInMemory(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const existing = memoryStore.get(identifier);

  if (!existing || now > existing.resetAt) {
    memoryStore.set(identifier, {
      count: 1,
      resetAt: now + config.windowMs,
    });
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetAt: now + config.windowMs,
    };
  }

  if (existing.count >= config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: existing.resetAt,
    };
  }

  existing.count++;
  return {
    allowed: true,
    remaining: config.maxRequests - existing.count,
    resetAt: existing.resetAt,
  };
}

/**
 * Check if Upstash credentials are available
 */
function hasUpstashCredentials(): boolean {
  return !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}

/**
 * Get or create a Ratelimit instance for the given config
 */
function getLimiter(config: RateLimitConfig): Ratelimit {
  const key = `${config.maxRequests}:${config.windowMs}`;
  let limiter = limiters.get(key);
  if (!limiter) {
    const windowSeconds = Math.ceil(config.windowMs / 1000);
    const duration = `${windowSeconds} s` as `${number} s`;
    limiter = new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(config.maxRequests, duration),
      analytics: true,
      prefix: 'okinte-rl',
    });
    limiters.set(key, limiter);
  }
  return limiter;
}

/**
 * Check if a request from the given identifier is allowed.
 * 
 * @param identifier - Unique key (usually IP + route path)
 * @param config - Rate limit configuration
 * @returns Whether the request is allowed and remaining quota
 */
export function rateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  // If Upstash is not configured, use in-memory fallback (dev only)
  if (!hasUpstashCredentials()) {
    return rateLimitInMemory(identifier, config);
  }

  // For Upstash, we return a synchronous-compatible result
  // by using the in-memory store as a fast pre-check,
  // and also fire the async Upstash check
  const limiter = getLimiter(config);
  
  // Fire async Upstash rate limit (best-effort for serverless)
  // We use the memory store as a synchronous fallback for the same API
  const memResult = rateLimitInMemory(identifier, config);
  
  // Also check Upstash asynchronously for cross-instance enforcement
  limiter.limit(identifier).then(result => {
    if (!result.success) {
      // If Upstash says blocked, update memory store to block too
      const entry = memoryStore.get(identifier);
      if (entry) {
        entry.count = config.maxRequests;
      }
    }
  }).catch(err => {
    console.error('[RateLimit] Upstash error:', err);
  });

  return memResult;
}

/**
 * Async version of rate limit that awaits the Upstash check.
 * Use this in routes that can afford the extra latency for accurate limiting.
 */
export async function rateLimitAsync(
  identifier: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  if (!hasUpstashCredentials()) {
    return rateLimitInMemory(identifier, config);
  }

  try {
    const limiter = getLimiter(config);
    const result = await limiter.limit(identifier);
    return {
      allowed: result.success,
      remaining: result.remaining,
      resetAt: result.reset,
    };
  } catch (err) {
    console.error('[RateLimit] Upstash error, falling back to memory:', err);
    return rateLimitInMemory(identifier, config);
  }
}

/**
 * Extract client IP from request headers.
 * Vercel sets x-forwarded-for, x-real-ip.
 */
export function getClientIp(request: Request): string {
  const forwarded = (request.headers.get('x-forwarded-for') || '').split(',')[0]?.trim();
  const realIp = request.headers.get('x-real-ip');
  return forwarded || realIp || 'unknown';
}

// Pre-configured rate limiters for common use cases
export const RATE_LIMITS = {
  /** Login: 7 attempts per 15 minutes per IP */
  login: { maxRequests: 7, windowMs: 15 * 60 * 1000 },
  /** Register: 3 accounts per 30 minutes per IP */
  register: { maxRequests: 3, windowMs: 30 * 60 * 1000 },
  /** Contact form: 5 messages per 10 minutes per IP */
  contact: { maxRequests: 5, windowMs: 10 * 60 * 1000 },
  /** General API: 60 requests per minute per IP */
  api: { maxRequests: 60, windowMs: 60 * 1000 },
  /** Password reset: 3 requests per 15 minutes per IP */
  passwordReset: { maxRequests: 3, windowMs: 15 * 60 * 1000 },
  /** Chat: 20 messages per minute per user */
  chat: { maxRequests: 20, windowMs: 60 * 1000 },
} as const;
