import type { Itinerary } from "../types/flight";
import type { FlightSearchResponse } from "../types/api";
import type { SearchOptions } from "../types/searchOptions";
import { DEFAULT_SEARCH_OPTIONS } from "../types/searchOptions";
import { serializeSearchOptions } from "../utils/parseSearchOptions";
import { InMemoryCache, buildCacheKey } from "./cache";
import { getMockItineraries } from "../data/mockFlights";
import { isSerpApiEnabled, searchFlightsViaSerpApi } from "./serpapi";

const ttlMinutes = Number(process.env.CACHE_TTL_MINUTES) || 30;
const cache = new InMemoryCache<FlightSearchResponse>(ttlMinutes * 60 * 1000);

function optionsCacheKey(options: SearchOptions): string {
  const serialized = serializeSearchOptions(options);
  return Object.entries(serialized)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");
}

function applyClientSideFilters(itineraries: Itinerary[], options: SearchOptions): Itinerary[] {
  if (!options.nonstopOnly) return itineraries;
  return itineraries.filter(
    (itinerary) =>
      itinerary.stops === 0 && (itinerary.returnStops == null || itinerary.returnStops === 0)
  );
}

/**
 * Decision order for every search:
 *   1. In-memory cache (same origin/destination/date/options combo) -> returned as
 *      is, cached=true.
 *   2. If SERPAPI_KEY exists -> try the real API. Any failure (timeout,
 *      network, quota, unexpected response) is logged as a warning and falls
 *      back to mock, without propagating the error or crashing the app.
 *   3. If SerpApi isn't active, or it failed -> mock data (always available).
 * The `source` field in the response documents where the data came from for
 * the UI.
 */
export async function searchFlights(
  origin: string,
  destination: string,
  date: string,
  options: SearchOptions = DEFAULT_SEARCH_OPTIONS
): Promise<FlightSearchResponse> {
  const key = buildCacheKey(origin, destination, date, optionsCacheKey(options));
  const cached = cache.get(key);
  if (cached) {
    return { ...cached, cached: true };
  }

  if (isSerpApiEnabled()) {
    try {
      const itineraries = applyClientSideFilters(await searchFlightsViaSerpApi(origin, destination, date, options), options);
      const response: FlightSearchResponse = {
        origin: origin.toUpperCase(),
        destination: destination.toUpperCase(),
        date,
        itineraries,
        source: "live",
        cached: false,
        preferences: options,
      };
      cache.set(key, response);
      return response;
    } catch (error) {
      console.warn(`[flightService] SerpApi failed, falling back to mock. Cause: ${(error as Error).message}`);
      const response = buildMockResponse(origin, destination, date, options, (error as Error).message);
      cache.set(key, response);
      return response;
    }
  }

  const response = buildMockResponse(origin, destination, date, options);
  cache.set(key, response);
  return response;
}

function buildMockResponse(
  origin: string,
  destination: string,
  date: string,
  options: SearchOptions,
  warning?: string
): FlightSearchResponse {
  let itineraries = applyClientSideFilters(getMockItineraries(origin, destination, date, options), options);
  return {
    origin: origin.toUpperCase(),
    destination: destination.toUpperCase(),
    date,
    itineraries,
    source: "mock",
    cached: false,
    preferences: options,
    ...(warning ? { warning: `SerpApi unavailable (${warning}), showing mock data.` } : {}),
  };
}
