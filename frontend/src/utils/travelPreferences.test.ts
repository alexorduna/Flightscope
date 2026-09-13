import { describe, expect, it } from "vitest";
import { validateTravelPreferences } from "./travelPreferences";
import { DEFAULT_TRAVEL_PREFERENCES } from "../types/travelPreferences";

describe("validateTravelPreferences", () => {
  it("requires a return date for round-trip searches", () => {
    expect(
      validateTravelPreferences({ ...DEFAULT_TRAVEL_PREFERENCES, tripType: "round-trip", returnDate: null }, "2026-10-01")
    ).toMatch(/return date/i);
  });

  it("rejects more infants than adults", () => {
    expect(
      validateTravelPreferences(
        {
          ...DEFAULT_TRAVEL_PREFERENCES,
          passengers: { adults: 1, children: 0, infants: 2 },
        },
        "2026-10-01"
      )
    ).toMatch(/lap infant/i);
  });

  it("allows more children than adults", () => {
    expect(
      validateTravelPreferences(
        {
          ...DEFAULT_TRAVEL_PREFERENCES,
          passengers: { adults: 2, children: 3, infants: 0 },
        },
        "2026-10-01"
      )
    ).toBeNull();
  });
});
