import { useEffect, useRef, useState } from "react";
import { fetchNearbyPrices } from "../api/client";
import type { NearbyPricesResponse } from "../types/api";
import { isDateInWindow } from "../utils/dates";

interface LoadedWindow {
  origin: string;
  destination: string;
  centerDate: string;
  windowDays: number;
}

interface UseNearbyPricesResult {
  data: NearbyPricesResponse | null;
  isLoading: boolean;
}

const DEFAULT_WINDOW_DAYS = 3;

/**
 * Loads a +/- window of lowest fares. Reuses the current response when the user
 * picks another day that is already inside the loaded window — no extra API call.
 */
export function useNearbyPrices(
  origin: string | null,
  destination: string | null,
  selectedDate: string,
  enabled: boolean,
  windowDays = DEFAULT_WINDOW_DAYS
): UseNearbyPricesResult {
  const [data, setData] = useState<NearbyPricesResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const requestId = useRef(0);
  const loadedWindow = useRef<LoadedWindow | null>(null);

  useEffect(() => {
    if (!enabled || !origin || !destination || !selectedDate) {
      setData(null);
      setIsLoading(false);
      loadedWindow.current = null;
      return;
    }

    const loaded = loadedWindow.current;
    const routeMatches = loaded?.origin === origin && loaded?.destination === destination;
    const dateAlreadyCovered =
      routeMatches &&
      loaded != null &&
      isDateInWindow(selectedDate, loaded.centerDate, loaded.windowDays);

    if (dateAlreadyCovered) {
      return;
    }

    const currentRequestId = ++requestId.current;
    setIsLoading(true);

    fetchNearbyPrices(origin, destination, selectedDate, windowDays)
      .then((response) => {
        if (requestId.current !== currentRequestId) return;
        setData(response);
        loadedWindow.current = {
          origin,
          destination,
          centerDate: response.centerDate,
          windowDays: response.windowDays,
        };
      })
      .catch(() => {
        if (requestId.current !== currentRequestId) return;
        if (!loadedWindow.current) setData(null);
      })
      .finally(() => {
        if (requestId.current !== currentRequestId) return;
        setIsLoading(false);
      });
  }, [origin, destination, selectedDate, enabled, windowDays]);

  return { data, isLoading };
}
