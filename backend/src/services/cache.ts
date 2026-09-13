/**
 * Simple in-memory cache (Map) keyed by search (origin/destination/date).
 * Goal: avoid burning through SerpApi's 250 free searches/month once it's
 * active. It's fully lost on process restart - that's intentional, there is
 * no persistence in this project.
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

export class InMemoryCache<T> {
  private store = new Map<string, CacheEntry<T>>();

  constructor(private ttlMs: number) {}

  get(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return undefined;
    }
    return entry.value;
  }

  set(key: string, value: T): void {
    this.store.set(key, { value, expiresAt: Date.now() + this.ttlMs });
  }

  size(): number {
    return this.store.size;
  }
}

export function buildCacheKey(origin: string, destination: string, date: string, optionsKey = ""): string {
  const base = `${origin.toUpperCase()}|${destination.toUpperCase()}|${date}`;
  return optionsKey ? `${base}|${optionsKey}` : base;
}
