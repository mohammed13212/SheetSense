/**
 * Pure compute module — no React, no Recharts.
 * Converts raw xlsx/csv row data into chart-ready series structures.
 */
import type {
  ChartData,
  CategoricalSeries,
  NumericSeries,
  HistogramBin,
} from "@/types";

const MAX_CATEGORICAL_VALUES = 15; // top-N bar/pie slices
const MAX_LINE_POINTS = 300;       // downsample line chart

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * @param jsonData  Full 2-D array from xlsx (row 0 = headers, rows 1+ = data).
 * @param colCount  Total column count (max row width).
 */
export function computeChartData(
  jsonData: any[][],
  colCount: number,
): ChartData {
  if (!jsonData || jsonData.length < 2) {
    return { categorical: [], numeric: [], totalRows: 0 };
  }

  const headerRow = jsonData[0] ?? [];
  const dataRows = jsonData.slice(1);
  const totalRows = dataRows.length;

  const categorical: CategoricalSeries[] = [];
  const numeric: NumericSeries[] = [];

  for (let c = 0; c < colCount; c++) {
    const colName =
      headerRow[c] != null && String(headerRow[c]).trim() !== ""
        ? String(headerRow[c])
        : `Column ${c + 1}`;

    const nonEmpty = dataRows
      .map((row) => row[c])
      .filter((v) => v !== null && v !== undefined && v !== "");

    if (nonEmpty.length === 0) continue; // skip fully empty columns

    const numericCount = nonEmpty.filter(
      (v) =>
        typeof v === "number" ||
        (typeof v === "string" && v.trim() !== "" && !isNaN(Number(v))),
    ).length;

    if (numericCount / nonEmpty.length >= 0.6) {
      const series = buildNumericSeries(c, colName, nonEmpty);
      if (series) numeric.push(series);
    } else {
      categorical.push(buildCategoricalSeries(c, colName, nonEmpty));
    }
  }

  return { categorical, numeric, totalRows };
}

// ─── Builders ─────────────────────────────────────────────────────────────────

function buildCategoricalSeries(
  colIndex: number,
  colName: string,
  nonEmpty: any[],
): CategoricalSeries {
  const freq = new Map<string, number>();
  for (const v of nonEmpty) {
    const key = String(v);
    freq.set(key, (freq.get(key) ?? 0) + 1);
  }
  const sorted = Array.from(freq.entries()).sort((a, b) => b[1] - a[1]);
  return {
    colIndex,
    colName,
    topValues: sorted
      .slice(0, MAX_CATEGORICAL_VALUES)
      .map(([name, count]) => ({ name, count })),
    totalUnique: sorted.length,
  };
}

function buildNumericSeries(
  colIndex: number,
  colName: string,
  nonEmpty: any[],
): NumericSeries | null {
  const values = nonEmpty
    .map((v) => (typeof v === "number" ? v : parseFloat(String(v))))
    .filter((v) => isFinite(v));

  if (values.length === 0) return null;

  const min = Math.min(...values);
  const max = Math.max(...values);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;

  const bins = buildHistogramBins(values, min, max);

  // Downsample for line chart
  const step =
    values.length > MAX_LINE_POINTS
      ? Math.ceil(values.length / MAX_LINE_POINTS)
      : 1;
  const linePoints = values
    .filter((_, i) => i % step === 0)
    .map((v, i) => ({ i: i * step + 1, v }));

  return { colIndex, colName, linePoints, min, max, mean, bins };
}

function buildHistogramBins(
  values: number[],
  min: number,
  max: number,
): HistogramBin[] {
  // Sturges' rule: k = ceil(log2(n) + 1), clamped [5, 20]
  const k = Math.max(5, Math.min(20, Math.ceil(Math.log2(values.length) + 1)));
  const range = max - min;
  const binWidth = range === 0 ? 1 : range / k;

  const bins: HistogramBin[] = Array.from({ length: k }, (_, i) => ({
    x0: min + i * binWidth,
    x1: min + (i + 1) * binWidth,
    range: "",
    count: 0,
  }));

  for (const v of values) {
    const idx = Math.min(Math.floor((v - min) / binWidth), k - 1);
    bins[idx].count++;
  }

  for (const bin of bins) {
    bin.range = `${fmt(bin.x0)}–${fmt(bin.x1)}`;
  }

  return bins;
}

function fmt(n: number): string {
  if (!isFinite(n)) return "?";
  if (Math.abs(n) >= 10_000) return n.toFixed(0);
  if (Number.isInteger(n)) return String(n);
  return n.toFixed(2);
}
