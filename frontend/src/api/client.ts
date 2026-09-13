import type { Airport } from "../types/airport";
import type { ApiErrorResponse, FlightSearchResponse, NearbyPricesResponse, PriceInsightsResponse } from "../types/api";
import type { TravelPreferences } from "../types/travelPreferences";
import { travelPreferencesToParams } from "../utils/travelPreferencesParams";

// In dev, Vite proxies /api to the backend (see vite.config.ts).
// In a real deployment, VITE_API_BASE_URL would point to the backend's public URL.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

export class ApiError extends Error {}

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`);
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as ApiErrorResponse | null;
    throw new ApiError(body?.error ?? `Error ${response.status} while requesting ${path}`);
  }
  return response.json() as Promise<T>;
}

export function fetchAirports(query = ""): Promise<Airport[]> {
  const params = query ? `?query=${encodeURIComponent(query)}` : "";
  return getJson<Airport[]>(`/api/airports${params}`);
}

export function searchFlights(
  origin: string,
  destination: string,
  date: string,
  preferences: TravelPreferences
): Promise<FlightSearchResponse> {
  const params = new URLSearchParams({ origin, destination, date, ...travelPreferencesToParams(preferences) });
  return getJson<FlightSearchResponse>(`/api/flights/search?${params.toString()}`);
}

export function fetchPriceInsights(origin: string, destination: string, date: string): Promise<PriceInsightsResponse> {
  const params = new URLSearchParams({ origin, destination, date });
  return getJson<PriceInsightsResponse>(`/api/flights/price-insights?${params.toString()}`);
}

export function fetchNearbyPrices(
  origin: string,
  destination: string,
  date: string,
  window = 3
): Promise<NearbyPricesResponse> {
  const params = new URLSearchParams({ origin, destination, date, window: String(window) });
  return getJson<NearbyPricesResponse>(`/api/flights/nearby-prices?${params.toString()}`);
}
