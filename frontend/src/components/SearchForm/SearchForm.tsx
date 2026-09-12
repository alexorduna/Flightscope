import { useId, useState } from "react";
import type { FormEvent } from "react";
import type { Airport } from "../../types/airport";
import { AirportAutocomplete } from "../AirportAutocomplete/AirportAutocomplete";
import "./SearchForm.css";

export interface SearchFormValues {
  origin: Airport;
  destination: Airport;
  date: string;
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
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function SearchForm({ airports, isLoading, onSearch }: SearchFormProps) {
  const [origin, setOrigin] = useState<Airport | null>(null);
  const [destination, setDestination] = useState<Airport | null>(null);
  const [date, setDate] = useState(today());
  const [errors, setErrors] = useState<FormErrors>({});
  const dateId = useId();

  function handleSwap() {
    setOrigin(destination);
    setDestination(origin);
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const nextErrors: FormErrors = {};
    if (!origin) nextErrors.origin = "Choose an origin airport.";
    if (!destination) nextErrors.destination = "Choose a destination airport.";
    if (origin && destination && origin.iataCode === destination.iataCode) {
      nextErrors.destination = "Destination must be different from origin.";
    }
    if (!date) nextErrors.date = "Choose a travel date.";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    onSearch({ origin: origin as Airport, destination: destination as Airport, date });
  }

  return (
    <form className="search-form" onSubmit={handleSubmit} aria-label="Flight search" noValidate>
      <div className="search-form__row">
        <AirportAutocomplete
          label="Origin"
          airports={airports}
          value={origin}
          onChange={setOrigin}
          placeholder="City or code (e.g. MTY)"
          errorMessage={errors.origin}
          excludeCode={destination?.iataCode}
        />

        <button
          type="button"
          className="search-form__swap"
          onClick={handleSwap}
          aria-label="Swap origin and destination"
          disabled={!origin && !destination}
        >
          ⇄
        </button>

        <AirportAutocomplete
          label="Destination"
          airports={airports}
          value={destination}
          onChange={setDestination}
          placeholder="City or code (e.g. TIJ)"
          errorMessage={errors.destination}
          excludeCode={origin?.iataCode}
        />

        <div className="search-form__field">
          <label className="search-form__label" htmlFor={dateId}>
            Date
          </label>
          <input
            id={dateId}
            type="date"
            className="search-form__date mono"
            value={date}
            min={today()}
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
      </div>

      <button type="submit" className="search-form__submit" disabled={isLoading}>
        {isLoading ? "Searching…" : "Search flights"}
      </button>
    </form>
  );
}
