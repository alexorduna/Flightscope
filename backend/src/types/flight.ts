/**
 * A single non-stop flight segment (one takeoff and one landing).
 * An Itinerary groups one or more Flight legs when the trip has layovers.
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

/**
 * A full travel offer as shown in search results: one or more Flight legs in
 * order (stops = flights.length - 1), with total price and total duration
 * already computed so the UI doesn't have to repeat that logic.
 */
export interface Itinerary {
  id: string;
  flights: Flight[];
  stops: number;
  totalPrice: number;
  currency: string;
  totalDurationMinutes: number;
}
