import "server-only";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Safe client IP extraction
export function getClientIp(req: Request): string {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }
  return "127.0.0.1";
}

// In-memory sliding window fallback for local dev when Redis is not configured
class MemoryRateLimiter {
  private hits: Map<string, number[]> = new Map();
  private maxRequests: number;
  private windowMs: number;

  constructor(maxRequests: number, windowSeconds: number) {
    this.maxRequests = maxRequests;
    this.windowMs = windowSeconds * 1000;
  }

  async limit(identifier: string): Promise<{ success: boolean; remaining: number; reset: number }> {
    const now = Date.now();
    const timestamps = this.hits.get(identifier) || [];
    const valid = timestamps.filter((t) => now - t < this.windowMs);

    if (valid.length >= this.maxRequests) {
      return {
        success: false,
        remaining: 0,
        reset: Math.ceil((valid[0] + this.windowMs) / 1000),
      };
    }

    valid.push(now);
    this.hits.set(identifier, valid);

    return {
      success: true,
      remaining: this.maxRequests - valid.length,
      reset: Math.ceil((now + this.windowMs) / 1000),
    };
  }
}

interface RateLimiterInstance {
  limit: (identifier: string) => Promise<{ success: boolean; remaining: number; reset: number }>;
}

function createLimiter(requests: number, windowSeconds: number, prefix: string): RateLimiterInstance {
  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
  const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (upstashUrl && upstashToken && !upstashUrl.includes("your-upstash")) {
    const redis = new Redis({
      url: upstashUrl,
      token: upstashToken,
    });
    return new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(requests, `${windowSeconds} s`),
      prefix: `px:${prefix}`,
    });
  }

  // In-memory fallback
  return new MemoryRateLimiter(requests, windowSeconds);
}

// 1. Registration limiter: 5 requests per 60 seconds per IP
export const registerRateLimiter = createLimiter(5, 60, "register");

// 2. Business inquiry limiter: 5 requests per 60 seconds per IP
export const inquiryRateLimiter = createLimiter(5, 60, "inquiry");

// 3. Spin limiter: 10 requests per 60 seconds per IP
export const spinRateLimiter = createLimiter(10, 60, "spin");

// 4. Analytics events limiter: 60 requests per 60 seconds per IP
export const eventsRateLimiter = createLimiter(60, 60, "events");
