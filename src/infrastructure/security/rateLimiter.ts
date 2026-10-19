import type { Request, Response, NextFunction } from 'express';
import { RateLimitExceededError } from '../../domain/errors/DomainErrors.js';

interface RateLimitRecord {
  timestamps: number[];
}

export interface RateLimiterOptions {
  windowMs: number;
  maxRequests: number;
  keyGenerator?: (req: Request) => string;
}

/**
 * High-performance, zero-dependency in-memory sliding window rate limiter.
 * Protects event planning endpoints against denial of service and API abuse.
 */
export class InMemoryRateLimiter {
  private readonly hits = new Map<string, RateLimitRecord>();
  private readonly windowMs: number;
  private readonly maxRequests: number;
  private readonly keyGenerator: (req: Request) => string;
  private cleanupTimer: NodeJS.Timeout | null = null;

  constructor(options: RateLimiterOptions) {
    this.windowMs = options.windowMs;
    this.maxRequests = options.maxRequests;
    this.keyGenerator =
      options.keyGenerator ??
      ((req: Request): string => {
        const forwarded = req.headers['x-forwarded-for'];
        if (typeof forwarded === 'string') {
          return forwarded.split(',')[0]?.trim() ?? req.ip ?? 'unknown';
        }
        return req.ip ?? req.socket.remoteAddress ?? 'unknown';
      });

    // Run garbage collection every half window to prune expired IPs
    this.cleanupTimer = setInterval(() => this.cleanup(), Math.max(this.windowMs / 2, 60000));
    if (this.cleanupTimer.unref) {
      this.cleanupTimer.unref();
    }
  }

  public middleware() {
    return (req: Request, res: Response, next: NextFunction): void => {
      const now = Date.now();
      const clientKey = this.keyGenerator(req);
      const cutoff = now - this.windowMs;

      let record = this.hits.get(clientKey);
      if (!record) {
        record = { timestamps: [] };
        this.hits.set(clientKey, record);
      }

      // Filter timestamps outside current rolling window
      record.timestamps = record.timestamps.filter((ts) => ts > cutoff);

      if (record.timestamps.length >= this.maxRequests) {
        const retryAfterSeconds = Math.ceil((record.timestamps[0]! + this.windowMs - now) / 1000);
        res.setHeader('X-RateLimit-Limit', this.maxRequests);
        res.setHeader('X-RateLimit-Remaining', 0);
        res.setHeader('X-RateLimit-Reset', Math.ceil((now + this.windowMs) / 1000));
        res.setHeader('Retry-After', retryAfterSeconds);
        return next(
          new RateLimitExceededError(
            `Rate limit exceeded: Maximum ${this.maxRequests} requests per ${this.windowMs / 1000}s allowed.`
          )
        );
      }

      // Record this request
      record.timestamps.push(now);

      const remaining = Math.max(0, this.maxRequests - record.timestamps.length);
      const resetTime = Math.ceil((now + this.windowMs) / 1000);

      // Set RFC-compliant RateLimit response headers
      res.setHeader('X-RateLimit-Limit', this.maxRequests);
      res.setHeader('X-RateLimit-Remaining', remaining);
      res.setHeader('X-RateLimit-Reset', resetTime);

      next();
    };
  }

  private cleanup(): void {
    const now = Date.now();
    const cutoff = now - this.windowMs;
    for (const [key, record] of this.hits.entries()) {
      record.timestamps = record.timestamps.filter((ts) => ts > cutoff);
      if (record.timestamps.length === 0) {
        this.hits.delete(key);
      }
    }
  }

  public reset(): void {
    this.hits.clear();
  }

  public destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
    this.hits.clear();
  }
}
