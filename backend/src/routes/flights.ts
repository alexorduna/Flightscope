import { Router } from "express";
import { findAirport } from "../data/airports";
import { searchFlights } from "../services/flightService";
import { getPriceInsights } from "../services/priceInsightsService";

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

/** GET /api/flights/search?origin=MTY&destination=TIJ&date=2026-10-01 */
flightsRouter.get("/search", async (req, res) => {
  const validation = validateSearchParams(req.query as Record<string, unknown>);
  if (!validation.ok) {
    res.status(400).json({ error: validation.error });
    return;
  }
  try {
    const { origin, destination, date } = validation.value;
    const result = await searchFlights(origin, destination, date);
    res.json(result);
  } catch (error) {
    // Shouldn't happen (searchFlights already catches SerpApi failures and
    // falls back to mock), but a defensive handler is left so the app never
    // crashes on the unexpected.
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
