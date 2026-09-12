import { useCallback, useEffect, useState } from "react";
import { fetchAirports } from "./api/client";
import type { Airport } from "./types/airport";
import { SearchForm } from "./components/SearchForm/SearchForm";
import type { SearchFormValues } from "./components/SearchForm/SearchForm";
import { ResultsList } from "./components/ResultsList/ResultsList";
import { PriceTrend } from "./components/PriceTrend/PriceTrend";
import { LoadingState, ErrorState, EmptyState } from "./components/StatusStates/StatusStates";
import { useFlightSearch } from "./hooks/useFlightSearch";
import { usePriceAlerts } from "./hooks/usePriceAlerts";
import "./App.css";

type AirportsStatus = "loading" | "success" | "error";

function App() {
  const [airports, setAirports] = useState<Airport[]>([]);
  const [airportsStatus, setAirportsStatus] = useState<AirportsStatus>("loading");

  const { status, result, insights, errorMessage, search, retry } = useFlightSearch();
  const { getAlertFor, createAlert, toggleActive, removeAlert } = usePriceAlerts();

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
    search({ origin: values.origin.iataCode, destination: values.destination.iataCode, date: values.date });
  }

  const currentAlert = result ? getAlertFor(result.origin, result.destination, result.date) : null;

  return (
    <div className="app">
      <header className="app__header">
        <div className="container app__header-inner">
          <div className="app__brand">
            <span className="app__brand-icon" aria-hidden="true">
              ✈
            </span>
            <div>
              <h1 className="app__brand-title">FlightScope</h1>
              <p className="app__brand-tagline">Search and compare flights between Mexico and the United States</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container app__main">
        {airportsStatus === "loading" && <LoadingState label="Loading airport list…" />}
        {airportsStatus === "error" && (
          <ErrorState message="Couldn't load the airport list." onRetry={loadAirports} />
        )}
        {airportsStatus === "success" && <SearchForm airports={airports} isLoading={status === "loading"} onSearch={handleSearch} />}

        <div className="app__results" aria-live="polite">
          {status === "loading" && <LoadingState label="Searching for the best flights…" />}

          {status === "error" && <ErrorState message={errorMessage ?? "An unexpected error occurred."} onRetry={retry} />}

          {status === "success" && result && result.itineraries.length === 0 && (
            <EmptyState
              title="No flights were found for this search"
              description="Try a different date or a different pair of airports."
            />
          )}

          {status === "success" && result && result.itineraries.length > 0 && (
            <>
              <ResultsList
                response={result}
                alert={currentAlert}
                onCreateAlert={(price) => createAlert(result.origin, result.destination, result.date, price, result.itineraries[0].currency)}
                onToggleAlertActive={() => toggleActive(result.origin, result.destination, result.date)}
                onRemoveAlert={() => removeAlert(result.origin, result.destination, result.date)}
              />
              {insights && insights.history.length > 1 && (
                <PriceTrend
                  history={insights.history}
                  typicalPriceRange={insights.typicalPriceRange}
                  currency={insights.currency}
                  source={insights.source}
                  warning={insights.warning}
                />
              )}
            </>
          )}

          {status === "idle" && (
            <p className="app__idle-hint">Choose an origin, destination, and date to see available flights.</p>
          )}
        </div>
      </main>

      <footer className="app__footer">
        <p className="container">FlightScope · Academic project for IS312 (Web Design and Programming)</p>
      </footer>
    </div>
  );
}

export default App;
