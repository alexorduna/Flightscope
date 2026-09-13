import { describe, it, expect } from "vitest";
import { parseSearchOptions } from "../utils/parseSearchOptions";

describe("parseSearchOptions", () => {
  it("defaults to one-way economy with one adult", () => {
    const result = parseSearchOptions({}, "2026-10-01");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.tripType).toBe("one-way");
    expect(result.value.passengers.adults).toBe(1);
    expect(result.value.cabinClass).toBe("economy");
  });

  it("requires a return date for round-trip searches", () => {
    const result = parseSearchOptions({ tripType: "round-trip" }, "2026-10-01");
    expect(result.ok).toBe(false);
  });

  it("rejects more infants than adults", () => {
    const result = parseSearchOptions({ adults: "1", infants: "2" }, "2026-10-01");
    expect(result.ok).toBe(false);
  });
});
