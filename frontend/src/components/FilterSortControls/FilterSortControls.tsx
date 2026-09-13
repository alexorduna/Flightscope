import { useId } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import type { ItineraryFilters, SortDirection, SortKey, SortOption } from "../../utils/filterSort";
import "./FilterSortControls.css";

interface FilterSortControlsProps {
  sort: SortOption;
  onSortChange: (sort: SortOption) => void;
  filters: ItineraryFilters;
  onFiltersChange: (filters: ItineraryFilters) => void;
  availableAirlines: string[];
  maxPossiblePrice: number;
  resultCount: number;
}

const SORT_LABELS: Record<SortKey, string> = {
  price: "Price",
  duration: "Duration",
  stops: "Stops",
};

export function FilterSortControls({
  sort,
  onSortChange,
  filters,
  onFiltersChange,
  availableAirlines,
  maxPossiblePrice,
  resultCount,
}: FilterSortControlsProps) {
  const sortId = useId();
  const priceId = useId();

  function toggleDirection() {
    const next: SortDirection = sort.direction === "asc" ? "desc" : "asc";
    onSortChange({ ...sort, direction: next });
  }

  function toggleAirline(airline: string) {
    const isSelected = filters.airlines.includes(airline);
    const airlines = isSelected ? filters.airlines.filter((a) => a !== airline) : [...filters.airlines, airline];
    onFiltersChange({ ...filters, airlines });
  }

  return (
    <section className="filter-sort" aria-label="Filter and sort results">
      <div className="filter-sort__toolbar">
        <div className="filter-sort__group">
          <label className="filter-sort__label" htmlFor={sortId}>
            Sort
          </label>
          <div className="filter-sort__sort-row">
            <select
              id={sortId}
              className="filter-sort__select"
              value={sort.key}
              onChange={(e) => onSortChange({ ...sort, key: e.target.value as SortKey })}
            >
              {(Object.keys(SORT_LABELS) as SortKey[]).map((key) => (
                <option key={key} value={key}>
                  {SORT_LABELS[key]}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="filter-sort__direction"
              onClick={toggleDirection}
              aria-label={sort.direction === "asc" ? "Ascending order, switch to descending" : "Descending order, switch to ascending"}
            >
              {sort.direction === "asc" ? (
                <ArrowUp size={18} strokeWidth={2} aria-hidden="true" />
              ) : (
                <ArrowDown size={18} strokeWidth={2} aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        <fieldset className="filter-sort__group filter-sort__fieldset">
          <legend className="filter-sort__label">Stops</legend>
          <div className="filter-sort__segmented">
            {[
              { label: "Any", value: null },
              { label: "Direct", value: 0 },
              { label: "1 stop max", value: 1 },
            ].map((option) => (
              <label key={option.label} className="filter-sort__segment">
                <input
                  type="radio"
                  name="max-stops"
                  checked={filters.maxStops === option.value}
                  onChange={() => onFiltersChange({ ...filters, maxStops: option.value })}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="filter-sort__group filter-sort__group--price">
          <label className="filter-sort__label" htmlFor={priceId}>
            Max price {filters.maxPrice ? `$${filters.maxPrice.toLocaleString("en-US")}` : "— no limit"}
          </label>
          <input
            id={priceId}
            type="range"
            className="filter-sort__range"
            min={0}
            max={maxPossiblePrice}
            step={100}
            value={filters.maxPrice ?? maxPossiblePrice}
            onChange={(e) => {
              const value = Number(e.target.value);
              onFiltersChange({ ...filters, maxPrice: value >= maxPossiblePrice ? null : value });
            }}
          />
        </div>
      </div>

      {availableAirlines.length > 1 && (
        <fieldset className="filter-sort__airlines filter-sort__fieldset">
          <legend className="filter-sort__label">Airlines</legend>
          <div className="filter-sort__chips">
            {availableAirlines.map((airline) => (
              <label key={airline} className="filter-sort__chip">
                <input type="checkbox" checked={filters.airlines.includes(airline)} onChange={() => toggleAirline(airline)} />
                <span>{airline}</span>
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <p className="filter-sort__count" role="status">
        {resultCount} {resultCount === 1 ? "flight" : "flights"}
      </p>
    </section>
  );
}
