/**
 * Parses an Excel (.xlsx, .xls) or CSV file into a ParsedFile.
 * Pure async function — no React, no side-effects.
 *
 * Error codes:
 *   "INVALID_FILE"  — unsupported extension
 *   "EMPTY_FILE"    — FileReader returned nothing
 *   "PARSE_ERROR"   — xlsx parsing or metric computation failed
 *   "READ_ERROR"    — FileReader.onerror fired
 */
import * as xlsx from "xlsx";
import { computeChartData } from "@/lib/chartData";
import type { ParsedFile, DataQuality } from "@/types";

export type ParseErrorCode =
  | "INVALID_FILE"
  | "EMPTY_FILE"
  | "PARSE_ERROR"
  | "READ_ERROR";

export class FileParseError extends Error {
  constructor(public readonly code: ParseErrorCode) {
    super(code);
    this.name = "FileParseError";
  }
}

export async function parseFile(file: File): Promise<ParsedFile> {
  const isCsv = /\.csv$/i.test(file.name);
  const isExcel = /\.(xlsx|xls)$/i.test(file.name);

  if (!isCsv && !isExcel) {
    throw new FileParseError("INVALID_FILE");
  }

  return new Promise<ParsedFile>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        if (!e.target?.result) throw new FileParseError("EMPTY_FILE");

        let workbook: xlsx.WorkBook;
        if (isCsv) {
          workbook = xlsx.read(e.target.result as string, { type: "string" });
        } else {
          workbook = xlsx.read(new Uint8Array(e.target.result as ArrayBuffer), {
            type: "array",
          });
        }

        resolve(processWorkbook(workbook, file.name, isCsv));
      } catch (err) {
        if (err instanceof FileParseError) reject(err);
        else reject(new FileParseError("PARSE_ERROR"));
      }
    };

    reader.onerror = () => reject(new FileParseError("READ_ERROR"));

    if (isCsv) reader.readAsText(file);
    else reader.readAsArrayBuffer(file);
  });
}

// ─── Internal ─────────────────────────────────────────────────────────────────

function processWorkbook(
  workbook: xlsx.WorkBook,
  fileName: string,
  isCsv: boolean,
): ParsedFile {
  if (!workbook.SheetNames?.length) {
    throw new FileParseError("PARSE_ERROR");
  }

  // Rename CSV's generic "Sheet1" to the file base name
  let sheetNames = workbook.SheetNames;
  if (isCsv && sheetNames.length === 1 && sheetNames[0] === "Sheet1") {
    const baseName = fileName.replace(/\.csv$/i, "");
    workbook.SheetNames[0] = baseName;
    workbook.Sheets[baseName] = workbook.Sheets["Sheet1"];
    delete workbook.Sheets["Sheet1"];
    sheetNames = [baseName];
  }

  const firstSheetName = sheetNames[0];
  const firstSheet = workbook.Sheets[firstSheetName];

  const jsonData = xlsx.utils.sheet_to_json(firstSheet, {
    header: 1,
    defval: null,
  }) as any[][];

  let headers: string[] = [];
  let previewRows: any[][] = [];
  let rowCount = 0;
  let colCount = 0;

  if (jsonData.length > 0) {
    rowCount = jsonData.length;
    colCount = jsonData.reduce((max, row) => Math.max(max, row.length), 0);

    const firstRow = jsonData[0] ?? [];
    headers = Array.from({ length: colCount }, (_, i) => {
      const val = firstRow[i];
      return val !== undefined && val !== null && val !== ""
        ? String(val)
        : `Column ${i + 1}`;
    });

    const dataRows = jsonData.slice(1);
    previewRows = dataRows.slice(0, 10).map((row) => {
      const padded = [...row];
      while (padded.length < colCount) padded.push(null);
      return padded;
    });
  }

  // ── Quality metrics ────────────────────────────────────────────────────────
  const allDataRows = jsonData.slice(1);
  const totalCells = allDataRows.length * colCount;

  let missingValues = 0;
  for (const row of allDataRows) {
    for (let c = 0; c < colCount; c++) {
      const v = row[c];
      if (v === null || v === undefined || v === "") missingValues++;
    }
  }

  const missingPercent = totalCells > 0 ? (missingValues / totalCells) * 100 : 0;

  const seen = new Set<string>();
  let duplicateRows = 0;
  for (const row of allDataRows) {
    const key = JSON.stringify(
      Array.from({ length: colCount }, (_, i) => row[i] ?? null),
    );
    if (seen.has(key)) duplicateRows++;
    else seen.add(key);
  }

  let emptyColumns = 0;
  for (let c = 0; c < colCount; c++) {
    if (
      allDataRows.every(
        (row) => row[c] === null || row[c] === undefined || row[c] === "",
      )
    ) {
      emptyColumns++;
    }
  }

  let numericColumns = 0;
  let textColumns = 0;
  for (let c = 0; c < colCount; c++) {
    const nonEmpty = allDataRows
      .map((row) => row[c])
      .filter((v) => v !== null && v !== undefined && v !== "");
    if (nonEmpty.length === 0) continue;
    const numericCount = nonEmpty.filter(
      (v) =>
        typeof v === "number" ||
        (typeof v === "string" && !isNaN(Number(v)) && v.trim() !== ""),
    ).length;
    if (numericCount / nonEmpty.length >= 0.6) numericColumns++;
    else textColumns++;
  }

  const missingPenalty = Math.min(missingPercent * 2.5, 50);
  const totalDataRows = allDataRows.length;
  const dupPenalty = Math.min(
    (duplicateRows / Math.max(totalDataRows, 1)) * 100,
    25,
  );
  const emptyColPenalty = Math.min(
    (emptyColumns / Math.max(colCount, 1)) * 100,
    25,
  );
  const qualityScore = Math.round(
    Math.max(0, 100 - missingPenalty - dupPenalty - emptyColPenalty),
  );

  const dataQuality: DataQuality = {
    totalCells,
    missingValues,
    missingPercent,
    duplicateRows,
    emptyColumns,
    numericColumns,
    textColumns,
    qualityScore,
    totalDataRows,
  };

  const chartData = computeChartData(jsonData, colCount);

  return {
    fileName,
    sheetNames,
    firstSheetName,
    rowCount,
    colCount,
    previewRows,
    headers,
    dataQuality,
    chartData,
  };
}
