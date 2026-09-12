import type { Itinerary } from "./flight";

/**
 * "live" -> the backend got the data from the real SerpApi call.
 * "mock" -> the in-memory fallback was used (SerpApi disabled, no key, or it failed).
 * This field always travels to the frontend so the UI is transparent about
 * where the data came from.
 */
export type DataSource = "live" | "mock";

export interface FlightSearchResponse {
  origin: string;
  destination: string;
  date: string;
  itineraries: Itinerary[];
  source: DataSource;
  cached: boolean;
  /** Present only when SerpApi failed and the mock fallback was used; explains why. */
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
