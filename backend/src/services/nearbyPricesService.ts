import type { NearbyPricesResponse } from "../types/api";
import { getMockNearbyPrices } from "../data/mockFlights";
import { InMemoryCache, buildCacheKey } from "./cache";
import { fetchLowestPriceForDateViaSerpApi, isSerpApiEnabled } from "./serpapi";

const DEFAULT_WINDOW_DAYS = 3;
const ttlMinutes = Number(process.env.CACHE_TTL_MINUTES) || 30;
const cache = new InMemoryCache<NearbyPricesResponse>(ttlMinutes * 60 * 1000);

function addDaysIso(date: string, days: number): string {
  const base = new Date(`${date}T00:00:00.000Z`);
  base.setUTCDate(base.getUTCDate() + days);
  return base.toISOString().slice(0, 10);
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function getNearbyPrices(
  origin: string,
  destination: string,
  centerDate: string,
  windowDays = DEFAULT_WINDOW_DAYS
): Promise<NearbyPricesResponse> {
  const safeWindow = Math.min(Math.max(windowDays, 1), 7);
  const key = `nearby|${buildCacheKey(origin, destination, centerDate)}|w=${safeWindow}`;
  const cached = cache.get(key);
  if (cached) return cached;

  if (isSerpApiEnabled()) {
    try {
      const response = await buildLiveNearbyPrices(origin, destination, centerDate, safeWindow);
      cache.set(key, response);
      return response;
    } catch (error) {
      console.warn(`[nearbyPricesService] SerpApi failed, falling back to mock. Cause: ${(error as Error).message}`);
      const response = buildMockNearbyPricesResponse(origin, destination, centerDate, safeWindow, (error as Error).message);
      cache.set(key, response);
      return response;
    }
  }

  const response = buildMockNearbyPricesResponse(origin, destination, centerDate, safeWindow);
  cache.set(key, response);
  return response;
}

async function buildLiveNearbyPrices(
  origin: string,
  destination: string,
  centerDate: string,
  windowDays: number
): Promise<NearbyPricesResponse> {
  const today = todayIso();
  const dates: string[] = [];

  for (let offset = -windowDays; offset <= windowDays; offset++) {
    const date = addDaysIso(centerDate, offset);
    if (date >= today) dates.push(date);
  }

  const settled = await Promise.all(
    dates.map(async (date) => {
      try {
        const lowestPrice = await fetchLowestPriceForDateViaSerpApi(origin, destination, date);
        return { date, lowestPrice };
      } catch {
        return { date, lowestPrice: null };
      }
    })
  );

  const priceByDate = new Map(settled.map((entry) => [entry.date, entry.lowestPrice]));
  const prices = [];

  for (let offset = -windowDays; offset <= windowDays; offset++) {
    const date = addDaysIso(centerDate, offset);
    prices.push({
      date,
      lowestPrice: date < today ? null : (priceByDate.get(date) ?? null),
    });
  }

  return {
    origin: origin.toUpperCase(),
    destination: destination.toUpperCase(),
    centerDate,
    windowDays,
    currency: "MXN",
    prices,
    source: "live",
  };
}

function buildMockNearbyPricesResponse(
  origin: string,
  destination: string,
  centerDate: string,
  windowDays: number,
  warning?: string
): NearbyPricesResponse {
  return {
    origin: origin.toUpperCase(),
    destination: destination.toUpperCase(),
    centerDate,
    windowDays,
    currency: "MXN",
    prices: getMockNearbyPrices(origin, destination, centerDate, windowDays),
    source: "mock",
    ...(warning ? { warning: `SerpApi unavailable (${warning}), showing mock nearby prices.` } : {}),
  };
}
