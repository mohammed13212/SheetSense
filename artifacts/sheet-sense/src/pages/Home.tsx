import { useState, useCallback } from "react";
import { BarChart2, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { DropZone } from "@/components/DropZone";
import { DatasetSidebar } from "@/components/DatasetSidebar";
import { DatasetPanel } from "@/components/DatasetPanel";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
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
      <header className="h-16 shrink-0 border-b border-border bg-card/60 backdrop-blur-sm sticky top-0 z-20">
        <div className="h-full px-4 md:px-5 flex items-center gap-3">
          {/* Mobile hamburger — only when datasets exist */}
          {hasDatasets && (
            <button
              onClick={() => setSidebarOpen(true)}
              aria-label={t.datasets.openSidebar}
              className="lg:hidden p-2 -ms-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="bg-primary p-2 rounded-lg text-primary-foreground shadow-sm shrink-0">
              <BarChart2 className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              {t.nav.appName}
            </h1>
          </div>

          {/* Dataset count badge (desktop) */}
          {hasDatasets && (
            <span className="hidden sm:inline text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5 tabular-nums">
              {datasets.length}{" "}
              {datasets.length === 1
                ? t.datasets.sidebarTitle.replace(/s$/, "")
                : t.datasets.sidebarTitle}
            </span>
          )}

          <div className="ms-auto">
            <LanguageSwitcher />
          </div>
        </div>
      </header>

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

  const processFile = useCallback(
    async (file: File) => {
      setIsLoading(true);
      setError(null);
      // Yield to React so the loading indicator renders before xlsx blocks the thread
      await new Promise((r) => setTimeout(r, 50));
      try {
        const pf = await parseFile(file);
        addDataset(pf);
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
        onFileAccepted={processFile}
        isLoading={isLoading}
        error={error}
      />
    </div>
  );
}
