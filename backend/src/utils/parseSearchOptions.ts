import type { SearchOptions, CabinClass, TripType } from "../types/searchOptions";
import { DEFAULT_SEARCH_OPTIONS } from "../types/searchOptions";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function parseIntParam(value: unknown, fallback: number, min: number, max: number): number {
  const parsed = typeof value === "string" ? Number.parseInt(value, 10) : Number.NaN;
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

function parseBool(value: unknown): boolean {
  return value === "true" || value === "1";
}

export function parseSearchOptions(query: Record<string, unknown>, departureDate: string): { ok: true; value: SearchOptions } | { ok: false; error: string } {
  const tripType: TripType = query.tripType === "round-trip" ? "round-trip" : "one-way";
  const returnDateRaw = typeof query.returnDate === "string" ? query.returnDate.trim() : "";
  const returnDate = returnDateRaw && DATE_PATTERN.test(returnDateRaw) ? returnDateRaw : null;

  const cabinRaw = typeof query.cabinClass === "string" ? query.cabinClass : "economy";
  const cabinClass: CabinClass = ["economy", "premium_economy", "business", "first"].includes(cabinRaw)
    ? (cabinRaw as CabinClass)
    : "economy";

  const passengers = {
    adults: parseIntParam(query.adults, DEFAULT_SEARCH_OPTIONS.passengers.adults, 1, 9),
    children: parseIntParam(query.children, 0, 0, 8),
    infants: parseIntParam(query.infants, 0, 0, 4),
  };

  const options: SearchOptions = {
    tripType,
    returnDate: tripType === "round-trip" ? returnDate : null,
    passengers,
    cabinClass,
    nonstopOnly: parseBool(query.nonstopOnly),
    checkedBags: parseIntParam(query.checkedBags, 0, 0, 2),
  };

  const total = passengers.adults + passengers.children + passengers.infants;
  if (total > 9) {
    return { ok: false, error: "Most airlines allow up to 9 passengers per booking." };
  }
  if (passengers.infants > passengers.adults) {
    return { ok: false, error: "Lap infants (under 2) need one adult each — children ages 2–11 do not." };
  }
  if (tripType === "round-trip") {
    if (!options.returnDate) {
      return { ok: false, error: "The 'returnDate' parameter is required for round-trip searches." };
    }
    if (options.returnDate < departureDate) {
      return { ok: false, error: "Return date must be on or after departure." };
    }
  }

  return { ok: true, value: options };
}

export function serializeSearchOptions(options: SearchOptions): Record<string, string> {
  return {
    tripType: options.tripType,
    ...(options.returnDate ? { returnDate: options.returnDate } : {}),
    adults: String(options.passengers.adults),
    children: String(options.passengers.children),
    infants: String(options.passengers.infants),
    cabinClass: options.cabinClass,
    nonstopOnly: options.nonstopOnly ? "true" : "false",
    checkedBags: String(options.checkedBags),
  };
}
