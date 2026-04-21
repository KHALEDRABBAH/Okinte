/**
 * Rate Limiter — In-Memory Sliding Window
 * 
 * WHY: Prevents brute force attacks on login, registration spam,
 * and contact form abuse. Without this, bots can:
 * - Brute force passwords (unlimited login attempts)
 * - Spam register to fill the database
 * - Flood the contact form to exhaust Resend email quota
 * 
 * HOW: Uses a sliding window counter per IP address.
 * Each IP gets a fixed number of requests per time window.
 * After exceeding the limit, requests are rejected with 429 Too Many Requests.
 * 
 * NOTE: In-memory store works for single-instance Vercel deployments.
 * For multi-region, consider Upstash Redis.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Cleanup old entries every 5 minutes to prevent memory leak
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now > entry.resetAt) {
      store.delete(key);
    }
  }
}, 5 * 60 * 1000);

interface RateLimitConfig {
  maxRequests: number;   // Max requests allowed in the window
  windowMs: number;      // Time window in milliseconds
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;       // Unix timestamp when the window resets
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
  const now = Date.now();
  const existing = store.get(identifier);

  // If no existing entry or window has expired, create a new one
  if (!existing || now > existing.resetAt) {
    store.set(identifier, {
      count: 1,
      resetAt: now + config.windowMs,
    });
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetAt: now + config.windowMs,
    };
  }

  // Window is still active — check if limit exceeded
  if (existing.count >= config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: existing.resetAt,
    };
  }

  // Increment counter
  existing.count++;
  return {
    allowed: true,
    remaining: config.maxRequests - existing.count,
    resetAt: existing.resetAt,
  };
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
} as const;
