import crypto from 'node:crypto';
import type { PlanGenerationRequest } from '../../domain/services/IEventPlannerService.js';

interface CacheEntry<T> {
  key: string;
  value: T;
  createdAt: number;
  expiresAt: number;
  accessCount: number;
}

export interface CacheOptions {
  maxEntries?: number;
  defaultTtlMs?: number;
}

export interface CacheStats {
  size: number;
  capacity: number;
  hits: number;
  misses: number;
  evictions: number;
}

/**
 * High-performance In-Memory LRU + TTL Cache for GenAI prompts and generated plans.
 * Prevents redundant Gemini API calls for identical celebration planning requests.
 */
export class PlanLruCache<T> {
  private readonly capacity: number;
  private readonly defaultTtlMs: number;
  private readonly store = new Map<string, CacheEntry<T>>();

  private _hits = 0;
  private _misses = 0;
  private _evictions = 0;

  constructor(options: CacheOptions = {}) {
    this.capacity = options.maxEntries ?? 100;
    this.defaultTtlMs = options.defaultTtlMs ?? 1000 * 60 * 60; // 1 hour default TTL
  }

  /**
   * Deterministically generates a cryptographic SHA-256 cache key from request parameters.
   */
  public generateKey(request: PlanGenerationRequest): string {
    const canonicalObject = {
      eventType: request.eventType,
      title: request.title.trim().toLowerCase(),
      date: typeof request.date === 'string' ? request.date : request.date.toISOString(),
      guestCount: request.guestCount,
      budgetLimit: request.budgetLimit,
      currency: request.currency.toUpperCase().trim(),
      userPreferences: (request.userPreferences ?? '').trim().toLowerCase(),
      culturalContext: (request.culturalContext ?? '').trim().toLowerCase(),
    };

    const serialized = JSON.stringify(canonicalObject, Object.keys(canonicalObject).sort());
    return crypto.createHash('sha256').update(serialized).digest('hex');
  }

  /**
   * Retrieves an item from cache, enforcing TTL and refreshing LRU position.
   */
  public get(key: string): T | null {
    const entry = this.store.get(key);

    if (!entry) {
      this._misses++;
      return null;
    }

    // Check expiration
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      this._misses++;
      return null;
    }

    // Refresh LRU order (delete & re-insert)
    this.store.delete(key);
    entry.accessCount++;
    this.store.set(key, entry);

    this._hits++;
    return entry.value;
  }

  /**
   * Caches a value with LRU eviction and TTL.
   */
  public set(key: string, value: T, customTtlMs?: number): void {
    const now = Date.now();
    const ttl = customTtlMs ?? this.defaultTtlMs;

    // If key already exists, delete it first to reset order
    if (this.store.has(key)) {
      this.store.delete(key);
    } else if (this.store.size >= this.capacity) {
      // Evict least-recently used (the first item in Map keys iterator)
      const oldestKey = this.store.keys().next().value;
      if (oldestKey) {
        this.store.delete(oldestKey);
        this._evictions++;
      }
    }

    this.store.set(key, {
      key,
      value,
      createdAt: now,
      expiresAt: now + ttl,
      accessCount: 1,
    });
  }

  /**
   * Checks whether a non-expired entry exists for the key.
   */
  public has(key: string): boolean {
    const entry = this.store.get(key);
    if (!entry) return false;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return false;
    }
    return true;
  }

  /**
   * Purges expired entries from the cache.
   */
  public pruneExpired(): number {
    const now = Date.now();
    let pruned = 0;
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.expiresAt) {
        this.store.delete(key);
        pruned++;
      }
    }
    return pruned;
  }

  public clear(): void {
    this.store.clear();
    this._hits = 0;
    this._misses = 0;
    this._evictions = 0;
  }

  public get stats(): CacheStats {
    return {
      size: this.store.size,
      capacity: this.capacity,
      hits: this._hits,
      misses: this._misses,
      evictions: this._evictions,
    };
  }
}
