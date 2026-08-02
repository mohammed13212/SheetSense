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

// ─── Dataset ──────────────────────────────────────────────────────────────────

export type Dataset = {
  /** Stable unique identifier generated at upload time (local, session-scoped). */
  id: string;
  /** Unix ms timestamp of when the file was uploaded in this session. */
  uploadedAt: number;
  /** All parsed data, quality metrics, and chart series for this file. */
  file: ParsedFile;
  /**
   * User-assigned display name. Falls back to `file.fileName` when absent.
   * The original file metadata is always preserved.
   */
  displayName?: string;
  /**
   * The UUID of the corresponding `uploaded_files` record in the database.
   * Set when a file is persisted (authenticated upload or project re-open).
   * Used to map in-memory datasets back to server-side file records for
   * relationship persistence and storage operations.
   */
  serverFileId?: string;
};
