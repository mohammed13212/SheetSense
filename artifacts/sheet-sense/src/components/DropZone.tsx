import { useState, useRef, type DragEvent, type ChangeEvent } from "react";
import { UploadCloud, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocale } from "@/i18n/context";

interface DropZoneProps {
  /** Called with every accepted file. Multiple files are passed together when
   *  the user drops or selects more than one at a time. */
  onFilesAccepted: (files: File[]) => void;
  isLoading: boolean;
  error?: string | null;
}

export function DropZone({ onFilesAccepted, isLoading, error }: DropZoneProps) {
  const { t } = useLocale();
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesAccepted(Array.from(e.dataTransfer.files));
      e.dataTransfer.clearData();
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesAccepted(Array.from(e.target.files));
      // Reset so the same file(s) can be re-selected
      e.target.value = "";
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-4">
      {/* Drop Target */}
      <div
        data-testid="drop-zone"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isLoading && fileInputRef.current?.click()}
        className={cn(
          "relative group overflow-hidden rounded-2xl border-2 border-dashed transition-all duration-300 ease-out flex flex-col items-center justify-center min-h-[320px] p-8 cursor-pointer select-none",
          isDragOver
            ? "border-primary bg-primary/5 scale-[1.02]"
            : "border-border/60 bg-card hover:border-primary/50 hover:bg-muted/30",
          isLoading && "pointer-events-none opacity-80",
          error && "border-destructive/50 bg-destructive/5",
        )}
      >
        <input
          data-testid="input-file-picker"
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".xlsx,.xls,.csv"
          multiple
          className="hidden"
        />

        <div className="flex flex-col items-center text-center space-y-6">
          <div
            className={cn(
              "w-20 h-20 rounded-full flex items-center justify-center transition-colors duration-300",
              isDragOver ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground",
              error && "bg-destructive/10 text-destructive",
            )}
          >
            {isLoading ? (
              <Loader2 className="w-10 h-10 animate-spin text-primary" data-testid="icon-loading" />
            ) : error ? (
              <AlertCircle className="w-10 h-10" data-testid="icon-error" />
            ) : (
              <UploadCloud
                className={cn("w-10 h-10 transition-transform duration-300", isDragOver && "-translate-y-1")}
                data-testid="icon-upload"
              />
            )}
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-medium text-foreground tracking-tight">
              {isLoading ? t.dropzone.titleLoading : t.dropzone.title}
            </h3>
            <p className="text-sm text-muted-foreground max-w-[280px] leading-relaxed mx-auto">
              {isLoading ? t.dropzone.subtitleLoading : t.dropzone.subtitle}
            </p>
          </div>
        </div>

        {/* Decorative subtle grid background on hover/drag */}
        <div
          className={cn(
            "absolute inset-0 z-[-1] transition-opacity duration-500 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PHBhdGggZD0iTTAgMjBoMjBWMEgweiIgZmlsbD0ibm9uZSIvPPHBhdGggZD0iTTAgMTkuNWgyMFYwIiBzdHJva2U9IiNlNWU3ZWIiIHN0cm9rZS13aWR0aD0iMSIgZmlsbD0ibm9uZSIvPjwvc3ZnPg==')]",
            isDragOver ? "opacity-40" : "opacity-0 group-hover:opacity-20",
            "dark:bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PHBhdGggZD0iTTAgMjBoMjBWMEgweiIgZmlsbD0ibm9uZSIvPPHBhdGggZD0iTTAgMTkuNWgyMFYwIiBzdHJva2U9IiMzNzQxNTEiIHN0cm9rZS13aWR0aD0iMSIgZmlsbD0ibm9uZSIvPjwvc3ZnPg==')]",
          )}
        />
      </div>

      {error && (
        <div
          className="flex items-center gap-2 text-destructive text-sm font-medium justify-center animate-in fade-in slide-in-from-top-1"
          data-testid="error-message"
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
