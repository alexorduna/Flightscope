import { describe, it, expect } from "vitest";
import { getMockNearbyPrices } from "../data/mockFlights";

describe("getMockNearbyPrices", () => {
  it("returns a price window centered on the requested date", () => {
    const prices = getMockNearbyPrices("MTY", "TIJ", "2030-06-15", 3);
    expect(prices).toHaveLength(7);
    expect(prices.map((entry) => entry.date)).toEqual([
      "2030-06-12",
      "2030-06-13",
      "2030-06-14",
      "2030-06-15",
      "2030-06-16",
      "2030-06-17",
      "2030-06-18",
    ]);
    expect(prices.every((entry) => entry.lowestPrice == null || entry.lowestPrice > 0)).toBe(true);
  });
});
