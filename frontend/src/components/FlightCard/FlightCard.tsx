import type { Itinerary } from "../../types/flight";
import { formatCurrency, formatDuration, formatTime, stopsLabel } from "../../utils/formatters";
import "./FlightCard.css";

interface FlightCardProps {
  itinerary: Itinerary;
}

export function FlightCard({ itinerary }: FlightCardProps) {
  const first = itinerary.flights[0];
  const last = itinerary.flights[itinerary.flights.length - 1];

  return (
    <li className="flight-card">
      <div className="flight-card__summary">
        <div className="flight-card__route">
          <span className="mono flight-card__time">{formatTime(first.departureTime)}</span>
          <span className="flight-card__airport">{first.departureAirportCode}</span>
          <span className="flight-card__path" aria-hidden="true">
            <span className="flight-card__line" />
            <span className="flight-card__plane">✈</span>
            <span className="flight-card__line" />
          </span>
          <span className="flight-card__airport">{last.arrivalAirportCode}</span>
          <span className="mono flight-card__time">{formatTime(last.arrivalTime)}</span>
        </div>

        <div className="flight-card__meta">
          <span className={`flight-card__stops flight-card__stops--${itinerary.stops === 0 ? "direct" : "connecting"}`}>
            {stopsLabel(itinerary.stops)}
          </span>
          <span className="flight-card__duration mono">{formatDuration(itinerary.totalDurationMinutes)}</span>
          <span className="flight-card__airline">{first.airline}</span>
        </div>

        <div className="flight-card__price-block">
          <span className="mono flight-card__price">{formatCurrency(itinerary.totalPrice, itinerary.currency)}</span>
          <span className="flight-card__price-label">per person</span>
        </div>
      </div>

      {itinerary.flights.length > 1 && (
        <details className="flight-card__details">
          <summary>View full itinerary ({itinerary.flights.length} flights)</summary>
          <ol className="flight-card__legs">
            {itinerary.flights.map((flight) => (
              <li key={flight.id} className="flight-card__leg">
                <span className="mono">{formatTime(flight.departureTime)}</span>
                <span>
                  {flight.departureAirportCode} → {flight.arrivalAirportCode}
                </span>
                <span className="mono">{formatTime(flight.arrivalTime)}</span>
                <span>
                  {flight.airline} {flight.flightNumber}
                </span>
                <span>{flight.aircraft}</span>
              </li>
            ))}
          </ol>
        </details>
      )}
    </li>
  );
}
