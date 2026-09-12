import type { Itinerary } from "../types/flight";

export type SortKey = "price" | "duration" | "stops";
export type SortDirection = "asc" | "desc";

export interface SortOption {
  key: SortKey;
  direction: SortDirection;
}

export interface ItineraryFilters {
  /** null = no stops limit */
  maxStops: number | null;
  /** empty = all airlines */
  airlines: string[];
  /** null = no price limit */
  maxPrice: number | null;
}

export const DEFAULT_SORT: SortOption = { key: "price", direction: "asc" };
export const DEFAULT_FILTERS: ItineraryFilters = { maxStops: null, airlines: [], maxPrice: null };

export function filterItineraries(itineraries: Itinerary[], filters: ItineraryFilters): Itinerary[] {
  return itineraries.filter((itinerary) => {
    if (filters.maxStops !== null && itinerary.stops > filters.maxStops) return false;
    if (filters.maxPrice !== null && itinerary.totalPrice > filters.maxPrice) return false;
    if (filters.airlines.length > 0 && !itinerary.flights.some((f) => filters.airlines.includes(f.airline))) return false;
    return true;
  });
}

export function sortItineraries(itineraries: Itinerary[], sort: SortOption): Itinerary[] {
  const factor = sort.direction === "asc" ? 1 : -1;
  return [...itineraries].sort((a, b) => {
    switch (sort.key) {
      case "price":
        return (a.totalPrice - b.totalPrice) * factor;
      case "duration":
        return (a.totalDurationMinutes - b.totalDurationMinutes) * factor;
      case "stops":
        return (a.stops - b.stops) * factor;
      default:
        return 0;
    }
  });
}

export function getAvailableAirlines(itineraries: Itinerary[]): string[] {
  const airlines = new Set<string>();
  for (const itinerary of itineraries) {
    for (const flight of itinerary.flights) {
      airlines.add(flight.airline);
    }
  }
  return Array.from(airlines).sort((a, b) => a.localeCompare(b));
}
