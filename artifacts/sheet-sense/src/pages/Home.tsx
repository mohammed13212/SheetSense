import { useState, useCallback, useEffect } from "react";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { DropZone } from "@/components/DropZone";
import { AppHeader } from "@/components/AppHeader";
import { DatasetSidebar } from "@/components/DatasetSidebar";
import { DatasetPanel } from "@/components/DatasetPanel";
import { useLocale } from "@/i18n/context";
import { useDatasets } from "@/store/DatasetContext";
import { useAuth } from "@/store/AuthContext";
import { useProject } from "@/store/ProjectContext";
import { FloatingThemeToggle } from "@/components/FloatingThemeToggle";
import { parseFile, FileParseError } from "@/lib/parseFile";
import { apiPost } from "@/lib/api";
import type { ParsedFile } from "@/types";

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Home() {
  const { t, dir } = useLocale();
  const { datasets, activeDataset, addDataset, clearDatasets } = useDatasets();
  const { activeProject, clearActiveProject } = useProject();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // showHero: true = landing/hero view; false = workspace view.
  // If an active project is set (opened from Dashboard), jump straight to workspace.
  const [showHero, setShowHero] = useState(
    () => datasets.length === 0 && !activeProject
  );

  // When a project is opened from the Dashboard (datasets are cleared but
  // activeProject is set), show the workspace upload area immediately.
  useEffect(() => {
    if (activeProject && datasets.length === 0) {
      setShowHero(false);
    }
  }, [activeProject, datasets.length]);

  const hasDatasets = datasets.length > 0;
  const inWorkspace = (hasDatasets || !!activeProject) && !showHero;

  function handleLogoClick() {
    clearDatasets();
    clearActiveProject();
    setShowHero(true);
  }

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
        onLogoClick={inWorkspace ? handleLogoClick : undefined}
        projectName={inWorkspace ? activeProject?.name : undefined}
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
              /* No dataset loaded yet — show the drop zone inside workspace */
              <div className="flex flex-col items-center justify-center h-full px-4 py-8">
                <WorkspaceUpload />
              </div>
            )}
          </main>
        </div>
      ) : (
        /* ── Hero ── */
        <div className="hero-glow flex flex-col flex-1 min-h-0 items-center justify-center">
          {/* "Back to workspace" banner */}
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

          <HeroUpload onUploadSuccess={() => setShowHero(false)} />
        </div>
      )}

      {/* ── Floating theme toggle ── */}
      <FloatingThemeToggle />
    </div>
  );
}

// ─── Workspace upload (inside workspace when no dataset is selected) ───────────

function WorkspaceUpload() {
  const { t } = useLocale();
  const { addDataset } = useDatasets();
  const { user } = useAuth();
  const { activeProject, setActiveProject, addFileToProject } = useProject();
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
          const id = addDataset(pf);
          if (user) {
            await persistFile(pf, file, user, activeProject, setActiveProject, addFileToProject);
          }
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
    [t, addDataset, user, activeProject, setActiveProject, addFileToProject]
  );

  return (
    <div className="w-full max-w-2xl space-y-4">
      <p className="text-sm text-muted-foreground text-center">
        {activeProject
          ? `Add a file to "${activeProject.name}"`
          : t.dropzone.title}
      </p>
      <DropZone
        onFilesAccepted={processFiles}
        isLoading={isLoading}
        error={error}
      />
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
  const { user } = useAuth();
  const { activeProject, setActiveProject, addFileToProject } = useProject();
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
          if (user) {
            await persistFile(pf, file, user, activeProject, setActiveProject, addFileToProject);
          }
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
    [t, addDataset, onUploadSuccess, user, activeProject, setActiveProject, addFileToProject]
  );

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center px-4 py-8 animate-in fade-in duration-500 w-full max-w-2xl mx-auto"
      )}
    >
      <div className="text-center mb-8 space-y-3">
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

      <div className="mt-4 flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-primary/5 border border-primary/15 text-sm">
        <ShieldCheck className="w-4 h-4 shrink-0 text-primary" />
        <span className="font-medium text-primary/90">{t.footer.privacyTitle}</span>
        <span className="text-muted-foreground">&mdash; {t.footer.privacyDesc}</span>
      </div>
    </div>
  );
}

// ─── Persist to API (shared helper) ──────────────────────────────────────────

import type { User } from "@supabase/supabase-js";
import type { ActiveProject, ProjectFile } from "@/store/ProjectContext";

async function persistFile(
  pf: ParsedFile,
  file: File,
  user: User,
  activeProject: ActiveProject | null,
  setActiveProject: (p: ActiveProject) => void,
  addFileToProject: (f: ProjectFile) => void
) {
  try {
    // Step 1 — ensure a project exists
    let project = activeProject;
    if (!project) {
      // Create a new project named after the first file (without extension)
      const projectName = file.name.replace(/\.[^.]+$/, "");
      const created = await apiPost<ActiveProject>("/api/projects", {
        name: projectName,
      });
      project = { ...created, files: [] };
      setActiveProject(project);
    }

    // Step 2 — save the file record
    const savedFile = await apiPost<ProjectFile>(
      `/api/projects/${project.id}/files`,
      {
        originalName: file.name,
        mimeType: file.type || "application/octet-stream",
        fileSize: file.size,
        rowCount: pf.rowCount ?? null,
        colCount: pf.colCount ?? null,
        headers: pf.headers ?? [],
        sheetNames: pf.sheetNames ?? [],
        dataQuality: pf.dataQuality ?? null,
        isProcessed: true,
      }
    );

    addFileToProject(savedFile);
  } catch (err) {
    // Persistence is best-effort — don't interrupt the user's local analysis
    console.warn("Failed to persist file to project:", err);
  }
}
