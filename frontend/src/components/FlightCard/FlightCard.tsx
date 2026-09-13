import type { Itinerary } from "../../types/flight";
import { ChevronDown } from "lucide-react";
import { hasReturnLeg } from "../../utils/itinerary";
import { formatCurrency, formatTime } from "../../utils/formatters";
import { formatShortDate } from "../../utils/dates";
import { FlightLegSchedule } from "../FlightLegSchedule/FlightLegSchedule";
import "./FlightCard.css";
import "../FlightLegSchedule/FlightLegSchedule.css";

interface FlightCardProps {
  itinerary: Itinerary;
  returnDate?: string | null;
}

function formatLegDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function FlightCard({ itinerary, returnDate }: FlightCardProps) {
  const roundTrip = hasReturnLeg(itinerary);
  const outboundDate = formatLegDate(itinerary.flights[0].departureTime);
  const returnLegDate =
    (returnDate ? formatShortDate(returnDate) : null) ??
    (itinerary.returnFlights?.[0]?.departureTime
      ? formatLegDate(itinerary.returnFlights[0].departureTime)
      : "Return");

  const detailFlights = roundTrip
    ? [...itinerary.flights, ...(itinerary.returnFlights ?? [])]
    : itinerary.flights;
  const showDetails = detailFlights.length > 1;

  return (
    <li className="flight-card">
      <div className="flight-card__main">
        <div className="flight-card__legs-stack">
          <FlightLegSchedule
            label={`Outbound · ${outboundDate}`}
            flights={itinerary.flights}
            stops={itinerary.stops}
            durationMinutes={itinerary.totalDurationMinutes}
          />

          {roundTrip && itinerary.returnFlights && itinerary.returnDurationMinutes != null && (
            <FlightLegSchedule
              label={`Return · ${returnLegDate}`}
              flights={itinerary.returnFlights}
              stops={itinerary.returnStops ?? 0}
              durationMinutes={itinerary.returnDurationMinutes}
            />
          )}
        </div>

        <div className="flight-card__fare">
          <span className="flight-card__price mono">{formatCurrency(itinerary.totalPrice, itinerary.currency)}</span>
          <span className="flight-card__price-label">{roundTrip ? "round trip" : "per person"}</span>
        </div>
      </div>

      {showDetails && (
        <details className="flight-card__details">
          <summary>
            <span>{roundTrip ? "Full round-trip details" : "Itinerary details"}</span>
            <ChevronDown size={16} className="flight-card__chevron" aria-hidden="true" />
          </summary>
          <ol className="flight-card__legs">
            {itinerary.flights.map((flight) => (
              <li key={flight.id} className="flight-card__leg">
                <span className="flight-card__leg-tag">Outbound</span>
                <span className="mono">{formatTime(flight.departureTime)}</span>
                <span className="flight-card__leg-route">
                  {flight.departureAirportCode} → {flight.arrivalAirportCode}
                </span>
                <span className="mono">{formatTime(flight.arrivalTime)}</span>
                <span className="flight-card__leg-flight">
                  {flight.airline} {flight.flightNumber}
                </span>
                <span className="flight-card__leg-aircraft">{flight.aircraft}</span>
              </li>
            ))}
            {(itinerary.returnFlights ?? []).map((flight) => (
              <li key={flight.id} className="flight-card__leg">
                <span className="flight-card__leg-tag flight-card__leg-tag--return">Return</span>
                <span className="mono">{formatTime(flight.departureTime)}</span>
                <span className="flight-card__leg-route">
                  {flight.departureAirportCode} → {flight.arrivalAirportCode}
                </span>
                <span className="mono">{formatTime(flight.arrivalTime)}</span>
                <span className="flight-card__leg-flight">
                  {flight.airline} {flight.flightNumber}
                </span>
                <span className="flight-card__leg-aircraft">{flight.aircraft}</span>
              </li>
            ))}
          </ol>
        </details>
      )}
    </li>
  );
}
