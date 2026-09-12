import type { PriceInsightsResponse } from "../types/api";
import { InMemoryCache, buildCacheKey } from "./cache";
import { getMockPriceHistory, getMockItineraries } from "../data/mockFlights";
import { isSerpApiEnabled, fetchPriceInsightsViaSerpApi } from "./serpapi";

const ttlMinutes = Number(process.env.CACHE_TTL_MINUTES) || 30;
const cache = new InMemoryCache<PriceInsightsResponse>(ttlMinutes * 60 * 1000);

/** Same strategy as flightService: cache -> SerpApi (if active) -> mock. */
export async function getPriceInsights(origin: string, destination: string, date: string): Promise<PriceInsightsResponse> {
  const key = `insights|${buildCacheKey(origin, destination, date)}`;
  const cached = cache.get(key);
  if (cached) return cached;

  if (isSerpApiEnabled()) {
    try {
      const { typicalPriceRange, history } = await fetchPriceInsightsViaSerpApi(origin, destination, date);
      const response: PriceInsightsResponse = {
        origin: origin.toUpperCase(),
        destination: destination.toUpperCase(),
        currency: "MXN",
        typicalPriceRange,
        history,
        source: "live",
      };
      cache.set(key, response);
      return response;
    } catch (error) {
      console.warn(`[priceInsightsService] SerpApi failed, falling back to mock. Cause: ${(error as Error).message}`);
      const response = buildMockInsights(origin, destination, date, (error as Error).message);
      cache.set(key, response);
      return response;
    }
  }

  const response = buildMockInsights(origin, destination, date);
  cache.set(key, response);
  return response;
}

function buildMockInsights(origin: string, destination: string, date: string, warning?: string): PriceInsightsResponse {
  const history = getMockPriceHistory(origin, destination, date);
  const itineraries = getMockItineraries(origin, destination, date);
  const prices = itineraries.map((it) => it.totalPrice);
  return {
    origin: origin.toUpperCase(),
    destination: destination.toUpperCase(),
    currency: "MXN",
    typicalPriceRange: { low: Math.min(...prices), high: Math.max(...prices) },
    history,
    source: "mock",
    ...(warning ? { warning: `SerpApi unavailable (${warning}), showing mock trend.` } : {}),
  };
}
