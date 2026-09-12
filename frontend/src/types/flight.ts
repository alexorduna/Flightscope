/**
 * Mirrors the contract defined in backend/src/types/flight.ts.
 * A Flight is a non-stop segment; an Itinerary groups one or more Flight legs
 * (stops = flights.length - 1) with total price and total duration.
 */
export interface Flight {
  id: string;
  airline: string;
  flightNumber: string;
  departureAirportCode: string;
  departureTime: string;
  arrivalAirportCode: string;
  arrivalTime: string;
  durationMinutes: number;
  aircraft: string;
  carbonEmissionsKg?: number;
}

export interface Itinerary {
  id: string;
  flights: Flight[];
  stops: number;
  totalPrice: number;
  currency: string;
  totalDurationMinutes: number;
}
