import type { Flight, Itinerary } from "../types/flight";
import type { PricePoint } from "../types/api";
import type { SearchOptions } from "../types/searchOptions";

/**
 * Integration with SerpApi (the "google_flights" engine -
 * https://serpapi.com/google-flights-api).
 *
 * IMPORTANT: this module is complete and ready to work, but it stays
 * INACTIVE as long as the SERPAPI_KEY environment variable doesn't exist.
 * `isSerpApiEnabled()` is the single point of control: as soon as the key is
 * added to .env (see .env.example) and the backend restarts, it starts being
 * used without touching a single line of code. See services/flightService.ts
 * for the decision order (cache -> SerpApi if active -> mock fallback).
 */

const SERPAPI_BASE_URL = "https://serpapi.com/search.json";
const REQUEST_TIMEOUT_MS = 8000;

export function isSerpApiEnabled(): boolean {
  return Boolean(process.env.SERPAPI_KEY && process.env.SERPAPI_KEY.trim().length > 0);
}

/** Typed errors: let the caller distinguish the cause (it gets logged) before falling back to mock. */
export class SerpApiTimeoutError extends Error {
  constructor() {
    super("SerpApi did not respond in time");
    this.name = "SerpApiTimeoutError";
  }
}
export class SerpApiNetworkError extends Error {
  constructor(cause: unknown) {
    super(`Network error calling SerpApi: ${String(cause)}`);
    this.name = "SerpApiNetworkError";
  }
}
export class SerpApiQuotaError extends Error {
  constructor() {
    super("SerpApi search quota has been exhausted");
    this.name = "SerpApiQuotaError";
  }
}
export class SerpApiUnexpectedResponseError extends Error {
  constructor(detail: string) {
    super(`Unexpected SerpApi response: ${detail}`);
    this.name = "SerpApiUnexpectedResponseError";
  }
}

// --- Partial shapes of the SerpApi response (only what we use) -----------

interface SerpApiAirportEndpoint {
  id: string;
  time: string;
}

interface SerpApiFlightSegment {
  departure_airport: SerpApiAirportEndpoint;
  arrival_airport: SerpApiAirportEndpoint;
  airline: string;
  flight_number: string;
  airplane?: string;
  duration: number;
}

interface SerpApiItinerary {
  flights: SerpApiFlightSegment[];
  total_duration: number;
  price: number;
  carbon_emissions?: { this_flight?: number };
  departure_token?: string;
}

interface SerpApiSearchResponse {
  error?: string;
  best_flights?: SerpApiItinerary[];
  other_flights?: SerpApiItinerary[];
  price_insights?: {
    lowest_price?: number;
    typical_price_range?: [number, number];
    price_history?: Array<[number, number]>;
  };
}

async function callSerpApi(params: Record<string, string>): Promise<SerpApiSearchResponse> {
  const apiKey = process.env.SERPAPI_KEY;
  if (!apiKey) {
    // Should never reach here since isSerpApiEnabled() is checked beforehand,
    // but it's left as an explicit safeguard.
    throw new SerpApiUnexpectedResponseError("SERPAPI_KEY is not configured");
  }

  const url = new URL(SERPAPI_BASE_URL);
  url.searchParams.set("engine", "google_flights");
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("currency", "MXN");
  url.searchParams.set("hl", "en");
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(url.toString(), { signal: controller.signal });
  } catch (cause) {
    if (cause instanceof Error && cause.name === "AbortError") {
      throw new SerpApiTimeoutError();
    }
    throw new SerpApiNetworkError(cause);
  } finally {
    clearTimeout(timeout);
  }

  if (response.status === 429) {
    throw new SerpApiQuotaError();
  }
  if (!response.ok) {
    throw new SerpApiUnexpectedResponseError(`HTTP ${response.status}`);
  }

  let body: SerpApiSearchResponse;
  try {
    body = (await response.json()) as SerpApiSearchResponse;
  } catch (cause) {
    throw new SerpApiUnexpectedResponseError(`Invalid JSON: ${String(cause)}`);
  }

  if (body.error) {
    if (/quota|limit/i.test(body.error)) {
      throw new SerpApiQuotaError();
    }
    throw new SerpApiUnexpectedResponseError(body.error);
  }

  return body;
}

function mapSegmentToFlight(segment: SerpApiFlightSegment, idSuffix: string): Flight {
  return {
    id: `FL-${idSuffix}`,
    airline: segment.airline,
    flightNumber: segment.flight_number,
    departureAirportCode: segment.departure_airport.id,
    departureTime: new Date(segment.departure_airport.time).toISOString(),
    arrivalAirportCode: segment.arrival_airport.id,
    arrivalTime: new Date(segment.arrival_airport.time).toISOString(),
    durationMinutes: segment.duration,
    aircraft: segment.airplane ?? "Not specified",
  };
}

function mapToItinerary(raw: SerpApiItinerary, idSuffix: string): Itinerary {
  const flights = raw.flights.map((segment, i) => mapSegmentToFlight(segment, `${idSuffix}-${i}`));
  return {
    id: `IT-${idSuffix}`,
    flights,
    stops: flights.length - 1,
    totalPrice: raw.price,
    currency: "MXN",
    totalDurationMinutes: raw.total_duration,
  };
}

function mapRawToReturnLeg(raw: SerpApiItinerary, idSuffix: string): Pick<Itinerary, "returnFlights" | "returnStops" | "returnDurationMinutes"> {
  const returnFlights = raw.flights.map((segment, i) => mapSegmentToFlight(segment, `${idSuffix}-ret-${i}`));
  return {
    returnFlights,
    returnStops: returnFlights.length - 1,
    returnDurationMinutes: raw.total_duration,
  };
}

async function fetchReturnLegViaSerpApi(
  origin: string,
  destination: string,
  outboundDate: string,
  returnDate: string,
  options: SearchOptions,
  departureToken: string,
  idSuffix: string
): Promise<Pick<Itinerary, "returnFlights" | "returnStops" | "returnDurationMinutes"> | null> {
  const travelClassMap: Record<SearchOptions["cabinClass"], string> = {
    economy: "1",
    premium_economy: "2",
    business: "3",
    first: "4",
  };

  const body = await callSerpApi({
    departure_id: origin.toUpperCase(),
    arrival_id: destination.toUpperCase(),
    outbound_date: outboundDate,
    return_date: returnDate,
    type: "1",
    departure_token: departureToken,
    travel_class: travelClassMap[options.cabinClass],
    adults: String(options.passengers.adults),
    children: String(options.passengers.children),
    infants_on_lap: String(options.passengers.infants),
  });

  const candidate = [...(body.best_flights ?? []), ...(body.other_flights ?? [])].find(
    (itinerary) => itinerary.flights.length > 0
  );
  if (!candidate) return null;

  return mapRawToReturnLeg(candidate, idSuffix);
}

async function attachReturnLegsViaSerpApi(
  origin: string,
  destination: string,
  outboundDate: string,
  options: SearchOptions,
  entries: Array<{ itinerary: Itinerary; departureToken?: string }>
): Promise<Itinerary[]> {
  if (options.tripType !== "round-trip" || !options.returnDate) {
    return entries.map((entry) => entry.itinerary);
  }

  const limited = entries.slice(0, 8);
  const enriched = await Promise.all(
    limited.map(async (entry, index) => {
      if (!entry.departureToken) return entry.itinerary;

      try {
        const returnLeg = await fetchReturnLegViaSerpApi(
          origin,
          destination,
          outboundDate,
          options.returnDate as string,
          options,
          entry.departureToken,
          `${entry.itinerary.id}-${index}`
        );
        return returnLeg ? { ...entry.itinerary, ...returnLeg } : entry.itinerary;
      } catch {
        return entry.itinerary;
      }
    })
  );

  return [...enriched, ...entries.slice(8).map((entry) => entry.itinerary)];
}

export async function searchFlightsViaSerpApi(
  origin: string,
  destination: string,
  date: string,
  options: SearchOptions
): Promise<Itinerary[]> {
  const travelClassMap: Record<SearchOptions["cabinClass"], string> = {
    economy: "1",
    premium_economy: "2",
    business: "3",
    first: "4",
  };

  const body = await callSerpApi({
    departure_id: origin.toUpperCase(),
    arrival_id: destination.toUpperCase(),
    outbound_date: date,
    type: options.tripType === "round-trip" ? "1" : "2",
    ...(options.returnDate ? { return_date: options.returnDate } : {}),
    travel_class: travelClassMap[options.cabinClass],
    adults: String(options.passengers.adults),
    children: String(options.passengers.children),
    infants_on_lap: String(options.passengers.infants),
  });

  const all = [...(body.best_flights ?? []), ...(body.other_flights ?? [])];
  // SerpApi occasionally omits `price` on some `other_flights` entries (seen
  // in practice, not documented) - those can't be shown to the user, so they
  // are dropped rather than rendered as a broken/NaN price.
  const raw = all.filter(
    (itinerary) =>
      typeof itinerary.price === "number" &&
      Number.isFinite(itinerary.price) &&
      typeof itinerary.total_duration === "number" &&
      Number.isFinite(itinerary.total_duration) &&
      itinerary.flights.length > 0
  );
  if (raw.length === 0) {
    throw new SerpApiUnexpectedResponseError("The response did not include any flights with a valid price");
  }

  const entries = raw.map((itinerary, i) => ({
    itinerary: mapToItinerary(itinerary, `${origin}-${destination}-${date}-${i}`),
    departureToken: itinerary.departure_token,
  }));

  return attachReturnLegsViaSerpApi(origin, destination, date, options, entries);
}

/** Lightweight lookup used by the nearby-date price strip (Google Flights-style). */
export async function fetchLowestPriceForDateViaSerpApi(
  origin: string,
  destination: string,
  date: string
): Promise<number | null> {
  const body = await callSerpApi({
    departure_id: origin.toUpperCase(),
    arrival_id: destination.toUpperCase(),
    outbound_date: date,
    type: "2",
  });

  if (typeof body.price_insights?.lowest_price === "number" && Number.isFinite(body.price_insights.lowest_price)) {
    return body.price_insights.lowest_price;
  }

  const all = [...(body.best_flights ?? []), ...(body.other_flights ?? [])];
  const prices = all
    .map((itinerary) => itinerary.price)
    .filter((price): price is number => typeof price === "number" && Number.isFinite(price));

  return prices.length > 0 ? Math.min(...prices) : null;
}

export async function fetchPriceInsightsViaSerpApi(
  origin: string,
  destination: string,
  date: string
): Promise<{ typicalPriceRange: { low: number; high: number }; history: PricePoint[] }> {
  const body = await callSerpApi({
    departure_id: origin.toUpperCase(),
    arrival_id: destination.toUpperCase(),
    outbound_date: date,
    type: "2",
  });

  const insights = body.price_insights;
  if (!insights || !insights.typical_price_range || !insights.price_history) {
    throw new SerpApiUnexpectedResponseError("The response did not include price_insights");
  }

  return {
    typicalPriceRange: { low: insights.typical_price_range[0], high: insights.typical_price_range[1] },
    history: insights.price_history.map(([timestamp, price]) => ({
      date: new Date(timestamp * 1000).toISOString().slice(0, 10),
      price,
    })),
  };
}
