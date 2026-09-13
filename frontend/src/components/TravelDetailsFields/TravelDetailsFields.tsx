import { useId } from "react";
import type { TravelPreferences, TripType } from "../../types/travelPreferences";
import { CABIN_CLASS_LABELS } from "../../types/travelPreferences";
import { clampPassengerCount } from "../../utils/travelPreferences";
import "./TravelDetailsFields.css";

interface TravelDetailsFieldsProps {
  preferences: TravelPreferences;
  departureDate: string;
  onChange: (preferences: TravelPreferences) => void;
  errorMessage?: string;
  /** "all" shows trip type + dates + travelers; "travelers" hides route/date fields for the wizard. */
  mode?: "all" | "travelers";
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function TravelDetailsFields({
  preferences,
  departureDate,
  onChange,
  errorMessage,
  mode = "all",
}: TravelDetailsFieldsProps) {
  const returnDateId = useId();
  const cabinId = useId();
  const bagsId = useId();

  function update<K extends keyof TravelPreferences>(key: K, value: TravelPreferences[K]) {
    onChange({ ...preferences, [key]: value });
  }

  function updatePassengers(field: keyof TravelPreferences["passengers"], rawValue: string) {
    const parsed = Number.parseInt(rawValue, 10);
    if (!Number.isFinite(parsed)) return;

    onChange({
      ...preferences,
      passengers: {
        ...preferences.passengers,
        [field]: clampPassengerCount(field, parsed, preferences.passengers),
      },
    });
  }

  function setTripType(tripType: TripType) {
    onChange({
      ...preferences,
      tripType,
      returnDate: tripType === "one-way" ? null : preferences.returnDate,
    });
  }

  return (
    <section
      className={`travel-details${mode === "travelers" ? " travel-details--embedded" : ""}`}
      aria-label="Trip details before booking"
    >
      {mode === "all" && (
        <div className="travel-details__header">
          <h2 className="travel-details__title">Trip details</h2>
          <p className="travel-details__hint">What booking sites ask before you compare fares.</p>
        </div>
      )}

      {mode === "all" && (
        <>
          <fieldset className="travel-details__group travel-details__fieldset">
            <legend className="travel-details__label">Trip type</legend>
            <div className="travel-details__segmented">
              {([
                { value: "one-way" as const, label: "One-way" },
                { value: "round-trip" as const, label: "Round-trip" },
              ]).map((option) => (
                <label key={option.value} className="travel-details__segment">
                  <input
                    type="radio"
                    name="trip-type"
                    checked={preferences.tripType === option.value}
                    onChange={() => setTripType(option.value)}
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </fieldset>

          {preferences.tripType === "round-trip" && (
            <div className="travel-details__group">
              <label className="travel-details__label" htmlFor={returnDateId}>
                Return
              </label>
              <input
                id={returnDateId}
                type="date"
                className="travel-details__input mono"
                value={preferences.returnDate ?? ""}
                min={departureDate || today()}
                onChange={(e) => update("returnDate", e.target.value || null)}
              />
            </div>
          )}
        </>
      )}

      <fieldset className="travel-details__group travel-details__fieldset">
        <legend className="travel-details__label">Passengers</legend>
        <div className="travel-details__passengers">
          {([
            { key: "adults" as const, label: "Adults", min: 1, max: 9 },
            { key: "children" as const, label: "Children (2–11)", min: 0, max: 8 },
            { key: "infants" as const, label: "Infants (under 2)", min: 0, max: 4 },
          ]).map((row) => (
            <div key={row.key} className="travel-details__passenger-row">
              <span className="travel-details__passenger-label">{row.label}</span>
              <input
                type="number"
                className="travel-details__stepper mono"
                min={row.min}
                max={row.max}
                value={preferences.passengers[row.key]}
                onChange={(e) => updatePassengers(row.key, e.target.value)}
                aria-label={row.label}
              />
            </div>
          ))}
        </div>
        <p className="travel-details__helper">
          Example: 2 adults with 3 children is fine. Lap infants (under 2) are limited to one per adult.
        </p>
      </fieldset>

      <div className="travel-details__group">
        <label className="travel-details__label" htmlFor={cabinId}>
          Cabin
        </label>
        <select
          id={cabinId}
          className="travel-details__select"
          value={preferences.cabinClass}
          onChange={(e) => update("cabinClass", e.target.value as TravelPreferences["cabinClass"])}
        >
          {(Object.keys(CABIN_CLASS_LABELS) as Array<keyof typeof CABIN_CLASS_LABELS>).map((value) => (
            <option key={value} value={value}>
              {CABIN_CLASS_LABELS[value]}
            </option>
          ))}
        </select>
      </div>

      <div className="travel-details__group">
        <label className="travel-details__label" htmlFor={bagsId}>
          Checked bags
        </label>
        <select
          id={bagsId}
          className="travel-details__select"
          value={preferences.checkedBags}
          onChange={(e) => update("checkedBags", Number(e.target.value))}
        >
          <option value={0}>No checked bag</option>
          <option value={1}>1 checked bag</option>
          <option value={2}>2 checked bags</option>
        </select>
      </div>

      <label className="travel-details__checkbox">
        <input
          type="checkbox"
          checked={preferences.nonstopOnly}
          onChange={(e) => update("nonstopOnly", e.target.checked)}
        />
        <span>Nonstop flights only</span>
      </label>

      {errorMessage && (
        <p className="travel-details__error" role="alert">
          {errorMessage}
        </p>
      )}
    </section>
  );
}
