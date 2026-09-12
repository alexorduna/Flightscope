import type { Itinerary } from "../types/flight";
import type { FlightSearchResponse } from "../types/api";
import { InMemoryCache, buildCacheKey } from "./cache";
import { getMockItineraries } from "../data/mockFlights";
import { isSerpApiEnabled, searchFlightsViaSerpApi } from "./serpapi";

const ttlMinutes = Number(process.env.CACHE_TTL_MINUTES) || 30;
const cache = new InMemoryCache<FlightSearchResponse>(ttlMinutes * 60 * 1000);

/**
 * Decision order for every search:
 *   1. In-memory cache (same origin/destination/date combo) -> returned as
 *      is, cached=true.
 *   2. If SERPAPI_KEY exists -> try the real API. Any failure (timeout,
 *      network, quota, unexpected response) is logged as a warning and falls
 *      back to mock, without propagating the error or crashing the app.
 *   3. If SerpApi isn't active, or it failed -> mock data (always available).
 * The `source` field in the response documents where the data came from for
 * the UI.
 */
export async function searchFlights(origin: string, destination: string, date: string): Promise<FlightSearchResponse> {
  const key = buildCacheKey(origin, destination, date);
  const cached = cache.get(key);
  if (cached) {
    return { ...cached, cached: true };
  }

  if (isSerpApiEnabled()) {
    try {
      const itineraries = await searchFlightsViaSerpApi(origin, destination, date);
      const response: FlightSearchResponse = {
        origin: origin.toUpperCase(),
        destination: destination.toUpperCase(),
        date,
        itineraries,
        source: "live",
        cached: false,
      };
      cache.set(key, response);
      return response;
    } catch (error) {
      console.warn(`[flightService] SerpApi failed, falling back to mock. Cause: ${(error as Error).message}`);
      const response = buildMockResponse(origin, destination, date, (error as Error).message);
      cache.set(key, response);
      return response;
    }
  }

  const response = buildMockResponse(origin, destination, date);
  cache.set(key, response);
  return response;
}

function buildMockResponse(origin: string, destination: string, date: string, warning?: string): FlightSearchResponse {
  const itineraries: Itinerary[] = getMockItineraries(origin, destination, date);
  return {
    origin: origin.toUpperCase(),
    destination: destination.toUpperCase(),
    date,
    itineraries,
    source: "mock",
    cached: false,
    ...(warning ? { warning: `SerpApi unavailable (${warning}), showing mock data.` } : {}),
  };
}
