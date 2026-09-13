import type { Flight } from "../../types/flight";
import { Badge } from "../ui/Badge";
import { formatDuration, formatTime, stopsLabel } from "../../utils/formatters";
import "./FlightLegSchedule.css";

interface FlightLegScheduleProps {
  label: string;
  flights: Flight[];
  stops: number;
  durationMinutes: number;
}

export function FlightLegSchedule({ label, flights, stops, durationMinutes }: FlightLegScheduleProps) {
  const first = flights[0];
  const last = flights[flights.length - 1];

  return (
    <div className="flight-leg">
      <p className="flight-leg__label">{label}</p>
      <div className="flight-leg__row">
        <div className="flight-leg__schedule">
          <div className="flight-leg__endpoint">
            <time className="flight-leg__time mono">{formatTime(first.departureTime)}</time>
            <span className="flight-leg__code mono">{first.departureAirportCode}</span>
          </div>

          <div className="flight-leg__connector" aria-hidden="true">
            <span className="flight-leg__duration mono">{formatDuration(durationMinutes)}</span>
            <span className="flight-leg__track">
              <span className="flight-leg__track-line" />
            </span>
          </div>

          <div className="flight-leg__endpoint flight-leg__endpoint--arrive">
            <time className="flight-leg__time mono">{formatTime(last.arrivalTime)}</time>
            <span className="flight-leg__code mono">{last.arrivalAirportCode}</span>
          </div>
        </div>

        <div className="flight-leg__meta">
          <Badge variant={stops === 0 ? "success" : "warning"}>{stopsLabel(stops)}</Badge>
          <span className="flight-leg__airline">{first.airline}</span>
        </div>
      </div>
    </div>
  );
}
