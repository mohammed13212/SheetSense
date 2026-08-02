/**
 * ProjectWorkspace — the main authenticated workspace page.
 *
 * Lives at /projects/:projectId. On mount it:
 *   1. Fetches the project metadata + file list from the API.
 *   2. Downloads each file binary from object storage and re-parses it.
 *   3. Loads persisted relationships.
 *   4. Populates ProjectContext and DatasetContext.
 *
 * From here the user can analyse datasets, upload additional files, and
 * navigate to the relationship manager.
 */

import { useState, useCallback, useEffect, useRef } from "react";
import { useParams, useLocation } from "wouter";
import {
  FolderOpen,
  AlertCircle,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useLocale } from "@/i18n/context";
import { tpl } from "@/i18n/tpl";
import { useAuth } from "@/store/AuthContext";
import { useProject } from "@/store/ProjectContext";
import { useDatasets } from "@/store/DatasetContext";
import { AuthNav } from "@/components/AuthNav";
import { DatasetSidebar } from "@/components/DatasetSidebar";
import { DatasetPanel } from "@/components/DatasetPanel";
import { DropZone } from "@/components/DropZone";
import { parseFile, FileParseError } from "@/lib/parseFile";
import { apiPost } from "@/lib/api";
import { loadProject, uploadToStorage } from "@/lib/projectLoader";
import type { ActiveProject, ProjectFile } from "@/store/ProjectContext";
import type { ParsedFile } from "@/types";
import type { User } from "@supabase/supabase-js";

// ─── Load states ──────────────────────────────────────────────────────────────

type LoadState = "idle" | "loading" | "ready" | "not-found" | "error";

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProjectWorkspace() {
  const { t, dir } = useLocale();
  const { user } = useAuth();
  const { setActiveProject, setRelationships, clearActiveProject, addFileToProject } =
    useProject();
  const { addDataset, clearDatasets, activeDataset, datasets } = useDatasets();
  const [, navigate] = useLocation();

  const params = useParams<{ projectId: string }>();
  const projectId = params.projectId;

  const [loadState, setLoadState] = useState<LoadState>("idle");
  const [unavailableCount, setUnavailableCount] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Track which projectId we've already loaded to avoid re-loading
  const loadedIdRef = useRef<string | null>(null);

  const hydrate = useCallback(
    async (id: string) => {
      setLoadState("loading");
      clearDatasets();
      clearActiveProject();
      loadedIdRef.current = null;

      try {
        const { project, datasets: loaded, unavailableFiles, relationships } =
          await loadProject(id);

        setActiveProject(project);
        setRelationships(relationships);
        for (const ds of loaded) {
          addDataset(ds.file, {
            serverFileId: ds.serverFileId,
            displayName: ds.displayName,
          });
        }
        setUnavailableCount(unavailableFiles.length);
        loadedIdRef.current = id;
        setLoadState("ready");
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        if (msg.includes("404")) {
          setLoadState("not-found");
        } else {
          setLoadState("error");
        }
      }
    },
    [clearDatasets, clearActiveProject, setActiveProject, setRelationships, addDataset],
  );

  useEffect(() => {
    if (!projectId) return;
    if (loadedIdRef.current === projectId) return;
    hydrate(projectId);
  }, [projectId, hydrate]);

  // ── Loading skeleton ───────────────────────────────────────────────────────

  if (loadState === "loading" || loadState === "idle") {
    return (
      <div className="flex flex-col h-[100dvh] bg-background text-foreground">
        <AuthNav />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="p-3 rounded-full bg-primary/10">
              <FolderOpen className="w-7 h-7 text-primary animate-pulse" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">
                {t.workspace.loadingProject}
              </p>
              <p className="text-xs text-muted-foreground">
                {t.workspace.loadingProjectSub}
              </p>
            </div>
            {/* Skeleton bars */}
            <div className="w-64 space-y-2 mt-2">
              {[80, 60, 72].map((w, i) => (
                <div
                  key={i}
                  className="h-2.5 rounded-full bg-muted animate-pulse"
                  style={{ width: `${w}%` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Not found ──────────────────────────────────────────────────────────────

  if (loadState === "not-found") {
    return (
      <div className="flex flex-col h-[100dvh] bg-background text-foreground">
        <AuthNav />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4 text-center max-w-sm px-4">
            <div className="p-3 rounded-full bg-muted">
              <AlertCircle className="w-7 h-7 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">
                {t.workspace.projectNotFound}
              </p>
              <p className="text-xs text-muted-foreground">
                {t.workspace.projectNotFoundSub}
              </p>
            </div>
            <button
              onClick={() => navigate("/dashboard")}
              className="mt-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
            >
              {t.workspace.backToDashboard}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Load error ─────────────────────────────────────────────────────────────

  if (loadState === "error") {
    return (
      <div className="flex flex-col h-[100dvh] bg-background text-foreground">
        <AuthNav />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4 text-center max-w-sm px-4">
            <div className="p-3 rounded-full bg-destructive/10">
              <AlertCircle className="w-7 h-7 text-destructive" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">
                {t.workspace.openingError}
              </p>
            </div>
            <button
              onClick={() => hydrate(projectId!)}
              className="flex items-center gap-2 mt-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              {t.common.retry}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Workspace (ready) ──────────────────────────────────────────────────────

  return (
    <div
      dir={dir}
      className="flex flex-col h-[100dvh] bg-background text-foreground selection:bg-primary/20 selection:text-primary overflow-hidden"
    >
      <AuthNav
        showMenuButton={datasets.length > 0}
        onMenuClick={() => setSidebarOpen(true)}
      />

      {unavailableCount > 0 && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          {tpl(t.workspace.filesUnavailable, { n: String(unavailableCount) })}
        </div>
      )}

      <div className="flex flex-1 min-h-0">
        <DatasetSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <main className="flex-1 overflow-y-auto min-h-0">
          {activeDataset ? (
            <DatasetPanel dataset={activeDataset} />
          ) : (
            <EmptyProjectUpload
              user={user}
              projectId={projectId!}
              addDataset={addDataset}
              addFileToProject={addFileToProject}
            />
          )}
        </main>
      </div>
    </div>
  );
}

// ─── Empty project upload ──────────────────────────────────────────────────────

interface EmptyProjectUploadProps {
  user: User | null;
  projectId: string;
  addDataset: (file: ParsedFile, opts?: { serverFileId?: string; displayName?: string }) => string;
  addFileToProject: (file: ProjectFile) => void;
}

function EmptyProjectUpload({
  user,
  projectId,
  addDataset,
  addFileToProject,
}: EmptyProjectUploadProps) {
  const { t } = useLocale();
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
          // Upload to storage and persist the file record
          let storageKey: string | null = null;
          try {
            storageKey = await uploadToStorage(file);
          } catch {
            // Storage upload is best-effort; analysis still works locally
          }
          const savedFile = await apiPost<ProjectFile>(
            `/api/projects/${projectId}/files`,
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
              storageKey,
            },
          );
          addDataset(pf, { serverFileId: savedFile.id });
          addFileToProject(savedFile);
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
    [t, projectId, addDataset, addFileToProject],
  );

  return (
    <div className="flex flex-col items-center justify-center h-full px-4 py-8">
      <div className="w-full max-w-2xl space-y-4">
        <p className="text-sm text-muted-foreground text-center">
          {t.workspace.uploadFirstFile}
        </p>
        <DropZone
          onFilesAccepted={processFiles}
          isLoading={isLoading}
          error={error}
        />
      </div>
    </div>
  );
}
