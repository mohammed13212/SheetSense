export type ParsedFile = {
  fileName: string;
  sheetNames: string[];
  firstSheetName: string;
  rowCount: number;
  colCount: number;
  previewRows: (string | number | boolean | null)[][];
  headers: string[];
};
