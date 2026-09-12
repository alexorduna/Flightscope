import type { Flight, Itinerary } from "../types/flight";

function flight(overrides: Partial<Flight> = {}): Flight {
  return {
    id: "FL-1",
    airline: "Aeromexico",
    flightNumber: "AM 100",
    departureAirportCode: "MTY",
    departureTime: "2026-10-01T06:00:00.000Z",
    arrivalAirportCode: "TIJ",
    arrivalTime: "2026-10-01T08:30:00.000Z",
    durationMinutes: 150,
    aircraft: "Airbus A320",
    ...overrides,
  };
}

export function itinerary(overrides: Partial<Itinerary> = {}): Itinerary {
  return {
    id: "IT-1",
    flights: [flight()],
    stops: 0,
    totalPrice: 3000,
    currency: "MXN",
    totalDurationMinutes: 150,
    ...overrides,
  };
}

export const SAMPLE_ITINERARIES: Itinerary[] = [
  itinerary({ id: "cheap-direct", totalPrice: 3190, stops: 0, totalDurationMinutes: 170, flights: [flight({ airline: "Viva Aerobus" })] }),
  itinerary({ id: "expensive-direct", totalPrice: 3450, stops: 0, totalDurationMinutes: 165, flights: [flight({ airline: "Volaris" })] }),
  itinerary({
    id: "one-stop",
    totalPrice: 3890,
    stops: 1,
    totalDurationMinutes: 380,
    flights: [flight({ airline: "Aeromexico" }), flight({ id: "FL-2", airline: "Aeromexico" })],
  }),
];
