import { useState, useCallback } from "react";
import { ArrowRight } from "lucide-react";
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
  const { datasets, activeDataset, addDataset, clearDatasets } = useDatasets();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // showHero: true = landing/hero view; false = workspace view.
  // Starts on the hero. Auto-switches to workspace after the first upload.
  // Logo click from workspace returns here without losing any data.
  const [showHero, setShowHero] = useState(true);

  const hasDatasets = datasets.length > 0;
  const inWorkspace = hasDatasets && !showHero;

  return (
    <div
      dir={dir}
      className="flex flex-col h-[100dvh] bg-background text-foreground selection:bg-primary/20 selection:text-primary overflow-hidden"
    >
      {/* ── Header ── */}
      <AppHeader
        isInWorkspace={inWorkspace}
        showMenuButton={inWorkspace}
        onMenuClick={() => setSidebarOpen(true)}
        // From the workspace, clicking the logo clears all datasets and returns
        // to the hero so the next upload always starts a clean project.
        onLogoClick={inWorkspace ? () => { clearDatasets(); setShowHero(true); } : undefined}
      />

      {/* ── Body ── */}
      {inWorkspace ? (
        /* ── Workspace ── */
        <div className="flex flex-1 min-h-0">
          <DatasetSidebar
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />
          <main className="flex-1 overflow-y-auto min-h-0">
            {activeDataset ? (
              <DatasetPanel dataset={activeDataset} />
            ) : (
              <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                {t.datasets.selectPrompt}
              </div>
            )}
          </main>
        </div>
      ) : (
        /* ── Hero ── */
        <div className="flex flex-col flex-1 min-h-0 items-center justify-center">
          {/* "Back to workspace" banner — shown when datasets already exist */}
          {hasDatasets && (
            <div className="w-full max-w-2xl mx-auto px-4 mb-4">
              <button
                onClick={() => setShowHero(false)}
                className="w-full flex items-center justify-between gap-2 px-4 py-3 rounded-xl border border-primary/30 bg-primary/5 text-sm font-medium text-primary hover:bg-primary/10 transition-colors"
              >
                <span>
                  {t.datasets.backToWorkspace}
                  <span className="ms-1.5 text-xs font-normal text-primary/70">
                    ({datasets.length})
                  </span>
                </span>
                <ArrowRight className="w-4 h-4 shrink-0" />
              </button>
            </div>
          )}

          <HeroUpload
            onUploadSuccess={() => setShowHero(false)}
          />
        </div>
      )}

      {/* ── Footer — only on the hero screen ── */}
      {!inWorkspace && (
        <footer className="shrink-0 border-t border-border h-14 flex items-center justify-center">
          <p className="text-sm text-muted-foreground">{t.footer.text}</p>
        </footer>
      )}
    </div>
  );
}

// ─── Hero upload ──────────────────────────────────────────────────────────────

interface HeroUploadProps {
  onUploadSuccess: () => void;
}

function HeroUpload({ onUploadSuccess }: HeroUploadProps) {
  const { t } = useLocale();
  const { addDataset } = useDatasets();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processFiles = useCallback(
    async (files: File[]) => {
      if (files.length === 0) return;
      setIsLoading(true);
      setError(null);
      await new Promise((r) => setTimeout(r, 50));
      try {
        for (const file of files) {
          const pf = await parseFile(file);
          addDataset(pf);
        }
        onUploadSuccess();
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
    [t, addDataset, onUploadSuccess],
  );

  return (
    <div className={cn(
      "flex flex-col items-center justify-center px-4 py-6 animate-in fade-in duration-500 w-full max-w-2xl mx-auto",
    )}>
      <div className="text-center mb-6 space-y-2.5">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
          {t.hero.heading}
        </h2>
        <p className="text-base text-muted-foreground max-w-lg mx-auto leading-relaxed">
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
