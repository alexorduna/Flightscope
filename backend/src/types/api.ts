import type { Itinerary } from "./flight";
import type { SearchOptions } from "./searchOptions";

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
  /** Echo of the travel options used for this search (shown in the UI). */
  preferences: SearchOptions;
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

export interface NearbyDatePrice {
  date: string;
  lowestPrice: number | null;
}

export interface NearbyPricesResponse {
  origin: string;
  destination: string;
  centerDate: string;
  windowDays: number;
  currency: string;
  prices: NearbyDatePrice[];
  source: DataSource;
  warning?: string;
}
