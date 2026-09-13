import type { ItineraryFilters } from "./filterSort";
import type { TravelPreferences } from "../types/travelPreferences";

export function filtersFromPreferences(preferences: TravelPreferences): Partial<ItineraryFilters> {
  return preferences.nonstopOnly ? { maxStops: 0 } : {};
}

export function validateTravelPreferences(
  preferences: TravelPreferences,
  departureDate: string
): string | null {
  const { passengers, tripType, returnDate } = preferences;
  const total = passengers.adults + passengers.children + passengers.infants;

  if (passengers.adults < 1) return "At least one adult passenger is required.";
  if (total > 9) return "Most airlines allow up to 9 passengers per booking.";
  if (passengers.infants > passengers.adults) {
    return "Lap infants (under 2) need one adult each — but children ages 2–11 do not.";
  }

  if (tripType === "round-trip") {
    if (!returnDate) return "Choose a return date for round-trip travel.";
    if (returnDate < departureDate) return "Return date must be on or after departure.";
  }

  return null;
}

export function clampPassengerCount(
  field: keyof TravelPreferences["passengers"],
  value: number,
  current: TravelPreferences["passengers"]
): number {
  const limits = {
    adults: { min: 1, max: 9 },
    children: { min: 0, max: 8 },
    infants: { min: 0, max: 4 },
  } as const;

  const { min, max } = limits[field];
  const clamped = Math.min(max, Math.max(min, value));

  const next = { ...current, [field]: clamped };
  const total = next.adults + next.children + next.infants;
  if (total <= 9) return clamped;

  const others = total - clamped;
  return Math.max(min, 9 - others);
}
