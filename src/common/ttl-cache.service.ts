import { Injectable } from '@nestjs/common';

interface CacheEntry {
  value: unknown;
  expiresAt: number;
}

/**
 * Deliberately minimal in-process TTL cache.
 *
 * Why not Redis: the card runs as a single instance and the dataset is tiny,
 * so an external cache would add an extra network hop and a moving part for
 * zero benefit. The service boundary is the same — swapping the implementation
 * for a Redis-backed one (multi-replica deployment) does not touch call sites.
 */
@Injectable()
export class TtlCacheService {
  private readonly store = new Map<string, CacheEntry>();

  async wrap<T>(key: string, ttlMs: number, supplier: () => Promise<T>): Promise<T> {
    const hit = this.store.get(key);
    const now = Date.now();
    if (hit && hit.expiresAt > now) {
      return hit.value as T;
    }
    const value = await supplier();
    this.store.set(key, { value, expiresAt: now + ttlMs });
    return value;
  }

  /** Invalidate all keys with the given prefix (e.g. "skills:" after an endorsement). */
  invalidate(prefix: string): void {
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) {
        this.store.delete(key);
      }
    }
  }

  clear(): void {
    this.store.clear();
  }
}
