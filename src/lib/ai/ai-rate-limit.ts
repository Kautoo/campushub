import "server-only";

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

/**
 * In-memory sliding window rate limiter for CampusHub AI endpoints.
 * Enforces usage limits and shields the Astropods gateway from abuse.
 *
 * @param identifier Unique client identifier (token, user ID, or IP address)
 * @param maxRequests Maximum requests permitted within the window (default: 30)
 * @param windowMs Window duration in milliseconds (default: 60,000ms = 1 min)
 */
export function checkAiRateLimit(
  identifier: string,
  maxRequests = 30,
  windowMs = 60000
): { allowed: boolean; remaining: number; retryAfterSec: number } {
  const now = Date.now();
  const record = rateLimitStore.get(identifier);

  if (!record || now > record.resetAt) {
    rateLimitStore.set(identifier, {
      count: 1,
      resetAt: now + windowMs,
    });
    return {
      allowed: true,
      remaining: maxRequests - 1,
      retryAfterSec: Math.ceil(windowMs / 1000),
    };
  }

  if (record.count >= maxRequests) {
    const retryAfterSec = Math.max(1, Math.ceil((record.resetAt - now) / 1000));
    return {
      allowed: false,
      remaining: 0,
      retryAfterSec,
    };
  }

  record.count += 1;
  const retryAfterSec = Math.max(1, Math.ceil((record.resetAt - now) / 1000));
  return {
    allowed: true,
    remaining: maxRequests - record.count,
    retryAfterSec,
  };
}

/**
 * Resets rate limit store (useful for automated testing suites).
 */
export function resetAiRateLimitStore(): void {
  rateLimitStore.clear();
}
