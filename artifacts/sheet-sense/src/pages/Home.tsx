import { useState, useCallback } from "react";
import * as xlsx from "xlsx";
import { DropZone } from "@/components/DropZone";
import { FileStats } from "@/components/FileStats";
import { PreviewTable } from "@/components/PreviewTable";
import type { ParsedFile } from "@/types";
import { FileSpreadsheet, RefreshCw, BarChart2 } from "lucide-react";

export default function Home() {
  const [parsedFile, setParsedFile] = useState<ParsedFile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processFile = useCallback((file: File) => {
    const isCsv = file.name.match(/\.csv$/i);
    const isExcel = file.name.match(/\.(xlsx|xls)$/i);
    if (!isCsv && !isExcel) {
      setError("Please upload a valid .xlsx, .xls, or .csv file.");
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
        if (isCsv && sheetNames.length === 1 && sheetNames[0] === 'Sheet1') {
          const baseName = file.name.replace(/\.csv$/i, '');
          workbook.SheetNames[0] = baseName;
          workbook.Sheets[baseName] = workbook.Sheets['Sheet1'];
          delete workbook.Sheets['Sheet1'];
          sheetNames = [baseName];
        }

        const firstSheetName = sheetNames[0];
        const firstSheet = workbook.Sheets[firstSheetName];

        const jsonData = xlsx.utils.sheet_to_json(firstSheet, { header: 1, defval: null }) as any[][];

        let headers: string[] = [];
        let previewRows: any[][] = [];
        let rowCount = 0;
        let colCount = 0;

        if (jsonData && jsonData.length > 0) {
          rowCount = jsonData.length;
          colCount = jsonData.reduce((max, row) => Math.max(max, row.length), 0);

          const firstRow = jsonData[0] || [];
          headers = Array.from({ length: colCount }).map((_, i) => {
            const val = firstRow[i];
            return val !== undefined && val !== null && val !== ""
              ? String(val)
              : `Column ${i + 1}`;
          });

          const dataRows = jsonData.slice(1);
          previewRows = dataRows.slice(0, 10).map(row => {
            const paddedRow = [...row];
            while (paddedRow.length < colCount) paddedRow.push(null);
            return paddedRow;
          });
        }

        setParsedFile({ fileName: file.name, sheetNames, firstSheetName, rowCount, colCount, previewRows, headers });
      };

      reader.onload = (e) => {
        try {
          if (!e.target?.result) throw new Error("Empty file content");
          if (isCsv) {
            const text = e.target.result as string;
            const workbook = xlsx.read(text, { type: 'string' });
            parseWorkbook(workbook);
          } else {
            const data = new Uint8Array(e.target.result as ArrayBuffer);
            const workbook = xlsx.read(data, { type: 'array' });
            parseWorkbook(workbook);
          }
        } catch (err) {
          console.error(err);
          setError("Failed to parse the file. It might be corrupted or an unsupported format.");
        } finally {
          setIsLoading(false);
        }
      };

      reader.onerror = () => {
        setError("Failed to read the file from disk.");
        setIsLoading(false);
      };

      if (isCsv) {
        reader.readAsText(file);
      } else {
        reader.readAsArrayBuffer(file);
      }
    }, 50);
  }, []);

  const resetState = useCallback(() => {
    setParsedFile(null);
    setError(null);
  }, []);

  return (
    <div className="min-h-[100dvh] w-full bg-background text-foreground flex flex-col selection:bg-primary/20 selection:text-primary">
      {/* Header */}
      <header className="w-full border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 md:px-6 h-16 flex items-center gap-3">
          <div className="bg-primary p-2 rounded-lg text-primary-foreground shadow-sm">
            <BarChart2 className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            SheetSense
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-12 flex flex-col">
        {!parsedFile ? (
          <div className="flex-1 flex flex-col items-center justify-center animate-in fade-in duration-500 pb-12">
            <div className="max-w-2xl text-center mb-10 space-y-4">
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
                Data, made legible.
              </h2>
              <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                A quiet, focused tool for analyzing your spreadsheets locally. 
                No clutter. No uploads to servers. Just instant insights.
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
                <h2 className="text-2xl font-bold tracking-tight">Analysis Complete</h2>
                <p className="text-muted-foreground text-sm">
                  Successfully parsed locally in your browser.
                </p>
              </div>
              
              <button
                onClick={resetState}
                className="inline-flex items-center justify-center gap-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground px-4 py-2.5 rounded-lg font-medium transition-colors text-sm shadow-sm active:scale-[0.98]"
                data-testid="button-upload-another"
              >
                <RefreshCw className="w-4 h-4" />
                Upload another file
              </button>
            </div>

            <FileStats file={parsedFile} />
            <PreviewTable file={parsedFile} />
          </div>
        )}
      </main>
      
      {/* Footer */}
      <footer className="w-full border-t border-border mt-auto">
        <div className="max-w-6xl mx-auto px-4 md:px-6 h-16 flex items-center justify-center text-sm text-muted-foreground">
          <p>Local-first processing. Your data never leaves your browser.</p>
        </div>
      </footer>
    </div>
  );
}
