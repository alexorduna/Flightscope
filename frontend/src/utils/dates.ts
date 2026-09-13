const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] as const;

export function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function addDaysIso(date: string, days: number): string {
  const base = new Date(`${date}T00:00:00.000Z`);
  base.setUTCDate(base.getUTCDate() + days);
  return base.toISOString().slice(0, 10);
}

export function daysBetweenIso(from: string, to: string): number {
  const start = new Date(`${from}T00:00:00.000Z`).getTime();
  const end = new Date(`${to}T00:00:00.000Z`).getTime();
  return Math.round((end - start) / 86_400_000);
}

/** True when `date` falls inside a +/- windowDays range around `centerDate`. */
export function isDateInWindow(date: string, centerDate: string, windowDays: number): boolean {
  return Math.abs(daysBetweenIso(centerDate, date)) <= windowDays;
}

export function formatShortWeekday(date: string): string {
  const value = new Date(`${date}T00:00:00.000Z`);
  return DAY_NAMES[value.getUTCDay()];
}

export function formatShortDate(date: string): string {
  const value = new Date(`${date}T00:00:00.000Z`);
  return `${MONTH_NAMES[value.getUTCMonth()]} ${value.getUTCDate()}`;
}

export function formatPrice(amount: number, currency: string): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}
