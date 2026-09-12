/**
 * Price alert: only exists in client-side memory (React state). It's a UI
 * simulation for the course report - it isn't persisted anywhere and doesn't
 * trigger real notifications.
 */
export interface PriceAlert {
  id: string;
  origin: string;
  destination: string;
  date: string;
  targetPrice: number;
  currency: string;
  active: boolean;
  createdAt: string;
}
