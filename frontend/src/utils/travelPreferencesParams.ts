import type { TravelPreferences } from "../types/travelPreferences";

export function travelPreferencesToParams(preferences: TravelPreferences): Record<string, string> {
  return {
    tripType: preferences.tripType,
    ...(preferences.returnDate ? { returnDate: preferences.returnDate } : {}),
    adults: String(preferences.passengers.adults),
    children: String(preferences.passengers.children),
    infants: String(preferences.passengers.infants),
    cabinClass: preferences.cabinClass,
    nonstopOnly: preferences.nonstopOnly ? "true" : "false",
    checkedBags: String(preferences.checkedBags),
  };
}
