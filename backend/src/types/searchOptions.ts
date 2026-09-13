export type TripType = "one-way" | "round-trip";
export type CabinClass = "economy" | "premium_economy" | "business" | "first";

export interface PassengerCounts {
  adults: number;
  children: number;
  infants: number;
}

export interface SearchOptions {
  tripType: TripType;
  returnDate: string | null;
  passengers: PassengerCounts;
  cabinClass: CabinClass;
  nonstopOnly: boolean;
  checkedBags: number;
}

export const DEFAULT_SEARCH_OPTIONS: SearchOptions = {
  tripType: "one-way",
  returnDate: null,
  passengers: { adults: 1, children: 0, infants: 0 },
  cabinClass: "economy",
  nonstopOnly: false,
  checkedBags: 0,
};
