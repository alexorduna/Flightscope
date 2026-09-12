import type { Airport } from "../types/airport";

/**
 * Static list of major Mexican and US airports, used for the origin/
 * destination autocomplete. In a real product this would come from a
 * reference service (or from SerpApi itself); static data is enough here
 * since it doesn't change often.
 */
export const AIRPORTS: Airport[] = [
  { iataCode: "MTY", name: "Gral. Mariano Escobedo International Airport", city: "Monterrey", country: "Mexico" },
  { iataCode: "TIJ", name: "General Abelardo L. Rodriguez International Airport", city: "Tijuana", country: "Mexico" },
  { iataCode: "MEX", name: "Benito Juarez International Airport", city: "Mexico City", country: "Mexico" },
  { iataCode: "GDL", name: "Miguel Hidalgo y Costilla International Airport", city: "Guadalajara", country: "Mexico" },
  { iataCode: "CUN", name: "Cancun International Airport", city: "Cancun", country: "Mexico" },
  { iataCode: "PVR", name: "Lic. Gustavo Diaz Ordaz International Airport", city: "Puerto Vallarta", country: "Mexico" },
  { iataCode: "SJD", name: "Los Cabos International Airport", city: "San Jose del Cabo", country: "Mexico" },
  { iataCode: "MID", name: "Manuel Crescencio Rejon International Airport", city: "Merida", country: "Mexico" },
  { iataCode: "CUL", name: "Culiacan Federal International Airport", city: "Culiacan", country: "Mexico" },
  { iataCode: "HMO", name: "General Ignacio Pesqueira Garcia International Airport", city: "Hermosillo", country: "Mexico" },
  { iataCode: "BJX", name: "Guanajuato International Airport", city: "Leon/Guanajuato", country: "Mexico" },
  { iataCode: "SJU", name: "Aguascalientes International Airport", city: "Aguascalientes", country: "Mexico" },
  { iataCode: "LAX", name: "Los Angeles International Airport", city: "Los Angeles", country: "United States" },
  { iataCode: "JFK", name: "John F. Kennedy International Airport", city: "New York", country: "United States" },
  { iataCode: "ORD", name: "O'Hare International Airport", city: "Chicago", country: "United States" },
  { iataCode: "DFW", name: "Dallas/Fort Worth International Airport", city: "Dallas", country: "United States" },
  { iataCode: "MIA", name: "Miami International Airport", city: "Miami", country: "United States" },
  { iataCode: "SFO", name: "San Francisco International Airport", city: "San Francisco", country: "United States" },
  { iataCode: "LAS", name: "Harry Reid International Airport", city: "Las Vegas", country: "United States" },
  { iataCode: "IAH", name: "George Bush Intercontinental Airport", city: "Houston", country: "United States" },
];

export function findAirport(iataCode: string): Airport | undefined {
  return AIRPORTS.find((a) => a.iataCode === iataCode.toUpperCase());
}

export function searchAirports(query: string): Airport[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return AIRPORTS;
  return AIRPORTS.filter(
    (a) =>
      a.iataCode.toLowerCase().includes(normalized) ||
      a.name.toLowerCase().includes(normalized) ||
      a.city.toLowerCase().includes(normalized)
  );
}
