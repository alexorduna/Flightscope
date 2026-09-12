import { useCallback, useState } from "react";
import type { PriceAlert } from "../types/priceAlert";

function alertKey(origin: string, destination: string, date: string): string {
  return `${origin}|${destination}|${date}`;
}

/**
 * In-memory price alerts (one per origin/destination/date combination).
 * They're lost on page refresh - this is a UI simulation, there's no backend
 * or real notifications behind it.
 */
export function usePriceAlerts() {
  const [alerts, setAlerts] = useState<Record<string, PriceAlert>>({});

  const getAlertFor = useCallback((origin: string, destination: string, date: string) => alerts[alertKey(origin, destination, date)] ?? null, [alerts]);

  const createAlert = useCallback((origin: string, destination: string, date: string, targetPrice: number, currency: string) => {
    const key = alertKey(origin, destination, date);
    setAlerts((prev) => ({
      ...prev,
      [key]: {
        id: key,
        origin,
        destination,
        date,
        targetPrice,
        currency,
        active: true,
        createdAt: new Date().toISOString(),
      },
    }));
  }, []);

  const toggleActive = useCallback((origin: string, destination: string, date: string) => {
    const key = alertKey(origin, destination, date);
    setAlerts((prev) => (prev[key] ? { ...prev, [key]: { ...prev[key], active: !prev[key].active } } : prev));
  }, []);

  const removeAlert = useCallback((origin: string, destination: string, date: string) => {
    const key = alertKey(origin, destination, date);
    setAlerts((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  return { getAlertFor, createAlert, toggleActive, removeAlert };
}
