import type { Flight, Itinerary } from "../types/flight";

export function hasReturnLeg(itinerary: Itinerary): boolean {
  return (itinerary.returnFlights?.length ?? 0) > 0;
}

export function allFlights(itinerary: Itinerary): Flight[] {
  return [...itinerary.flights, ...(itinerary.returnFlights ?? [])];
}

export function itineraryAirlines(itinerary: Itinerary): string[] {
  const airlines = new Set(allFlights(itinerary).map((flight) => flight.airline));
  return Array.from(airlines);
}
