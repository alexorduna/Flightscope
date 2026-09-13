import { useMemo } from "react";
import type { NearbyPricesResponse } from "../../types/api";
import { formatPrice, formatShortDate, formatShortWeekday } from "../../utils/dates";
import "./NearbyDatePrices.css";

interface NearbyDatePricesProps {
  selectedDate: string;
  data: NearbyPricesResponse | null;
  isLoading?: boolean;
  onSelectDate: (date: string) => void;
  compact?: boolean;
}

export function NearbyDatePrices({
  selectedDate,
  data,
  isLoading = false,
  onSelectDate,
  compact = false,
}: NearbyDatePricesProps) {
  const cheapestAvailable = useMemo(() => {
    if (!data) return null;
    const available = data.prices.filter((entry) => entry.lowestPrice != null);
    if (available.length === 0) return null;
    return Math.min(...available.map((entry) => entry.lowestPrice as number));
  }, [data]);

  if (!data && !isLoading) return null;

  return (
    <div className="nearby-prices" aria-label="Prices on nearby dates">
      {!compact && <p className="nearby-prices__label">Prices on nearby dates</p>}

      {isLoading && !data && <p className="nearby-prices__status">Loading nearby prices…</p>}

      {data && (
        <div className="nearby-prices__strip" role="list">
          {data.prices.map((entry) => {
            const isSelected = entry.date === selectedDate;
            const isCheapest = entry.lowestPrice != null && entry.lowestPrice === cheapestAvailable;
            const isUnavailable = entry.lowestPrice == null;

            return (
              <button
                key={entry.date}
                type="button"
                role="listitem"
                className={[
                  "nearby-prices__day",
                  isSelected ? "nearby-prices__day--selected" : "",
                  isCheapest ? "nearby-prices__day--cheapest" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                aria-pressed={isSelected}
                aria-label={
                  isUnavailable
                    ? `${formatShortWeekday(entry.date)} ${formatShortDate(entry.date)}, no price`
                    : `${formatShortWeekday(entry.date)} ${formatShortDate(entry.date)}, from ${formatPrice(entry.lowestPrice!, data.currency)}`
                }
                disabled={isUnavailable || isSelected}
                onClick={() => {
                  if (isSelected) return;
                  onSelectDate(entry.date);
                }}
              >
                <span className="nearby-prices__weekday">{formatShortWeekday(entry.date)}</span>
                <span className="nearby-prices__date">{formatShortDate(entry.date)}</span>
                <span
                  className={`nearby-prices__price${isUnavailable ? " nearby-prices__price--muted" : ""}`}
                >
                  {isUnavailable ? "—" : formatPrice(entry.lowestPrice!, data.currency)}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {!compact && data && (
        <p className="nearby-prices__hint">
          Green dates are usually cheaper. Tap a day to search that departure.
        </p>
      )}
    </div>
  );
}
