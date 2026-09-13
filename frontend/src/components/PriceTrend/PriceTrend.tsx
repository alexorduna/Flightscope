import type { DataSource, PricePoint } from "../../types/api";
import { formatCurrency } from "../../utils/formatters";
import {
  buildAreaPath,
  buildSmoothPath,
  buildYTicks,
  computeChartBounds,
  formatAxisDate,
  formatAxisPrice,
} from "../../utils/priceChart";
import "./PriceTrend.css";

interface PriceTrendProps {
  history: PricePoint[];
  typicalPriceRange: { low: number; high: number };
  currency: string;
  source: DataSource;
  warning?: string;
}

const WIDTH = 640;
const HEIGHT = 200;
const PAD = { top: 20, right: 20, bottom: 36, left: 64 };

export function PriceTrend({ history, typicalPriceRange, currency, source, warning }: PriceTrendProps) {
  if (history.length < 2) return null;

  const prices = history.map((point) => point.price);
  const bounds = computeChartBounds(prices, typicalPriceRange.low, typicalPriceRange.high);
  const range = bounds.max - bounds.min || 1;

  const plotWidth = WIDTH - PAD.left - PAD.right;
  const plotHeight = HEIGHT - PAD.top - PAD.bottom;
  const baselineY = PAD.top + plotHeight;

  const xAt = (index: number) => PAD.left + (index / (history.length - 1)) * plotWidth;
  const yAt = (price: number) => PAD.top + plotHeight - ((price - bounds.min) / range) * plotHeight;

  const points = history.map((point, index) => ({ x: xAt(index), y: yAt(point.price) }));
  const linePath = buildSmoothPath(points);
  const areaPath = buildAreaPath(linePath, baselineY, points[points.length - 1].x, points[0].x);

  const yTicks = buildYTicks(bounds.min, bounds.max, 4);
  const bandTop = yAt(Math.min(typicalPriceRange.high, bounds.max));
  const bandBottom = yAt(Math.max(typicalPriceRange.low, bounds.min));
  const showBand = typicalPriceRange.high >= bounds.min && typicalPriceRange.low <= bounds.max;

  const cheapest = history.reduce((lowest, point) => (point.price < lowest.price ? point : lowest), history[0]);
  const priciest = history.reduce((highest, point) => (point.price > highest.price ? point : highest), history[0]);
  const latest = history[history.length - 1];

  const summary = `Price trend over the last ${history.length} days: lowest ${formatCurrency(
    cheapest.price,
    currency
  )} on ${cheapest.date}, highest ${formatCurrency(priciest.price, currency)} on ${priciest.date}. Typical range between ${formatCurrency(
    typicalPriceRange.low,
    currency
  )} and ${formatCurrency(typicalPriceRange.high, currency)}. Latest price ${formatCurrency(latest.price, currency)}.`;

  return (
    <section className="price-trend" aria-label="Price trend">
      <header className="price-trend__header">
        <div>
          <h3 className="price-trend__title">Price trend</h3>
          <p className={`price-trend__source price-trend__source--${source}`}>
            {source === "live" ? "Live data (SerpApi)" : "Simulated trend (mock)"}
          </p>
        </div>
        <dl className="price-trend__stats">
          <div>
            <dt>Low</dt>
            <dd className="mono">{formatCurrency(cheapest.price, currency)}</dd>
          </div>
          <div>
            <dt>Typical</dt>
            <dd className="mono">
              {formatCurrency(typicalPriceRange.low, currency)} – {formatCurrency(typicalPriceRange.high, currency)}
            </dd>
          </div>
          <div>
            <dt>High</dt>
            <dd className="mono">{formatCurrency(priciest.price, currency)}</dd>
          </div>
        </dl>
      </header>

      {warning && (
        <p className="price-trend__warning" role="status">
          {warning}
        </p>
      )}

      <div className="price-trend__chart-wrap">
        <svg className="price-trend__chart" viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={summary} preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="price-trend-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent-link)" stopOpacity="0.18" />
              <stop offset="100%" stopColor="var(--accent-link)" stopOpacity="0" />
            </linearGradient>
          </defs>

          {yTicks.map((tick) => {
            const y = yAt(tick);
            return (
              <g key={tick} className="price-trend__grid-row">
                <line x1={PAD.left} y1={y} x2={WIDTH - PAD.right} y2={y} className="price-trend__grid-line" />
                <text x={PAD.left - 10} y={y + 4} textAnchor="end" className="price-trend__axis-label mono">
                  {formatAxisPrice(tick, currency)}
                </text>
              </g>
            );
          })}

          {showBand && (
            <rect
              x={PAD.left}
              y={Math.min(bandTop, bandBottom)}
              width={plotWidth}
              height={Math.max(Math.abs(bandBottom - bandTop), 1)}
              className="price-trend__band"
            />
          )}

          <path d={areaPath} className="price-trend__area" />
          <path d={linePath} className="price-trend__line" />

          {history.map((point, index) => (
            <circle
              key={point.date}
              cx={points[index].x}
              cy={points[index].y}
              r={index === history.length - 1 ? 4.5 : 2.5}
              className={index === history.length - 1 ? "price-trend__point price-trend__point--latest" : "price-trend__point"}
            />
          ))}

          <text x={PAD.left} y={HEIGHT - 10} className="price-trend__axis-label mono">
            {formatAxisDate(history[0].date)}
          </text>
          <text x={WIDTH - PAD.right} y={HEIGHT - 10} textAnchor="end" className="price-trend__axis-label mono">
            {formatAxisDate(history[history.length - 1].date)}
          </text>
        </svg>
      </div>

      <p className="visually-hidden">{summary}</p>
    </section>
  );
}
