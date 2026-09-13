import { useMemo, useState } from "react";
import type { FlightSearchResponse, NearbyPricesResponse, PriceInsightsResponse } from "../../types/api";
import type { PriceAlert } from "../../types/priceAlert";
import { DEFAULT_FILTERS, DEFAULT_SORT, filterItineraries, getAvailableAirlines, sortItineraries } from "../../utils/filterSort";
import { filtersFromPreferences } from "../../utils/travelPreferences";
import { formatShortDate } from "../../utils/dates";
import { FilterSortControls } from "../FilterSortControls/FilterSortControls";
import { FlightCard } from "../FlightCard/FlightCard";
import { PriceAlertToggle } from "../PriceAlertToggle/PriceAlertToggle";
import { PriceTrend } from "../PriceTrend/PriceTrend";
import { TripSummary } from "../TripSummary/TripSummary";
import { NearbyDatePrices } from "../NearbyDatePrices/NearbyDatePrices";
import { EmptyState } from "../StatusStates/StatusStates";
import "./ResultsList.css";

interface ResultsListProps {
  response: FlightSearchResponse;
  selectedDate?: string;
  insights: PriceInsightsResponse | null;
  nearbyPrices: NearbyPricesResponse | null;
  nearbyLoading?: boolean;
  isRefreshing?: boolean;
  alert: PriceAlert | null;
  onCreateAlert: (targetPrice: number) => void;
  onToggleAlertActive: () => void;
  onRemoveAlert: () => void;
  onSelectDate?: (date: string) => void;
}

export function ResultsList({
  response,
  selectedDate,
  insights,
  nearbyPrices,
  nearbyLoading = false,
  isRefreshing = false,
  alert,
  onCreateAlert,
  onToggleAlertActive,
  onRemoveAlert,
  onSelectDate,
}: ResultsListProps) {
  const [sort, setSort] = useState(DEFAULT_SORT);
  const [filters, setFilters] = useState(() => ({ ...DEFAULT_FILTERS, ...filtersFromPreferences(response.preferences) }));

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
  const showPriceTrend = insights != null && insights.history.length > 1;
  const activeDate = selectedDate ?? response.date;
  const isRoundTrip =
    response.preferences.tripType === "round-trip" && Boolean(response.preferences.returnDate);
  const routeDates = isRoundTrip
    ? `${formatShortDate(response.date)} – ${formatShortDate(response.preferences.returnDate!)}`
    : response.date;

  return (
    <section className={`results-list${isRefreshing ? " results-list--refreshing" : ""}`} aria-label="Search results">
      <header className="results-list__header">
        <div>
          <h2 className="results-list__route">
            {response.origin} → {response.destination}
            <span className="results-list__date"> · {routeDates}</span>
          </h2>
          <div className="results-list__meta">
            <p className={`results-list__source results-list__source--${response.source}`}>
              {response.source === "live" ? "Live data (SerpApi)" : "Demo data (mock)"}
              {response.cached && " · cached"}
            </p>
            <TripSummary preferences={response.preferences} />
            {response.warning && (
              <p className="results-list__warning" role="status">
                {response.warning}
              </p>
            )}
          </div>
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

      {onSelectDate && (
        <div className="results-list__section results-list__nearby">
          <NearbyDatePrices
            compact
            selectedDate={activeDate}
            data={nearbyPrices}
            isLoading={nearbyLoading}
            onSelectDate={onSelectDate}
          />
        </div>
      )}

      <div className="results-list__section">
        <FilterSortControls
          sort={sort}
          onSortChange={setSort}
          filters={filters}
          onFiltersChange={setFilters}
          availableAirlines={availableAirlines}
          maxPossiblePrice={maxPossiblePrice}
          resultCount={visibleItineraries.length}
        />
      </div>

      {visibleItineraries.length === 0 ? (
        <div className="results-list__section">
          <EmptyState
            embedded
            title="No flights match these filters"
            description="Try removing the airline or stops filter, or raising the max price."
          />
        </div>
      ) : (
        <ul className="results-list__items">
          {visibleItineraries.map((itinerary) => (
            <FlightCard
              key={itinerary.id}
              itinerary={itinerary}
              returnDate={isRoundTrip ? response.preferences.returnDate : null}
            />
          ))}
        </ul>
      )}

      {showPriceTrend && insights && (
        <>
          <div className="results-list__divider" aria-hidden="true" />
          <PriceTrend
            history={insights.history}
            typicalPriceRange={insights.typicalPriceRange}
            currency={insights.currency}
            source={insights.source}
            warning={insights.warning}
          />
        </>
      )}
    </section>
  );
}
