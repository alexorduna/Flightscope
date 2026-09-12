import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { InMemoryCache, buildCacheKey } from "../services/cache";

describe("InMemoryCache", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns undefined when the key does not exist", () => {
    const cache = new InMemoryCache<string>(60_000);
    expect(cache.get("nothing")).toBeUndefined();
  });

  it("returns the stored value while it hasn't expired", () => {
    const cache = new InMemoryCache<string>(60_000);
    cache.set("MTY|TIJ|2026-10-01", "result");
    expect(cache.get("MTY|TIJ|2026-10-01")).toBe("result");
  });

  it("expires the value after the TTL", () => {
    const cache = new InMemoryCache<string>(1_000);
    cache.set("k", "v");
    vi.advanceTimersByTime(1_001);
    expect(cache.get("k")).toBeUndefined();
  });

  it("buildCacheKey normalizes origin and destination to uppercase", () => {
    expect(buildCacheKey("mty", "tij", "2026-10-01")).toBe("MTY|TIJ|2026-10-01");
  });
});
