import { Router } from "express";
import { findAirport } from "../data/airports";
import { searchFlights } from "../services/flightService";
import { getPriceInsights } from "../services/priceInsightsService";
import { getNearbyPrices } from "../services/nearbyPricesService";
import { parseSearchOptions } from "../utils/parseSearchOptions";

export const flightsRouter = Router();

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

interface ValidatedQuery {
  origin: string;
  destination: string;
  date: string;
}

function validateSearchParams(query: Record<string, unknown>): { ok: true; value: ValidatedQuery } | { ok: false; error: string } {
  const origin = typeof query.origin === "string" ? query.origin.trim().toUpperCase() : "";
  const destination = typeof query.destination === "string" ? query.destination.trim().toUpperCase() : "";
  const date = typeof query.date === "string" ? query.date.trim() : "";

  if (!origin || !destination || !date) {
    return { ok: false, error: "The 'origin', 'destination', and 'date' parameters are required." };
  }
  if (!DATE_PATTERN.test(date)) {
    return { ok: false, error: "The 'date' parameter must use the YYYY-MM-DD format." };
  }
  if (!findAirport(origin)) {
    return { ok: false, error: `Unknown origin airport: '${origin}'.` };
  }
  if (!findAirport(destination)) {
    return { ok: false, error: `Unknown destination airport: '${destination}'.` };
  }
  if (origin === destination) {
    return { ok: false, error: "Origin and destination cannot be the same airport." };
  }
  return { ok: true, value: { origin, destination, date } };
}

/** GET /api/flights/search?origin=MTY&destination=TIJ&date=2026-10-01&... */
flightsRouter.get("/search", async (req, res) => {
  const validation = validateSearchParams(req.query as Record<string, unknown>);
  if (!validation.ok) {
    res.status(400).json({ error: validation.error });
    return;
  }

  const optionsResult = parseSearchOptions(req.query as Record<string, unknown>, validation.value.date);
  if (!optionsResult.ok) {
    res.status(400).json({ error: optionsResult.error });
    return;
  }

  try {
    const { origin, destination, date } = validation.value;
    const result = await searchFlights(origin, destination, date, optionsResult.value);
    res.json(result);
  } catch (error) {
    console.error("[flightsRouter] unexpected error in /search", error);
    res.status(500).json({ error: "Internal error while searching for flights." });
  }
});

/** GET /api/flights/price-insights?origin=MTY&destination=TIJ&date=2026-10-01 */
flightsRouter.get("/price-insights", async (req, res) => {
  const validation = validateSearchParams(req.query as Record<string, unknown>);
  if (!validation.ok) {
    res.status(400).json({ error: validation.error });
    return;
  }
  try {
    const { origin, destination, date } = validation.value;
    const result = await getPriceInsights(origin, destination, date);
    res.json(result);
  } catch (error) {
    console.error("[flightsRouter] unexpected error in /price-insights", error);
    res.status(500).json({ error: "Internal error while fetching the price trend." });
  }
});

/** GET /api/flights/nearby-prices?origin=MTY&destination=TIJ&date=2026-10-01&window=3 */
flightsRouter.get("/nearby-prices", async (req, res) => {
  const validation = validateSearchParams(req.query as Record<string, unknown>);
  if (!validation.ok) {
    res.status(400).json({ error: validation.error });
    return;
  }

  const rawWindow = typeof req.query.window === "string" ? Number.parseInt(req.query.window, 10) : 3;
  const windowDays = Number.isFinite(rawWindow) ? rawWindow : 3;

  try {
    const { origin, destination, date } = validation.value;
    const result = await getNearbyPrices(origin, destination, date, windowDays);
    res.json(result);
  } catch (error) {
    console.error("[flightsRouter] unexpected error in /nearby-prices", error);
    res.status(500).json({ error: "Internal error while fetching nearby prices." });
  }
});
