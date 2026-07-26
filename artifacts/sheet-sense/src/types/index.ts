export type DataQuality = {
  totalCells: number;
  missingValues: number;
  missingPercent: number;
  duplicateRows: number;
  emptyColumns: number;
  numericColumns: number;
  textColumns: number;
  qualityScore: number;
  totalDataRows: number;
};

// ─── Chart data types ─────────────────────────────────────────────────────────

export type HistogramBin = {
  range: string;
  count: number;
  x0: number;
  x1: number;
};

export type LinePoint = {
  i: number; // row index
  v: number; // value
};

export type CategoricalSeries = {
  colIndex: number;
  colName: string;
  topValues: { name: string; count: number }[];
  totalUnique: number;
};

export type NumericSeries = {
  colIndex: number;
  colName: string;
  linePoints: LinePoint[];
  min: number;
  max: number;
  mean: number;
  bins: HistogramBin[];
};

export type ChartData = {
  categorical: CategoricalSeries[];
  numeric: NumericSeries[];
  totalRows: number;
};

// ─── Parsed file ──────────────────────────────────────────────────────────────

export type ParsedFile = {
  fileName: string;
  sheetNames: string[];
  firstSheetName: string;
  rowCount: number;
  colCount: number;
  previewRows: (string | number | boolean | null)[][];
  headers: string[];
  dataQuality?: DataQuality;
  chartData?: ChartData;
};
