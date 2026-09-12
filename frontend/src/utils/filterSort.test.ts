import { describe, it, expect } from "vitest";
import { filterItineraries, sortItineraries, getAvailableAirlines, DEFAULT_FILTERS } from "./filterSort";
import { SAMPLE_ITINERARIES } from "../test/fixtures";

describe("sortItineraries", () => {
  it("sorts by price ascending", () => {
    const result = sortItineraries(SAMPLE_ITINERARIES, { key: "price", direction: "asc" });
    expect(result.map((it) => it.id)).toEqual(["cheap-direct", "expensive-direct", "one-stop"]);
  });

  it("sorts by price descending", () => {
    const result = sortItineraries(SAMPLE_ITINERARIES, { key: "price", direction: "desc" });
    expect(result.map((it) => it.id)).toEqual(["one-stop", "expensive-direct", "cheap-direct"]);
  });

  it("sorts by duration", () => {
    const result = sortItineraries(SAMPLE_ITINERARIES, { key: "duration", direction: "asc" });
    expect(result.map((it) => it.id)).toEqual(["expensive-direct", "cheap-direct", "one-stop"]);
  });

  it("sorts by number of stops", () => {
    const result = sortItineraries(SAMPLE_ITINERARIES, { key: "stops", direction: "asc" });
    expect(result[result.length - 1].id).toBe("one-stop");
  });

  it("does not mutate the original array", () => {
    const original = [...SAMPLE_ITINERARIES];
    sortItineraries(SAMPLE_ITINERARIES, { key: "price", direction: "desc" });
    expect(SAMPLE_ITINERARIES).toEqual(original);
  });
});

describe("filterItineraries", () => {
  it("returns all itineraries when there are no filters", () => {
    expect(filterItineraries(SAMPLE_ITINERARIES, DEFAULT_FILTERS)).toHaveLength(3);
  });

  it("filters by maximum stops", () => {
    const result = filterItineraries(SAMPLE_ITINERARIES, { ...DEFAULT_FILTERS, maxStops: 0 });
    expect(result.map((it) => it.id)).toEqual(["cheap-direct", "expensive-direct"]);
  });

  it("filters by maximum price", () => {
    const result = filterItineraries(SAMPLE_ITINERARIES, { ...DEFAULT_FILTERS, maxPrice: 3200 });
    expect(result.map((it) => it.id)).toEqual(["cheap-direct"]);
  });

  it("filters by airline", () => {
    const result = filterItineraries(SAMPLE_ITINERARIES, { ...DEFAULT_FILTERS, airlines: ["Volaris"] });
    expect(result.map((it) => it.id)).toEqual(["expensive-direct"]);
  });

  it("combines stops and price filters", () => {
    const result = filterItineraries(SAMPLE_ITINERARIES, { ...DEFAULT_FILTERS, maxStops: 1, maxPrice: 3400 });
    expect(result.map((it) => it.id)).toEqual(["cheap-direct"]);
  });
});

describe("getAvailableAirlines", () => {
  it("returns unique airlines sorted alphabetically", () => {
    expect(getAvailableAirlines(SAMPLE_ITINERARIES)).toEqual(["Aeromexico", "Viva Aerobus", "Volaris"]);
  });
});
