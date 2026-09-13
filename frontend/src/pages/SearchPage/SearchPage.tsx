import { useCallback, useEffect, useRef, useState } from "react";
import { fetchAirports } from "../../api/client";
import type { Airport } from "../../types/airport";
import type { TravelPreferences } from "../../types/travelPreferences";
import { SearchForm } from "../../components/SearchForm/SearchForm";
import type { SearchFormValues } from "../../components/SearchForm/SearchForm";
import { ResultsList } from "../../components/ResultsList/ResultsList";
import { LoadingState, ErrorState, EmptyState } from "../../components/StatusStates/StatusStates";
import { useFlightSearch } from "../../hooks/useFlightSearch";
import { useNearbyPrices } from "../../hooks/useNearbyPrices";
import { usePriceAlerts } from "../../hooks/usePriceAlerts";
import "./SearchPage.css";

type AirportsStatus = "loading" | "success" | "error";

export function SearchPage() {
  const [airports, setAirports] = useState<Airport[]>([]);
  const [airportsStatus, setAirportsStatus] = useState<AirportsStatus>("loading");
  const [pendingDate, setPendingDate] = useState<string | null>(null);
  const lastSearch = useRef<SearchFormValues | null>(null);

  const { status, result, insights, errorMessage, search, retry } = useFlightSearch();
  const { getAlertFor, createAlert, toggleActive, removeAlert } = usePriceAlerts();

  const { data: nearbyPrices, isLoading: nearbyLoading } = useNearbyPrices(
    result?.origin ?? null,
    result?.destination ?? null,
    pendingDate ?? result?.date ?? "",
    Boolean(result)
  );

  useEffect(() => {
    if (result && pendingDate === result.date) {
      setPendingDate(null);
    }
  }, [result, pendingDate]);

  const loadAirports = useCallback(() => {
    setAirportsStatus("loading");
    fetchAirports()
      .then((data) => {
        setAirports(data);
        setAirportsStatus("success");
      })
      .catch(() => setAirportsStatus("error"));
  }, []);

  useEffect(() => {
    loadAirports();
  }, [loadAirports]);

  function handleSearch(values: SearchFormValues) {
    lastSearch.current = values;
    search({
      origin: values.origin.iataCode,
      destination: values.destination.iataCode,
      date: values.date,
      preferences: values.preferences,
    });
  }

  function handleSelectDate(newDate: string) {
    const activeDate = pendingDate ?? result?.date;
    if (activeDate && newDate === activeDate) return;

    const previous = lastSearch.current;
    if (!previous) return;

    setPendingDate(newDate);
    handleSearch({ ...previous, date: newDate });
  }

  const stripSelectedDate = pendingDate ?? result?.date ?? "";

  const currentAlert = result ? getAlertFor(result.origin, result.destination, result.date) : null;

  return (
    <div className="search-page">
      <div className="search-page__layout">
        <aside id="search" className="search-page__aside surface-bleed" aria-label="Flight search">
          {airportsStatus === "loading" && <LoadingState label="Loading airport list…" compact />}
          {airportsStatus === "error" && (
            <ErrorState message="Couldn't load the airport list." onRetry={loadAirports} compact />
          )}
          {airportsStatus === "success" && (
            <SearchForm airports={airports} isLoading={status === "loading"} onSearch={handleSearch} />
          )}
        </aside>

        <section id="results" className="search-page__main surface-bleed" aria-live="polite">
          {status === "loading" && !result && <LoadingState label="Searching for the best flights…" compact />}

          {status === "error" && (
            <ErrorState message={errorMessage ?? "An unexpected error occurred."} onRetry={retry} compact />
          )}

          {status === "success" && result && result.itineraries.length === 0 && (
            <EmptyState
              title="No flights were found for this search"
              description="Try a different date or a different pair of airports."
            />
          )}

          {result && result.itineraries.length > 0 && (status === "success" || status === "loading") && (
            <ResultsList
              response={result}
              selectedDate={stripSelectedDate}
              insights={insights}
              nearbyPrices={nearbyPrices}
              nearbyLoading={nearbyLoading}
              isRefreshing={status === "loading"}
              alert={currentAlert}
              onCreateAlert={(price) =>
                createAlert(result.origin, result.destination, result.date, price, result.itineraries[0].currency)
              }
              onToggleAlertActive={() => toggleActive(result.origin, result.destination, result.date)}
              onRemoveAlert={() => removeAlert(result.origin, result.destination, result.date)}
              onSelectDate={handleSelectDate}
            />
          )}

          {status === "idle" && (
            <p className="search-page__idle-hint">
              Follow the steps on the left — route, dates, then travelers — to compare flights.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
