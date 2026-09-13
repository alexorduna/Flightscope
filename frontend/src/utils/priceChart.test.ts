import { describe, expect, it } from "vitest";
import { buildYTicks, computeChartBounds } from "./priceChart";

describe("computeChartBounds", () => {
  it("pads flat price history instead of stretching to a distant typical range", () => {
    const bounds = computeChartBounds([2188, 2188, 2813], 2739, 6368);
    expect(bounds.max - bounds.min).toBeLessThan(2000);
    expect(bounds.min).toBeLessThan(2188);
    expect(bounds.max).toBeGreaterThan(2813);
  });

  it("includes typical range when it overlaps the data", () => {
    const bounds = computeChartBounds([3000, 3200, 3100], 2900, 3400);
    expect(bounds.min).toBeLessThanOrEqual(2900);
    expect(bounds.max).toBeGreaterThanOrEqual(3400);
  });
});

describe("buildYTicks", () => {
  it("returns evenly spaced ticks", () => {
    expect(buildYTicks(0, 100, 3)).toEqual([0, 50, 100]);
  });
});
