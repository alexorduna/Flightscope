import type { Itinerary } from "./flight";

/**
 * "live" -> the backend got the data from the real SerpApi call.
 * "mock" -> the in-memory fallback was used (SerpApi disabled, no key, or it failed).
 * Shown in the UI to be transparent about where the data came from.
 */
export type DataSource = "live" | "mock";

export interface FlightSearchResponse {
  origin: string;
  destination: string;
  date: string;
  itineraries: Itinerary[];
  source: DataSource;
  cached: boolean;
  warning?: string;
}

export interface PricePoint {
  date: string;
  price: number;
}

export interface PriceInsightsResponse {
  origin: string;
  destination: string;
  currency: string;
  typicalPriceRange: { low: number; high: number };
  history: PricePoint[];
  source: DataSource;
  warning?: string;
}

export interface ApiErrorResponse {
  error: string;
}
