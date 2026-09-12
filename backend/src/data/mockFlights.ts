import type { Flight, Itinerary } from "../types/flight";
import type { PricePoint } from "../types/api";

/**
 * Mock data generator. This file is the fallback that guarantees the app
 * works completely WITHOUT a SerpApi key (see services/serpapi.ts and
 * services/flightService.ts for how and when this fallback is used).
 *
 * 4 hand-"curated" routes with realistic data are defined (the MTY<->TIJ
 * reference route plus 3 additional routes) so the demo doesn't look limited
 * to a single airport pair. Any other origin/destination pair falls back to
 * a generic but deterministic generator (same input -> same output, useful
 * for tests and to keep the "price trend" stable).
 */

const AIRCRAFT = ["Airbus A320", "Airbus A321neo", "Boeing 737-800", "Embraer E190"];
const GENERIC_AIRLINES = ["Aeromexico", "Viva Aerobus", "Volaris", "American Airlines", "Delta Air Lines", "United Airlines"];

interface LegSpec {
  from: string;
  to: string;
  airline: string;
  flightNumber: string;
  aircraft: string;
  departureOffsetMinutes: number;
  durationMinutes: number;
  carbonEmissionsKg?: number;
}

interface ItinerarySpec {
  legs: LegSpec[];
  totalPrice: number;
}

function isoAt(date: string, offsetMinutes: number): string {
  // Deliberate simplification: the airport's local time is treated as if it
  // were UTC. There is no real timezone handling in this project (out of
  // scope for a demo), but durations and the chronological order between
  // flights stay consistent.
  const base = new Date(`${date}T00:00:00.000Z`).getTime();
  return new Date(base + offsetMinutes * 60_000).toISOString();
}

function buildFlight(date: string, idSuffix: string, spec: LegSpec): Flight {
  return {
    id: `FL-${idSuffix}`,
    airline: spec.airline,
    flightNumber: spec.flightNumber,
    departureAirportCode: spec.from,
    departureTime: isoAt(date, spec.departureOffsetMinutes),
    arrivalAirportCode: spec.to,
    arrivalTime: isoAt(date, spec.departureOffsetMinutes + spec.durationMinutes),
    durationMinutes: spec.durationMinutes,
    aircraft: spec.aircraft,
    carbonEmissionsKg: spec.carbonEmissionsKg,
  };
}

function buildItinerary(date: string, idSuffix: string, spec: ItinerarySpec): Itinerary {
  const flights = spec.legs.map((leg, i) => buildFlight(date, `${idSuffix}-${i}`, leg));
  const first = flights[0];
  const last = flights[flights.length - 1];
  const totalDurationMinutes = Math.round(
    (new Date(last.arrivalTime).getTime() - new Date(first.departureTime).getTime()) / 60_000
  );
  return {
    id: `IT-${idSuffix}`,
    flights,
    stops: flights.length - 1,
    totalPrice: spec.totalPrice,
    currency: "MXN",
    totalDurationMinutes,
  };
}

// --- Hand-curated routes ---------------------------------------------------

type RouteBuilder = () => ItinerarySpec[];

const ROUTES: Record<string, RouteBuilder> = {
  "MTY-TIJ": () => [
    {
      totalPrice: 3450,
      legs: [
        { from: "MTY", to: "TIJ", airline: "Volaris", flightNumber: "Y4 2310", aircraft: "Airbus A320", departureOffsetMinutes: 6 * 60 + 15, durationMinutes: 165, carbonEmissionsKg: 210 },
      ],
    },
    {
      totalPrice: 3190,
      legs: [
        { from: "MTY", to: "TIJ", airline: "Viva Aerobus", flightNumber: "VB 4521", aircraft: "Airbus A320", departureOffsetMinutes: 14 * 60 + 40, durationMinutes: 170, carbonEmissionsKg: 215 },
      ],
    },
    {
      totalPrice: 3890,
      legs: [
        { from: "MTY", to: "MEX", airline: "Aeromexico", flightNumber: "AM 405", aircraft: "Embraer E190", departureOffsetMinutes: 7 * 60, durationMinutes: 105, carbonEmissionsKg: 140 },
        { from: "MEX", to: "TIJ", airline: "Aeromexico", flightNumber: "AM 118", aircraft: "Boeing 737-800", departureOffsetMinutes: 9 * 60 + 45, durationMinutes: 200, carbonEmissionsKg: 260 },
      ],
    },
  ],
  "TIJ-MTY": () => [
    {
      totalPrice: 3520,
      legs: [
        { from: "TIJ", to: "MTY", airline: "Volaris", flightNumber: "Y4 2311", aircraft: "Airbus A320", departureOffsetMinutes: 8 * 60 + 10, durationMinutes: 175, carbonEmissionsKg: 212 },
      ],
    },
    {
      totalPrice: 3250,
      legs: [
        { from: "TIJ", to: "MTY", airline: "Viva Aerobus", flightNumber: "VB 4522", aircraft: "Airbus A320", departureOffsetMinutes: 16 * 60 + 5, durationMinutes: 168, carbonEmissionsKg: 214 },
      ],
    },
    {
      totalPrice: 3990,
      legs: [
        { from: "TIJ", to: "MEX", airline: "Aeromexico", flightNumber: "AM 119", aircraft: "Boeing 737-800", departureOffsetMinutes: 6 * 60 + 30, durationMinutes: 205, carbonEmissionsKg: 262 },
        { from: "MEX", to: "MTY", airline: "Aeromexico", flightNumber: "AM 404", aircraft: "Embraer E190", departureOffsetMinutes: 10 * 60 + 30, durationMinutes: 100, carbonEmissionsKg: 138 },
      ],
    },
  ],
  "MEX-CUN": () => [
    { totalPrice: 2450, legs: [{ from: "MEX", to: "CUN", airline: "Aeromexico", flightNumber: "AM 660", aircraft: "Airbus A321neo", departureOffsetMinutes: 8 * 60, durationMinutes: 130, carbonEmissionsKg: 165 }] },
    { totalPrice: 2190, legs: [{ from: "MEX", to: "CUN", airline: "Volaris", flightNumber: "Y4 750", aircraft: "Airbus A320", departureOffsetMinutes: 19 * 60 + 15, durationMinutes: 135, carbonEmissionsKg: 168 }] },
    {
      totalPrice: 2790,
      legs: [
        { from: "MEX", to: "MTY", airline: "Viva Aerobus", flightNumber: "VB 210", aircraft: "Airbus A320", departureOffsetMinutes: 6 * 60 + 30, durationMinutes: 100, carbonEmissionsKg: 132 },
        { from: "MTY", to: "CUN", airline: "Viva Aerobus", flightNumber: "VB 880", aircraft: "Airbus A320", departureOffsetMinutes: 9 * 60, durationMinutes: 150, carbonEmissionsKg: 190 },
      ],
    },
  ],
  "CUN-MEX": () => [
    { totalPrice: 2510, legs: [{ from: "CUN", to: "MEX", airline: "Aeromexico", flightNumber: "AM 661", aircraft: "Airbus A321neo", departureOffsetMinutes: 10 * 60 + 20, durationMinutes: 130, carbonEmissionsKg: 165 }] },
    { totalPrice: 2260, legs: [{ from: "CUN", to: "MEX", airline: "Volaris", flightNumber: "Y4 751", aircraft: "Airbus A320", departureOffsetMinutes: 21 * 60, durationMinutes: 135, carbonEmissionsKg: 168 }] },
  ],
  "GDL-LAX": () => [
    { totalPrice: 4890, legs: [{ from: "GDL", to: "LAX", airline: "Volaris", flightNumber: "Y4 990", aircraft: "Airbus A320", departureOffsetMinutes: 9 * 60, durationMinutes: 195, carbonEmissionsKg: 245 }] },
    {
      totalPrice: 5600,
      legs: [
        { from: "GDL", to: "MEX", airline: "Aeromexico", flightNumber: "AM 302", aircraft: "Embraer E190", departureOffsetMinutes: 7 * 60 + 15, durationMinutes: 85, carbonEmissionsKg: 110 },
        { from: "MEX", to: "LAX", airline: "Aeromexico", flightNumber: "AM 668", aircraft: "Boeing 737-800", departureOffsetMinutes: 9 * 60 + 30, durationMinutes: 220, carbonEmissionsKg: 280 },
      ],
    },
  ],
  "LAX-GDL": () => [
    { totalPrice: 4950, legs: [{ from: "LAX", to: "GDL", airline: "Volaris", flightNumber: "Y4 991", aircraft: "Airbus A320", departureOffsetMinutes: 13 * 60 + 30, durationMinutes: 200, carbonEmissionsKg: 248 }] },
  ],
  "MEX-JFK": () => [
    { totalPrice: 7200, legs: [{ from: "MEX", to: "JFK", airline: "Aeromexico", flightNumber: "AM 20", aircraft: "Airbus A321neo", departureOffsetMinutes: 23 * 60 + 55, durationMinutes: 320, carbonEmissionsKg: 410 }] },
    {
      totalPrice: 6100,
      legs: [
        { from: "MEX", to: "ATL", airline: "Delta Air Lines", flightNumber: "DL 1487", aircraft: "Boeing 737-800", departureOffsetMinutes: 6 * 60 + 45, durationMinutes: 240, carbonEmissionsKg: 300 },
        { from: "ATL", to: "JFK", airline: "Delta Air Lines", flightNumber: "DL 2201", aircraft: "Airbus A320", departureOffsetMinutes: 11 * 60 + 30, durationMinutes: 130, carbonEmissionsKg: 165 },
      ],
    },
  ],
  "JFK-MEX": () => [
    { totalPrice: 7350, legs: [{ from: "JFK", to: "MEX", airline: "Aeromexico", flightNumber: "AM 21", aircraft: "Airbus A321neo", departureOffsetMinutes: 8 * 60 + 10, durationMinutes: 320, carbonEmissionsKg: 412 }] },
  ],
};

// --- Generic fallback for non-curated routes -------------------------------

function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash;
}

/** Pseudo-random generator (mulberry32) so the same key always produces the same "randomness". */
function seededRandom(seed: number): () => number {
  let t = seed;
  return function () {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function genericRoute(origin: string, destination: string, date: string): ItinerarySpec[] {
  const rng = seededRandom(hashString(`${origin}-${destination}-${date}`));
  const count = 2 + Math.floor(rng() * 2); // 2 or 3 itineraries
  const specs: ItinerarySpec[] = [];
  for (let i = 0; i < count; i++) {
    const airline = GENERIC_AIRLINES[Math.floor(rng() * GENERIC_AIRLINES.length)];
    const aircraft = AIRCRAFT[Math.floor(rng() * AIRCRAFT.length)];
    const direct = rng() > 0.45;
    const basePrice = 2200 + Math.floor(rng() * 4500);
    const departureOffsetMinutes = Math.floor(rng() * 20) * 60 + Math.floor(rng() * 60);
    const flightNumber = `${airline.slice(0, 2).toUpperCase()} ${100 + Math.floor(rng() * 899)}`;

    if (direct) {
      const durationMinutes = 90 + Math.floor(rng() * 210);
      specs.push({
        totalPrice: basePrice,
        legs: [{ from: origin, to: destination, airline, aircraft, flightNumber, departureOffsetMinutes, durationMinutes }],
      });
    } else {
      const hub = origin === "MEX" || destination === "MEX" ? "MTY" : "MEX";
      const leg1Duration = 80 + Math.floor(rng() * 90);
      const layover = 40 + Math.floor(rng() * 80);
      const leg2Duration = 100 + Math.floor(rng() * 150);
      specs.push({
        totalPrice: basePrice + 350,
        legs: [
          { from: origin, to: hub, airline, aircraft, flightNumber, departureOffsetMinutes, durationMinutes: leg1Duration },
          {
            from: hub,
            to: destination,
            airline,
            aircraft,
            flightNumber: `${airline.slice(0, 2).toUpperCase()} ${100 + Math.floor(rng() * 899)}`,
            departureOffsetMinutes: departureOffsetMinutes + leg1Duration + layover,
            durationMinutes: leg2Duration,
          },
        ],
      });
    }
  }
  return specs;
}

export function getMockItineraries(origin: string, destination: string, date: string): Itinerary[] {
  const key = `${origin.toUpperCase()}-${destination.toUpperCase()}`;
  const builder = ROUTES[key];
  const specs = builder ? builder() : genericRoute(origin.toUpperCase(), destination.toUpperCase(), date);
  return specs.map((spec, i) => buildItinerary(date, `${key}-${date}-${i}`, spec));
}

export function getMockPriceHistory(origin: string, destination: string, date: string): PricePoint[] {
  const itineraries = getMockItineraries(origin, destination, date);
  const cheapest = Math.min(...itineraries.map((it) => it.totalPrice));
  const rng = seededRandom(hashString(`trend-${origin}-${destination}-${date}`));
  const days = 14;
  const history: PricePoint[] = [];
  const baseDate = new Date(`${date}T00:00:00.000Z`).getTime();
  for (let i = days; i >= 0; i--) {
    const drift = (rng() - 0.5) * 0.18; // +/-9% daily variation
    const trendUpCloserToDate = 1 + (days - i) * 0.01; // tends to rise closer to the travel date
    const price = Math.round(cheapest * (0.85 + drift) * trendUpCloserToDate);
    const pointDate = new Date(baseDate - i * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    history.push({ date: pointDate, price: Math.max(price, Math.round(cheapest * 0.6)) });
  }
  return history;
}
