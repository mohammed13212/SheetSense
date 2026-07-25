import type { ParsedFile } from "@/types";
import { cn } from "@/lib/utils";

interface PreviewTableProps {
  file: ParsedFile;
}

export function PreviewTable({ file }: PreviewTableProps) {
  if (file.headers.length === 0 && file.previewRows.length === 0) {
    return (
      <div className="w-full h-48 border border-border rounded-xl bg-card flex items-center justify-center text-muted-foreground">
        No data found in the first sheet.
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-foreground tracking-tight">
          Data Preview
        </h3>
        <span className="text-sm text-muted-foreground px-3 py-1 bg-muted rounded-full">
          Showing first {file.previewRows.length} rows of "{file.firstSheetName}"
        </span>
      </div>
      
      <div className="w-full border border-border rounded-xl overflow-hidden bg-card shadow-sm">
        <div className="overflow-x-auto max-w-[calc(100vw-3rem)] md:max-w-none">
          <table className="w-full text-sm text-left" data-testid="preview-table">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
              <tr>
                <th className="px-4 py-3 font-medium whitespace-nowrap bg-muted/30 border-r border-border w-12 text-center text-muted-foreground">
                  #
                </th>
                {file.headers.map((header, i) => (
                  <th 
                    key={i} 
                    className="px-6 py-3 font-semibold whitespace-nowrap text-foreground tracking-wide border-r border-border last:border-r-0"
                    data-testid={`th-header-${i}`}
                  >
                    {header || `Column ${i + 1}`}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border font-mono text-[13px]">
              {file.previewRows.map((row, rowIndex) => (
                <tr 
                  key={rowIndex} 
                  className="hover:bg-muted/30 transition-colors"
                  data-testid={`tr-row-${rowIndex}`}
                >
                  <td className="px-4 py-3 border-r border-border bg-muted/10 text-muted-foreground text-center select-none font-sans text-xs">
                    {rowIndex + 1}
                  </td>
                  {file.headers.map((_, colIndex) => {
                    const cellValue = row[colIndex];
                    const displayValue = cellValue === null || cellValue === undefined 
                      ? "" 
                      : String(cellValue);
                    
                    return (
                      <td 
                        key={colIndex} 
                        className={cn(
                          "px-6 py-3 border-r border-border last:border-r-0 whitespace-nowrap overflow-hidden text-ellipsis max-w-xs",
                          !displayValue && "bg-muted/10"
                        )}
                        title={displayValue}
                        data-testid={`td-cell-${rowIndex}-${colIndex}`}
                      >
                        {displayValue || <span className="text-muted-foreground/30 italic">null</span>}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
