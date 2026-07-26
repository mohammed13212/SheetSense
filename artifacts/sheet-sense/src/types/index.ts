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

export type ParsedFile = {
  fileName: string;
  sheetNames: string[];
  firstSheetName: string;
  rowCount: number;
  colCount: number;
  previewRows: (string | number | boolean | null)[][];
  headers: string[];
  dataQuality?: DataQuality;
};
