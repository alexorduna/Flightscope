import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../services/serpapi", async () => {
  const actual = await vi.importActual<typeof import("../services/serpapi")>("../services/serpapi");
  return {
    ...actual,
    isSerpApiEnabled: vi.fn(),
    searchFlightsViaSerpApi: vi.fn(),
  };
});

import { searchFlights } from "../services/flightService";
import { isSerpApiEnabled, searchFlightsViaSerpApi } from "../services/serpapi";

describe("searchFlights", () => {
  beforeEach(() => {
    vi.mocked(isSerpApiEnabled).mockReset();
    vi.mocked(searchFlightsViaSerpApi).mockReset();
  });

  it("uses mock data when SerpApi is not active, with no warning", async () => {
    vi.mocked(isSerpApiEnabled).mockReturnValue(false);

    const result = await searchFlights("MTY", "TIJ", "2026-10-01");

    expect(result.source).toBe("mock");
    expect(result.warning).toBeUndefined();
    expect(result.itineraries.length).toBeGreaterThan(0);
  });

  it("falls back to mock with a warning when SerpApi is active but fails", async () => {
    vi.mocked(isSerpApiEnabled).mockReturnValue(true);
    vi.mocked(searchFlightsViaSerpApi).mockRejectedValue(new Error("simulated timeout"));

    const result = await searchFlights("MEX", "CUN", "2026-11-05");

    expect(result.source).toBe("mock");
    expect(result.warning).toContain("simulated timeout");
    expect(result.itineraries.length).toBeGreaterThan(0);
  });

  it("uses the SerpApi response when it's active and responds correctly", async () => {
    vi.mocked(isSerpApiEnabled).mockReturnValue(true);
    vi.mocked(searchFlightsViaSerpApi).mockResolvedValue([
      {
        id: "IT-live-0",
        stops: 0,
        totalPrice: 1000,
        currency: "MXN",
        totalDurationMinutes: 100,
        flights: [
          {
            id: "FL-live-0",
            airline: "Real Airline",
            flightNumber: "AR 1",
            departureAirportCode: "GDL",
            departureTime: "2026-12-01T06:00:00.000Z",
            arrivalAirportCode: "LAX",
            arrivalTime: "2026-12-01T07:40:00.000Z",
            durationMinutes: 100,
            aircraft: "Airbus A320",
          },
        ],
      },
    ]);

    const result = await searchFlights("GDL", "LAX", "2026-12-01");

    expect(result.source).toBe("live");
    expect(result.itineraries[0].id).toBe("IT-live-0");
  });

  it("marks cached=true when the same search was already cached", async () => {
    vi.mocked(isSerpApiEnabled).mockReturnValue(false);

    const first = await searchFlights("MID", "CUL", "2026-10-20");
    const second = await searchFlights("MID", "CUL", "2026-10-20");

    expect(first.cached).toBe(false);
    expect(second.cached).toBe(true);
  });
});
