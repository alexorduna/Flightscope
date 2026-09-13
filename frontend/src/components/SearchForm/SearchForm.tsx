import { useId, useState } from "react";
import type { FormEvent } from "react";
import { ArrowLeftRight } from "lucide-react";
import type { Airport } from "../../types/airport";
import type { TravelPreferences, TripType } from "../../types/travelPreferences";
import { DEFAULT_TRAVEL_PREFERENCES } from "../../types/travelPreferences";
import { validateTravelPreferences } from "../../utils/travelPreferences";
import { todayIso } from "../../utils/dates";
import { useNearbyPrices } from "../../hooks/useNearbyPrices";
import { Button } from "../ui/Button";
import { AirportAutocomplete } from "../AirportAutocomplete/AirportAutocomplete";
import { TravelDetailsFields } from "../TravelDetailsFields/TravelDetailsFields";
import { NearbyDatePrices } from "../NearbyDatePrices/NearbyDatePrices";
import { SearchStepIndicator, type SearchStepId } from "../SearchStepIndicator/SearchStepIndicator";
import "./SearchForm.css";

export interface SearchFormValues {
  origin: Airport;
  destination: Airport;
  date: string;
  preferences: TravelPreferences;
}

interface SearchFormProps {
  airports: Airport[];
  isLoading: boolean;
  onSearch: (values: SearchFormValues) => void;
}

interface FormErrors {
  origin?: string;
  destination?: string;
  date?: string;
  preferences?: string;
}

export function SearchForm({ airports, isLoading, onSearch }: SearchFormProps) {
  const [step, setStep] = useState<SearchStepId>("route");
  const [origin, setOrigin] = useState<Airport | null>(null);
  const [destination, setDestination] = useState<Airport | null>(null);
  const [date, setDate] = useState(todayIso());
  const [preferences, setPreferences] = useState<TravelPreferences>(DEFAULT_TRAVEL_PREFERENCES);
  const [errors, setErrors] = useState<FormErrors>({});
  const dateId = useId();
  const returnDateId = useId();

  const { data: nearbyPrices, isLoading: nearbyLoading } = useNearbyPrices(
    origin?.iataCode ?? null,
    destination?.iataCode ?? null,
    date,
    step === "dates" && Boolean(origin && destination)
  );

  function handleSwap() {
    setOrigin(destination);
    setDestination(origin);
  }

  function setTripType(tripType: TripType) {
    setPreferences((current) => ({
      ...current,
      tripType,
      returnDate: tripType === "one-way" ? null : current.returnDate,
    }));
  }

  function validateRoute(): FormErrors {
    const nextErrors: FormErrors = {};
    if (!origin) nextErrors.origin = "Choose an origin airport.";
    if (!destination) nextErrors.destination = "Choose a destination airport.";
    if (origin && destination && origin.iataCode === destination.iataCode) {
      nextErrors.destination = "Destination must be different from origin.";
    }
    return nextErrors;
  }

  function validateDates(): FormErrors {
    const nextErrors: FormErrors = {};
    if (!date) nextErrors.date = "Choose a travel date.";
    const preferencesError = validateTravelPreferences(preferences, date);
    if (preferencesError) nextErrors.preferences = preferencesError;
    return nextErrors;
  }

  function goToStep(nextStep: SearchStepId) {
    setErrors({});
    setStep(nextStep);
  }

  function handleContinueFromRoute() {
    const nextErrors = validateRoute();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    goToStep("dates");
  }

  function handleContinueFromDates() {
    const nextErrors = validateDates();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    goToStep("travelers");
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const routeErrors = validateRoute();
    const dateErrors = validateDates();
    const nextErrors = { ...routeErrors, ...dateErrors };
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    onSearch({
      origin: origin as Airport,
      destination: destination as Airport,
      date,
      preferences,
    });
  }

  return (
    <form className="search-form" onSubmit={handleSubmit} aria-label="Flight search" noValidate>
      <SearchStepIndicator currentStep={step} />

      {step === "route" && (
        <section className="search-form__step" aria-label="Choose route">
          <header className="search-form__step-header">
            <h2 className="search-form__step-title">Where are you flying?</h2>
            <p className="search-form__step-hint">Pick your origin and destination airports.</p>
          </header>

          <div className="search-form__route">
            <AirportAutocomplete
              label="Origin"
              airports={airports}
              value={origin}
              onChange={setOrigin}
              placeholder="City or airport code"
              errorMessage={errors.origin}
              excludeCode={destination?.iataCode}
            />

            <div className="search-form__swap-wrap">
              <button
                type="button"
                className="search-form__swap"
                onClick={handleSwap}
                aria-label="Swap origin and destination"
                disabled={!origin && !destination}
              >
                <ArrowLeftRight size={18} strokeWidth={2} aria-hidden="true" />
              </button>
            </div>

            <AirportAutocomplete
              label="Destination"
              airports={airports}
              value={destination}
              onChange={setDestination}
              placeholder="City or airport code"
              errorMessage={errors.destination}
              excludeCode={origin?.iataCode}
            />
          </div>

          <div className="search-form__actions">
            <Button type="button" onClick={handleContinueFromRoute}>
              Continue
            </Button>
          </div>
        </section>
      )}

      {step === "dates" && (
        <section className="search-form__step" aria-label="Choose dates">
          <header className="search-form__step-header">
            <h2 className="search-form__step-title">When do you want to travel?</h2>
            <p className="search-form__step-hint">
              {origin?.city} → {destination?.city}
            </p>
          </header>

          <fieldset className="search-form__group search-form__fieldset">
            <legend className="search-form__label">Trip type</legend>
            <div className="search-form__segmented">
              {([
                { value: "one-way" as const, label: "One-way" },
                { value: "round-trip" as const, label: "Round-trip" },
              ]).map((option) => (
                <label key={option.value} className="search-form__segment">
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

          <div className="search-form__field">
            <label className="search-form__label" htmlFor={dateId}>
              Departure
            </label>
            <input
              id={dateId}
              type="date"
              className="search-form__date mono"
              value={date}
              min={todayIso()}
              onChange={(e) => setDate(e.target.value)}
              aria-invalid={Boolean(errors.date)}
              aria-describedby={errors.date ? `${dateId}-error` : undefined}
            />
            {errors.date && (
              <p className="search-form__error" id={`${dateId}-error`} role="alert">
                {errors.date}
              </p>
            )}
          </div>

          {preferences.tripType === "round-trip" && (
            <div className="search-form__field">
              <label className="search-form__label" htmlFor={returnDateId}>
                Return
              </label>
              <input
                id={returnDateId}
                type="date"
                className="search-form__date mono"
                value={preferences.returnDate ?? ""}
                min={date || todayIso()}
                onChange={(e) =>
                  setPreferences((current) => ({ ...current, returnDate: e.target.value || null }))
                }
              />
            </div>
          )}

          <NearbyDatePrices
            selectedDate={date}
            data={nearbyPrices}
            isLoading={nearbyLoading}
            onSelectDate={setDate}
          />

          {errors.preferences && (
            <p className="search-form__error" role="alert">
              {errors.preferences}
            </p>
          )}

          <div className="search-form__actions search-form__actions--split">
            <Button type="button" variant="secondary" onClick={() => goToStep("route")}>
              Back
            </Button>
            <Button type="button" onClick={handleContinueFromDates}>
              Continue
            </Button>
          </div>
        </section>
      )}

      {step === "travelers" && (
        <section className="search-form__step" aria-label="Travelers and preferences">
          <header className="search-form__step-header">
            <h2 className="search-form__step-title">Who&apos;s traveling?</h2>
            <p className="search-form__step-hint">
              {origin?.city} → {destination?.city} · {date}
            </p>
          </header>

          <TravelDetailsFields
            mode="travelers"
            preferences={preferences}
            departureDate={date}
            onChange={setPreferences}
            errorMessage={errors.preferences}
          />

          <div className="search-form__actions search-form__actions--split">
            <Button type="button" variant="secondary" onClick={() => goToStep("dates")}>
              Back
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Searching…" : "Search flights"}
            </Button>
          </div>
        </section>
      )}
    </form>
  );
}
