import { useMemo, useState } from "react";
import type { FlightSearchResponse } from "../../types/api";
import type { PriceAlert } from "../../types/priceAlert";
import { DEFAULT_FILTERS, DEFAULT_SORT, filterItineraries, getAvailableAirlines, sortItineraries } from "../../utils/filterSort";
import { FilterSortControls } from "../FilterSortControls/FilterSortControls";
import { FlightCard } from "../FlightCard/FlightCard";
import { PriceAlertToggle } from "../PriceAlertToggle/PriceAlertToggle";
import { EmptyState } from "../StatusStates/StatusStates";
import "./ResultsList.css";

interface ResultsListProps {
  response: FlightSearchResponse;
  alert: PriceAlert | null;
  onCreateAlert: (targetPrice: number) => void;
  onToggleAlertActive: () => void;
  onRemoveAlert: () => void;
}

export function ResultsList({ response, alert, onCreateAlert, onToggleAlertActive, onRemoveAlert }: ResultsListProps) {
  const [sort, setSort] = useState(DEFAULT_SORT);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  const availableAirlines = useMemo(() => getAvailableAirlines(response.itineraries), [response.itineraries]);
  const maxPossiblePrice = useMemo(
    () => Math.max(...response.itineraries.map((it) => it.totalPrice), 0),
    [response.itineraries]
  );
  const cheapestPrice = useMemo(
    () => Math.min(...response.itineraries.map((it) => it.totalPrice)),
    [response.itineraries]
  );

  const visibleItineraries = useMemo(
    () => sortItineraries(filterItineraries(response.itineraries, filters), sort),
    [response.itineraries, filters, sort]
  );

  const currency = response.itineraries[0]?.currency ?? "MXN";

  return (
    <section className="results-list" aria-label="Search results">
      <header className="results-list__header">
        <div>
          <h2 className="results-list__route">
            {response.origin} → {response.destination}
            <span className="results-list__date"> · {response.date}</span>
          </h2>
          <p className={`results-list__source results-list__source--${response.source}`}>
            {response.source === "live" ? "Live data (SerpApi)" : "Demo data (mock)"}
            {response.cached && " · from cache"}
          </p>
          {response.warning && (
            <p className="results-list__warning" role="status">
              {response.warning}
            </p>
          )}
        </div>
        <PriceAlertToggle
          alert={alert}
          defaultTargetPrice={cheapestPrice}
          currency={currency}
          onCreate={onCreateAlert}
          onToggleActive={onToggleAlertActive}
          onRemove={onRemoveAlert}
        />
      </header>

      <FilterSortControls
        sort={sort}
        onSortChange={setSort}
        filters={filters}
        onFiltersChange={setFilters}
        availableAirlines={availableAirlines}
        maxPossiblePrice={maxPossiblePrice}
        resultCount={visibleItineraries.length}
      />

      {visibleItineraries.length === 0 ? (
        <EmptyState
          title="No flights match these filters"
          description="Try removing the airline or stops filter, or raising the max price."
        />
      ) : (
        <ul className="results-list__items">
          {visibleItineraries.map((itinerary) => (
            <FlightCard key={itinerary.id} itinerary={itinerary} />
          ))}
        </ul>
      )}
    </section>
  );
}
