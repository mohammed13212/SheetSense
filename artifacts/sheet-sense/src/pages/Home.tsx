import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { DropZone } from "@/components/DropZone";
import { AppHeader } from "@/components/AppHeader";
import { DatasetSidebar } from "@/components/DatasetSidebar";
import { DatasetPanel } from "@/components/DatasetPanel";
import { useLocale } from "@/i18n/context";
import { useDatasets } from "@/store/DatasetContext";
import { parseFile, FileParseError } from "@/lib/parseFile";

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Home() {
  const { t, dir } = useLocale();
  const { datasets, activeDataset, addDataset } = useDatasets();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const hasDatasets = datasets.length > 0;

  return (
    <div
      dir={dir}
      className="flex flex-col h-[100dvh] bg-background text-foreground selection:bg-primary/20 selection:text-primary overflow-hidden"
    >
      {/* ── Header ── */}
      <AppHeader
        showMenuButton={hasDatasets}
        onMenuClick={() => setSidebarOpen(true)}
      />

      {/* ── Body ── */}
      <div
        className={cn(
          "flex flex-1 min-h-0",
          !hasDatasets && "items-center justify-center",
        )}
      >
        {hasDatasets ? (
          <>
            {/* Sidebar (desktop: always visible; mobile: drawer) */}
            <DatasetSidebar
              isOpen={sidebarOpen}
              onClose={() => setSidebarOpen(false)}
            />

            {/* Main analysis area */}
            <main className="flex-1 overflow-y-auto min-h-0">
              {activeDataset ? (
                <DatasetPanel dataset={activeDataset} />
              ) : (
                <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                  {t.datasets.selectPrompt}
                </div>
              )}
            </main>
          </>
        ) : (
          /* Hero — shown only before the first upload */
          <HeroUpload />
        )}
      </div>

      {/* ── Footer — only on the empty hero screen ── */}
      {!hasDatasets && (
        <footer className="shrink-0 border-t border-border h-14 flex items-center justify-center">
          <p className="text-sm text-muted-foreground">{t.footer.text}</p>
        </footer>
      )}
    </div>
  );
}

// ─── Hero upload (no datasets yet) ───────────────────────────────────────────

function HeroUpload() {
  const { t } = useLocale();
  const { addDataset } = useDatasets();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processFiles = useCallback(
    async (files: File[]) => {
      if (files.length === 0) return;
      setIsLoading(true);
      setError(null);
      // Yield to React so the loading indicator renders before xlsx blocks the thread
      await new Promise((r) => setTimeout(r, 50));
      try {
        // Process files sequentially; each one becomes its own dataset.
        // The last successfully parsed file becomes the active selection.
        for (const file of files) {
          const pf = await parseFile(file);
          addDataset(pf);
        }
      } catch (err) {
        if (err instanceof FileParseError) {
          const map: Record<string, string> = {
            INVALID_FILE: t.errors.invalidFile,
            PARSE_ERROR: t.errors.parseError,
            READ_ERROR: t.errors.readError,
            EMPTY_FILE: t.errors.parseError,
          };
          setError(map[err.code] ?? t.errors.parseError);
        } else {
          setError(t.errors.parseError);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [t, addDataset],
  );

  return (
    <div className="flex flex-col items-center justify-center px-4 py-8 animate-in fade-in duration-500 w-full max-w-2xl mx-auto">
      <div className="text-center mb-10 space-y-4">
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
          {t.hero.heading}
        </h2>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto">
          {t.hero.subheading}
        </p>
      </div>
      <DropZone
        onFilesAccepted={processFiles}
        isLoading={isLoading}
        error={error}
      />
    </div>
  );
}
