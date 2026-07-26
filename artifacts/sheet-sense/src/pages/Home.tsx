import { useState, useCallback } from "react";
import * as xlsx from "xlsx";
import { DropZone } from "@/components/DropZone";
import { FileStats } from "@/components/FileStats";
import { DataQuality } from "@/components/DataQuality";
import { Insights } from "@/components/Insights";
import { PreviewTable } from "@/components/PreviewTable";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useLocale } from "@/i18n/context";
import type { ParsedFile, DataQuality as DataQualityType } from "@/types";
import { RefreshCw, BarChart2 } from "lucide-react";

export default function Home() {
  const { t, dir } = useLocale();
  const [parsedFile, setParsedFile] = useState<ParsedFile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processFile = useCallback(
    (file: File) => {
      const isCsv = file.name.match(/\.csv$/i);
      const isExcel = file.name.match(/\.(xlsx|xls)$/i);
      if (!isCsv && !isExcel) {
        setError(t.errors.invalidFile);
        return;
      }

      setIsLoading(true);
      setError(null);

      // Give UI time to show loading state before blocking main thread with parsing
      setTimeout(() => {
        const reader = new FileReader();

        const parseWorkbook = (workbook: xlsx.WorkBook) => {
          if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
            throw new Error("No sheets found in the file.");
          }

          // For CSV, replace the generic "Sheet1" name with the filename (minus extension)
          let sheetNames = workbook.SheetNames;
          if (isCsv && sheetNames.length === 1 && sheetNames[0] === "Sheet1") {
            const baseName = file.name.replace(/\.csv$/i, "");
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

          if (jsonData && jsonData.length > 0) {
            rowCount = jsonData.length;
            colCount = jsonData.reduce(
              (max, row) => Math.max(max, row.length),
              0,
            );

            const firstRow = jsonData[0] || [];
            headers = Array.from({ length: colCount }).map((_, i) => {
              const val = firstRow[i];
              return val !== undefined && val !== null && val !== ""
                ? String(val)
                : `Column ${i + 1}`;
            });

            const dataRows = jsonData.slice(1);
            previewRows = dataRows.slice(0, 10).map((row) => {
              const paddedRow = [...row];
              while (paddedRow.length < colCount) paddedRow.push(null);
              return paddedRow;
            });
          }

          // ── Data quality metrics ──────────────────────────────────────────
          const allDataRows = jsonData.slice(1);
          const totalCells = allDataRows.length * colCount;

          let missingValues = 0;
          for (const row of allDataRows) {
            for (let c = 0; c < colCount; c++) {
              const v = row[c];
              if (v === null || v === undefined || v === "") missingValues++;
            }
          }

          const missingPercent =
            totalCells > 0 ? (missingValues / totalCells) * 100 : 0;

          // Duplicate rows: stringify each padded row and count repeats
          const seen = new Set<string>();
          let duplicateRows = 0;
          for (const row of allDataRows) {
            const key = JSON.stringify(
              Array.from({ length: colCount }, (_, i) => row[i] ?? null),
            );
            if (seen.has(key)) duplicateRows++;
            else seen.add(key);
          }

          // Empty columns: all data values in that column are null/undefined/""
          let emptyColumns = 0;
          for (let c = 0; c < colCount; c++) {
            if (
              allDataRows.every(
                (row) =>
                  row[c] === null || row[c] === undefined || row[c] === "",
              )
            ) {
              emptyColumns++;
            }
          }

          // Column type detection: numeric if ≥60% of non-empty values are numbers
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

          // Quality score (0–100)
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

          const dataQuality: DataQualityType = {
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

          setParsedFile({
            fileName: file.name,
            sheetNames,
            firstSheetName,
            rowCount,
            colCount,
            previewRows,
            headers,
            dataQuality,
          });
        };

        reader.onload = (e) => {
          try {
            if (!e.target?.result) throw new Error("Empty file content");
            if (isCsv) {
              const text = e.target.result as string;
              const workbook = xlsx.read(text, { type: "string" });
              parseWorkbook(workbook);
            } else {
              const data = new Uint8Array(e.target.result as ArrayBuffer);
              const workbook = xlsx.read(data, { type: "array" });
              parseWorkbook(workbook);
            }
          } catch (err) {
            console.error(err);
            setError(t.errors.parseError);
          } finally {
            setIsLoading(false);
          }
        };

        reader.onerror = () => {
          setError(t.errors.readError);
          setIsLoading(false);
        };

        if (isCsv) {
          reader.readAsText(file);
        } else {
          reader.readAsArrayBuffer(file);
        }
      }, 50);
    },
    [t],
  );

  const resetState = useCallback(() => {
    setParsedFile(null);
    setError(null);
  }, []);

  return (
    <div
      dir={dir}
      className="min-h-[100dvh] w-full bg-background text-foreground flex flex-col selection:bg-primary/20 selection:text-primary"
    >
      {/* Header */}
      <header className="w-full border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="bg-primary p-2 rounded-lg text-primary-foreground shadow-sm">
              <BarChart2 className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              {t.nav.appName}
            </h1>
          </div>
          <LanguageSwitcher />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-12 flex flex-col">
        {!parsedFile ? (
          <div className="flex-1 flex flex-col items-center justify-center animate-in fade-in duration-500 pb-12">
            <div className="max-w-2xl text-center mb-10 space-y-4">
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
                {t.hero.heading}
              </h2>
              <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                {t.hero.subheading}
              </p>
            </div>

            <DropZone
              onFileAccepted={processFile}
              isLoading={isLoading}
              error={error}
            />
          </div>
        ) : (
          <div className="w-full flex flex-col space-y-8 animate-in slide-in-from-bottom-4 fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold tracking-tight">
                  {t.analysis.complete}
                </h2>
                <p className="text-muted-foreground text-sm">
                  {t.analysis.subtitle}
                </p>
              </div>

              <button
                onClick={resetState}
                className="inline-flex items-center justify-center gap-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground px-4 py-2.5 rounded-lg font-medium transition-colors text-sm shadow-sm active:scale-[0.98]"
                data-testid="button-upload-another"
              >
                <RefreshCw className="w-4 h-4" />
                {t.analysis.uploadAnother}
              </button>
            </div>

            <FileStats file={parsedFile} />
            <DataQuality quality={parsedFile.dataQuality} />
            {parsedFile.dataQuality && (
              <Insights
                quality={parsedFile.dataQuality}
                meta={{
                  fileName: parsedFile.fileName,
                  rowCount: parsedFile.rowCount,
                  colCount: parsedFile.colCount,
                }}
              />
            )}
            <PreviewTable file={parsedFile} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-border mt-auto">
        <div className="max-w-6xl mx-auto px-4 md:px-6 h-16 flex items-center justify-center text-sm text-muted-foreground">
          <p>{t.footer.text}</p>
        </div>
      </footer>
    </div>
  );
}
