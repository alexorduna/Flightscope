import type { DataSource, PricePoint } from "../../types/api";
import { formatCurrency } from "../../utils/formatters";
import "./PriceTrend.css";

interface PriceTrendProps {
  history: PricePoint[];
  typicalPriceRange: { low: number; high: number };
  currency: string;
  source: DataSource;
  warning?: string;
}

const WIDTH = 480;
const HEIGHT = 140;
const PADDING = 12;

export function PriceTrend({ history, typicalPriceRange, currency, source, warning }: PriceTrendProps) {
  if (history.length < 2) return null;

  const prices = history.map((p) => p.price);
  const min = Math.min(...prices, typicalPriceRange.low);
  const max = Math.max(...prices, typicalPriceRange.high);
  const range = max - min || 1;

  const x = (i: number) => PADDING + (i / (history.length - 1)) * (WIDTH - PADDING * 2);
  const y = (price: number) => HEIGHT - PADDING - ((price - min) / range) * (HEIGHT - PADDING * 2);

  const linePath = history.map((p, i) => `${i === 0 ? "M" : "L"} ${x(i).toFixed(1)} ${y(p.price).toFixed(1)}`).join(" ");
  const bandTop = y(typicalPriceRange.high);
  const bandBottom = y(typicalPriceRange.low);

  const cheapest = history.reduce((min, p) => (p.price < min.price ? p : min), history[0]);
  const priciest = history.reduce((max, p) => (p.price > max.price ? p : max), history[0]);

  const summary = `Price trend over the last ${history.length} days: lowest ${formatCurrency(
    cheapest.price,
    currency
  )} on ${cheapest.date}, highest ${formatCurrency(priciest.price, currency)} on ${priciest.date}. Typical range between ${formatCurrency(
    typicalPriceRange.low,
    currency
  )} and ${formatCurrency(typicalPriceRange.high, currency)}.`;

  return (
    <div className="price-trend">
      <div className="price-trend__header">
        <h3 className="price-trend__title">Price trend</h3>
        <span className={`price-trend__source price-trend__source--${source}`}>
          {source === "live" ? "Live data (SerpApi)" : "Simulated trend (mock)"}
        </span>
      </div>
      {warning && (
        <p className="price-trend__warning" role="status">
          {warning}
        </p>
      )}
      <svg
        className="price-trend__chart"
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-label={summary}
        preserveAspectRatio="xMidYMid meet"
      >
        <rect x={PADDING} y={bandTop} width={WIDTH - PADDING * 2} height={Math.max(bandBottom - bandTop, 1)} className="price-trend__band" />
        <path d={linePath} className="price-trend__line" fill="none" />
        {history.map((p, i) => (
          <circle key={p.date} cx={x(i)} cy={y(p.price)} r={i === history.length - 1 ? 4 : 2.5} className="price-trend__point" />
        ))}
      </svg>
      <dl className="price-trend__legend">
        <div>
          <dt>Recent low</dt>
          <dd className="mono">{formatCurrency(cheapest.price, currency)}</dd>
        </div>
        <div>
          <dt>Typical range</dt>
          <dd className="mono">
            {formatCurrency(typicalPriceRange.low, currency)} – {formatCurrency(typicalPriceRange.high, currency)}
          </dd>
        </div>
        <div>
          <dt>Recent high</dt>
          <dd className="mono">{formatCurrency(priciest.price, currency)}</dd>
        </div>
      </dl>
      <p className="visually-hidden">{summary}</p>
    </div>
  );
}
