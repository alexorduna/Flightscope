import { describe, it, expect } from "vitest";
import { getMockItineraries } from "../data/mockFlights";

describe("getMockItineraries round-trip", () => {
  it("attaches return legs when trip type is round-trip", () => {
    const itineraries = getMockItineraries("MTY", "TIJ", "2030-06-15", {
      tripType: "round-trip",
      returnDate: "2030-06-22",
    });

    expect(itineraries.length).toBeGreaterThan(0);
    expect(itineraries[0].returnFlights?.length).toBeGreaterThan(0);
    expect(itineraries[0].returnFlights?.[0].departureAirportCode).toBe("TIJ");
    expect(itineraries[0].returnFlights?.at(-1)?.arrivalAirportCode).toBe("MTY");
    expect(itineraries[0].totalPrice).toBeGreaterThan(3000);
  });
});
