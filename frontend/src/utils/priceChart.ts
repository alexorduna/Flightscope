export interface ChartBounds {
  min: number;
  max: number;
}

export function computeChartBounds(prices: number[], typicalLow: number, typicalHigh: number): ChartBounds {
  const dataMin = Math.min(...prices);
  const dataMax = Math.max(...prices);
  const dataSpread = Math.max(dataMax - dataMin, dataMax * 0.08, 1);

  const typicalSpread = typicalHigh - typicalLow;
  const typicalOverlapsData = typicalLow <= dataMax + dataSpread && typicalHigh >= dataMin - dataSpread;

  if (!typicalOverlapsData || typicalSpread > dataSpread * 4) {
    const padding = dataSpread * 0.2;
    return { min: dataMin - padding, max: dataMax + padding };
  }

  const min = Math.min(dataMin, typicalLow);
  const max = Math.max(dataMax, typicalHigh);
  const padding = Math.max((max - min) * 0.1, 1);
  return { min: min - padding, max: max + padding };
}

export function buildYTicks(min: number, max: number, count = 4): number[] {
  if (max <= min) return [min];
  const step = (max - min) / (count - 1);
  return Array.from({ length: count }, (_, index) => min + step * index);
}

export function formatAxisPrice(value: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
    notation: value >= 10000 ? "compact" : "standard",
  }).format(value);
}

export function formatAxisDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
}

export function buildSmoothPath(points: Array<{ x: number; y: number }>): string {
  if (points.length === 0) return "";
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  let path = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  for (let index = 1; index < points.length; index += 1) {
    const previous = points[index - 1];
    const current = points[index];
    const midX = (previous.x + current.x) / 2;
    path += ` C ${midX.toFixed(1)} ${previous.y.toFixed(1)}, ${midX.toFixed(1)} ${current.y.toFixed(1)}, ${current.x.toFixed(1)} ${current.y.toFixed(1)}`;
  }
  return path;
}

export function buildAreaPath(linePath: string, baselineY: number, lastX: number, firstX: number): string {
  return `${linePath} L ${lastX.toFixed(1)} ${baselineY.toFixed(1)} L ${firstX.toFixed(1)} ${baselineY.toFixed(1)} Z`;
}
