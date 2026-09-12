import { describe, it, expect } from "vitest";
import { getMockItineraries } from "../data/mockFlights";

describe("getMockItineraries", () => {
  it("returns several itineraries for the curated MTY-TIJ route", () => {
    const itineraries = getMockItineraries("MTY", "TIJ", "2026-10-01");
    expect(itineraries.length).toBeGreaterThanOrEqual(3);
    expect(itineraries.some((it) => it.stops === 0)).toBe(true);
    expect(itineraries.some((it) => it.stops >= 1)).toBe(true);
  });

  it("is deterministic: the same route and date produce the same result", () => {
    const a = getMockItineraries("GDL", "ORD", "2026-11-15");
    const b = getMockItineraries("GDL", "ORD", "2026-11-15");
    expect(a).toEqual(b);
  });

  it("also generates data for routes that aren't explicitly curated", () => {
    const itineraries = getMockItineraries("HMO", "IAH", "2026-12-25");
    expect(itineraries.length).toBeGreaterThan(0);
    for (const it of itineraries) {
      expect(it.flights[0].departureAirportCode).toBe("HMO");
      expect(it.flights[it.flights.length - 1].arrivalAirportCode).toBe("IAH");
    }
  });
});
