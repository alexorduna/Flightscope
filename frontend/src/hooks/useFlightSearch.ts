import { useCallback, useRef, useState } from "react";
import { fetchPriceInsights, searchFlights, ApiError } from "../api/client";
import type { FlightSearchResponse, PriceInsightsResponse } from "../types/api";
import type { TravelPreferences } from "../types/travelPreferences";

export type SearchStatus = "idle" | "loading" | "success" | "error";

interface SearchQuery {
  origin: string;
  destination: string;
  date: string;
  preferences: TravelPreferences;
}

interface UseFlightSearchResult {
  status: SearchStatus;
  result: FlightSearchResponse | null;
  insights: PriceInsightsResponse | null;
  errorMessage: string | null;
  search: (query: SearchQuery) => void;
  retry: () => void;
}

/**
 * Wraps flight search + price trend fetching. A request counter prevents a
 * late response from an older search from overwriting the result of a more
 * recent one.
 */
export function useFlightSearch(): UseFlightSearchResult {
  const [status, setStatus] = useState<SearchStatus>("idle");
  const [result, setResult] = useState<FlightSearchResponse | null>(null);
  const [insights, setInsights] = useState<PriceInsightsResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const lastQuery = useRef<SearchQuery | null>(null);
  const requestId = useRef(0);

  const search = useCallback((query: SearchQuery) => {
    lastQuery.current = query;
    const currentRequestId = ++requestId.current;

    setStatus("loading");
    setErrorMessage(null);
    setInsights(null);

    searchFlights(query.origin, query.destination, query.date, query.preferences)
      .then((response) => {
        if (requestId.current !== currentRequestId) return;
        setResult(response);
        setStatus("success");
      })
      .catch((error: unknown) => {
        if (requestId.current !== currentRequestId) return;
        setResult(null);
        setStatus("error");
        setErrorMessage(error instanceof ApiError ? error.message : "Couldn't complete the search. Please try again.");
      });

    fetchPriceInsights(query.origin, query.destination, query.date)
      .then((response) => {
        if (requestId.current !== currentRequestId) return;
        setInsights(response);
      })
      .catch(() => {
        if (requestId.current !== currentRequestId) return;
        setInsights(null);
      });
  }, []);

  const retry = useCallback(() => {
    if (lastQuery.current) search(lastQuery.current);
  }, [search]);

  return { status, result, insights, errorMessage, search, retry };
}
