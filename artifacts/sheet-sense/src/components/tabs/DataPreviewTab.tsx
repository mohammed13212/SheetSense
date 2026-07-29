import { useState, useMemo } from "react";
import { Search, ChevronsUpDown, ArrowUp, ArrowDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocale } from "@/i18n/context";
import { tpl } from "@/i18n/tpl";
import type { ParsedFile } from "@/types";

// ─── Props ────────────────────────────────────────────────────────────────────

interface DataPreviewTabProps {
  file: ParsedFile;
}

// ─── Sort state ───────────────────────────────────────────────────────────────

type SortDir = "asc" | "desc" | null;

interface SortState {
  colIndex: number | null;
  dir: SortDir;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function DataPreviewTab({ file }: DataPreviewTabProps) {
  const { t } = useLocale();

  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortState>({ colIndex: null, dir: null });

  // Filter rows by search query
  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return file.previewRows;
    return file.previewRows.filter((row) =>
      row.some((cell) => {
        if (cell === null || cell === undefined) return false;
        return String(cell).toLowerCase().includes(q);
      }),
    );
  }, [file.previewRows, query]);

  // Sort filtered rows
  const displayRows = useMemo(() => {
    if (sort.colIndex === null || sort.dir === null) return filteredRows;
    const { colIndex, dir } = sort;
    return [...filteredRows].sort((a, b) => {
      const va = a[colIndex];
      const vb = b[colIndex];
      // Nulls always last
      if (va === null || va === undefined) return 1;
      if (vb === null || vb === undefined) return -1;
      const numA = Number(va);
      const numB = Number(vb);
      const isNumeric = !Number.isNaN(numA) && !Number.isNaN(numB);
      const cmp = isNumeric
        ? numA - numB
        : String(va).localeCompare(String(vb));
      return dir === "asc" ? cmp : -cmp;
    });
  }, [filteredRows, sort]);

  const cycleSort = (colIndex: number) => {
    setSort((prev) => {
      if (prev.colIndex !== colIndex) return { colIndex, dir: "asc" };
      if (prev.dir === "asc") return { colIndex, dir: "desc" };
      return { colIndex: null, dir: null };
    });
  };

  if (file.headers.length === 0 && file.previewRows.length === 0) {
    return (
      <div className="p-6 flex items-center justify-center h-48 text-sm text-muted-foreground">
        {t.preview.noData}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* ── Search bar ── */}
      <div className="px-6 py-4 border-b border-border shrink-0">
        <div className="relative max-w-sm">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.tabs.searchPlaceholder}
            className="w-full ps-9 pe-9 py-2 text-sm bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute end-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded text-muted-foreground hover:text-foreground transition-colors"
              aria-label={t.tabs.clearSearch}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* ── Table ── */}
      <div className="flex-1 overflow-auto">
        {displayRows.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">
            {t.tabs.noSearchResults}
          </div>
        ) : (
          <table
            className="w-full text-sm text-start border-collapse"
            dir="ltr"
            data-testid="preview-table"
          >
            <thead className="sticky top-0 z-10">
              <tr className="bg-muted/70 backdrop-blur-sm border-b border-border">
                {/* Row number column */}
                <th className="px-4 py-2.5 w-12 text-center text-xs font-medium text-muted-foreground border-r border-border select-none bg-muted/70">
                  #
                </th>
                {file.headers.map((header, i) => {
                  const isSorted = sort.colIndex === i;
                  return (
                    <th
                      key={i}
                      className="px-4 py-2.5 border-r border-border last:border-r-0 whitespace-nowrap"
                      data-testid={`th-header-${i}`}
                    >
                      <button
                        onClick={() => cycleSort(i)}
                        className={cn(
                          "inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide transition-colors",
                          isSorted
                            ? "text-primary"
                            : "text-muted-foreground hover:text-foreground",
                        )}
                        title={
                          !isSorted
                            ? t.tabs.sortAsc
                            : sort.dir === "asc"
                              ? t.tabs.sortDesc
                              : t.tabs.sortAsc
                        }
                      >
                        <span className="truncate max-w-[160px]">
                          {header || tpl(t.tabs.columnFallback, { n: String(i + 1) })}
                        </span>
                        {isSorted && sort.dir === "asc" ? (
                          <ArrowUp className="w-3 h-3 shrink-0" />
                        ) : isSorted && sort.dir === "desc" ? (
                          <ArrowDown className="w-3 h-3 shrink-0" />
                        ) : (
                          <ChevronsUpDown className="w-3 h-3 shrink-0 opacity-30" />
                        )}
                      </button>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-border font-mono text-[13px]">
              {displayRows.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className="hover:bg-muted/20 transition-colors"
                  data-testid={`tr-row-${rowIndex}`}
                >
                  {/* Row number */}
                  <td className="px-4 py-2.5 border-r border-border bg-muted/10 text-muted-foreground text-center select-none font-sans text-xs">
                    {rowIndex + 1}
                  </td>
                  {file.headers.map((_, colIndex) => {
                    const cellValue = row[colIndex];
                    const displayValue =
                      cellValue === null || cellValue === undefined
                        ? ""
                        : String(cellValue);

                    // Highlight match
                    const q = query.trim().toLowerCase();
                    const highlighted =
                      q && displayValue.toLowerCase().includes(q) ? (
                        <HighlightMatch text={displayValue} query={q} />
                      ) : null;

                    return (
                      <td
                        key={colIndex}
                        className={cn(
                          "px-4 py-2.5 border-r border-border last:border-r-0 whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px]",
                          !displayValue && "bg-muted/10",
                        )}
                        title={displayValue}
                        data-testid={`td-cell-${rowIndex}-${colIndex}`}
                      >
                        {highlighted ?? (
                          displayValue || (
                            <span className="text-muted-foreground/30 italic">
                              null
                            </span>
                          )
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ─── Highlight match ──────────────────────────────────────────────────────────

function HighlightMatch({ text, query }: { text: string; query: string }) {
  const idx = text.toLowerCase().indexOf(query);
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-primary/20 text-primary rounded-sm px-px">
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
}
