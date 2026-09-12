import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FlightCard } from "./FlightCard";
import { itinerary } from "../../test/fixtures";
import { formatCurrency } from "../../utils/formatters";

describe("FlightCard", () => {
  it("shows price, stops, and airports for a direct flight", () => {
    render(<FlightCard itinerary={itinerary({ totalPrice: 3450, stops: 0, currency: "MXN" })} />);

    expect(screen.getByText("Direct")).toBeInTheDocument();
    expect(screen.getByText(formatCurrency(3450, "MXN"))).toBeInTheDocument();
    expect(screen.getByText("MTY")).toBeInTheDocument();
    expect(screen.getByText("TIJ")).toBeInTheDocument();
  });

  it("does not show the itinerary breakdown for direct flights", () => {
    render(<FlightCard itinerary={itinerary({ stops: 0 })} />);
    expect(screen.queryByText(/view full itinerary/i)).not.toBeInTheDocument();
  });

  it("allows expanding the breakdown of a connecting itinerary", async () => {
    const user = userEvent.setup();
    const multiLeg = itinerary({
      stops: 1,
      flights: [
        { id: "FL-1", airline: "Aeromexico", flightNumber: "AM 1", departureAirportCode: "MTY", departureTime: "2026-10-01T07:00:00.000Z", arrivalAirportCode: "MEX", arrivalTime: "2026-10-01T08:45:00.000Z", durationMinutes: 105, aircraft: "Embraer E190" },
        { id: "FL-2", airline: "Aeromexico", flightNumber: "AM 2", departureAirportCode: "MEX", departureTime: "2026-10-01T09:30:00.000Z", arrivalAirportCode: "TIJ", arrivalTime: "2026-10-01T13:00:00.000Z", durationMinutes: 210, aircraft: "Boeing 737-800" },
      ],
    });
    render(<FlightCard itinerary={multiLeg} />);

    const summary = screen.getByText(/view full itinerary/i);
    expect(summary).toBeInTheDocument();
    await user.click(summary);

    expect(screen.getByText(/AM 1/)).toBeInTheDocument();
  });
});
