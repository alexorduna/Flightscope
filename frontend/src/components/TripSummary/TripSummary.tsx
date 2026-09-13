import type { TravelPreferences } from "../../types/travelPreferences";
import { CABIN_CLASS_LABELS, formatPassengerSummary } from "../../types/travelPreferences";
import "./TripSummary.css";

interface TripSummaryProps {
  preferences: TravelPreferences;
}

export function TripSummary({ preferences }: TripSummaryProps) {
  const items = [
    preferences.tripType === "round-trip" ? "Round-trip" : "One-way",
    formatPassengerSummary(preferences.passengers),
    CABIN_CLASS_LABELS[preferences.cabinClass],
    preferences.nonstopOnly ? "Nonstop only" : null,
    preferences.checkedBags > 0 ? `${preferences.checkedBags} checked bag${preferences.checkedBags === 1 ? "" : "s"}` : null,
    preferences.tripType === "round-trip" && preferences.returnDate ? `Return ${preferences.returnDate}` : null,
  ].filter(Boolean);

  return (
    <ul className="trip-summary" aria-label="Trip details for this search">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}
