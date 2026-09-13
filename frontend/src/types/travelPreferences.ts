export type TripType = "one-way" | "round-trip";
export type CabinClass = "economy" | "premium_economy" | "business" | "first";

export interface PassengerCounts {
  adults: number;
  children: number;
  infants: number;
}

export interface TravelPreferences {
  tripType: TripType;
  returnDate: string | null;
  passengers: PassengerCounts;
  cabinClass: CabinClass;
  nonstopOnly: boolean;
  checkedBags: number;
}

export const DEFAULT_TRAVEL_PREFERENCES: TravelPreferences = {
  tripType: "one-way",
  returnDate: null,
  passengers: { adults: 1, children: 0, infants: 0 },
  cabinClass: "economy",
  nonstopOnly: false,
  checkedBags: 0,
};

export const CABIN_CLASS_LABELS: Record<CabinClass, string> = {
  economy: "Economy",
  premium_economy: "Premium economy",
  business: "Business",
  first: "First",
};

export function totalPassengers(passengers: PassengerCounts): number {
  return passengers.adults + passengers.children + passengers.infants;
}

export function formatPassengerSummary(passengers: PassengerCounts): string {
  const parts: string[] = [];
  parts.push(`${passengers.adults} adult${passengers.adults === 1 ? "" : "s"}`);
  if (passengers.children > 0) {
    parts.push(`${passengers.children} child${passengers.children === 1 ? "" : "ren"}`);
  }
  if (passengers.infants > 0) {
    parts.push(`${passengers.infants} infant${passengers.infants === 1 ? "" : "s"}`);
  }
  return parts.join(", ");
}
