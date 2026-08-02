import { useEffect, useState, useCallback, useRef } from "react";
import { useLocation } from "wouter";
import {
  Plus,
  FolderOpen,
  FileSpreadsheet,
  ChevronRight,
  Trash2,
  Pencil,
} from "lucide-react";
import { toast } from "sonner";
import { useLocale } from "@/i18n/context";
import { tpl } from "@/i18n/tpl";
import { useAuth } from "@/store/AuthContext";
import { useProject } from "@/store/ProjectContext";
import { useDatasets } from "@/store/DatasetContext";
import { apiGet, apiDelete, apiPatch } from "@/lib/api";
import { AuthNav } from "@/components/AuthNav";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { NewProjectModal } from "@/components/NewProjectModal";

interface ProjectFile {
  id: string;
  originalName: string;
  rowCount: number | null;
  colCount: number | null;
  createdAt: string;
  storageKey: string | null;
}

interface ProjectSummary {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  lastOpenedAt: string | null;
  files: ProjectFile[];
}

export default function Dashboard() {
  const { t } = useLocale();
  const { user } = useAuth();
  const { clearActiveProject } = useProject();
  const { clearDatasets } = useDatasets();
  const [, navigate] = useLocation();

  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal
  const [newProjectOpen, setNewProjectOpen] = useState(false);

  // Confirm delete dialog
  const [confirmId, setConfirmId] = useState<string | null>(null);

  // Hidden IDs = soft-deleted, pending toast undo expiry
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());

  // Inline rename
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const renameInputRef = useRef<HTMLInputElement>(null);

  const displayName =
    user?.user_metadata?.display_name ||
    user?.email?.split("@")[0] ||
    "there";

  const loadProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiGet<ProjectSummary[]>("/api/projects");
      setProjects(data);
    } catch {
      setError(t.dashboard.loadError);
    } finally {
      setLoading(false);
    }
  }, [t.dashboard.loadError]);

  useEffect(() => {
    // Clear any active project when returning to the dashboard
    clearActiveProject();
    clearDatasets();
    loadProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleOpenProject(project: ProjectSummary) {
    navigate(`/projects/${project.id}`);
  }

  function handleRenameStart(e: React.MouseEvent, project: ProjectSummary) {
    e.stopPropagation();
    setRenamingId(project.id);
    setRenameValue(project.name);
    setTimeout(() => renameInputRef.current?.focus(), 30);
  }

  async function handleRenameCommit(id: string) {
    const trimmed = renameValue.trim();
    if (!trimmed) {
      setRenamingId(null);
      return;
    }
    const original = projects.find((p) => p.id === id)?.name ?? "";
    if (trimmed === original) {
      setRenamingId(null);
      return;
    }
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, name: trimmed } : p)),
    );
    setRenamingId(null);
    try {
      await apiPatch(`/api/projects/${id}`, { name: trimmed });
    } catch {
      setProjects((prev) =>
        prev.map((p) => (p.id === id ? { ...p, name: original } : p)),
      );
      toast.error(t.dashboard.renameError);
    }
  }

  function handleDeleteRequest(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    setConfirmId(id);
  }

  async function handleDeleteConfirm() {
    const id = confirmId;
    if (!id) return;
    setConfirmId(null);

    const project = projects.find((p) => p.id === id);
    const name = project?.name ?? t.dashboard.projectFallbackName;

    setHiddenIds((prev) => new Set([...prev, id]));

    let undone = false;

    toast(tpl(t.dashboard.projectDeleted, { name }), {
      duration: 7000,
      action: {
        label: t.common.undo,
        onClick: () => {
          undone = true;
          setHiddenIds((prev) => {
            const next = new Set(prev);
            next.delete(id);
            return next;
          });
        },
      },
      onDismiss: () => {
        if (!undone) {
          apiDelete(`/api/projects/${id}`).catch(() => {
            toast.error(t.dashboard.deleteError);
            setHiddenIds((prev) => {
              const next = new Set(prev);
              next.delete(id);
              return next;
            });
          });
        }
      },
      onAutoClose: () => {
        if (!undone) {
          apiDelete(`/api/projects/${id}`).catch(() => {
            toast.error(t.dashboard.deleteError);
            setHiddenIds((prev) => {
              const next = new Set(prev);
              next.delete(id);
              return next;
            });
          });
        }
      },
    });
  }

  const visibleProjects = projects.filter((p) => !hiddenIds.has(p.id));

  return (
    <div className="min-h-[100dvh] bg-background text-foreground">
      <AuthNav />

      <main className="max-w-5xl mx-auto px-4 py-10 space-y-10">
        {/* Welcome */}
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">
            {t.dashboard.welcomeBack}
          </p>
          <h1 className="text-3xl font-bold tracking-tight capitalize">
            {displayName}
          </h1>
        </div>

        {/* New Project CTA */}
        <button
          onClick={() => setNewProjectOpen(true)}
          className="flex items-center gap-3 w-full rounded-xl border border-dashed border-border bg-card/40 hover:bg-card hover:border-primary/40 transition-colors p-5 group text-start"
        >
          <div className="p-2.5 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/15 transition-colors shrink-0">
            <Plus className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-semibold">{t.dashboard.newProject}</p>
            <p className="text-xs text-muted-foreground">
              {t.dashboard.newProjectSub}
            </p>
          </div>
        </button>

        {/* Projects list */}
        <section className="space-y-4">
          <h2 className="text-base font-semibold">
            {t.dashboard.recentProjects}
          </h2>

          {loading && (
            <div
              className="space-y-2"
              aria-busy="true"
              aria-label={t.common.loading}
            >
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-full flex items-center gap-4 rounded-xl border border-border bg-card/40 p-4 animate-pulse"
                >
                  <div className="w-8 h-8 rounded-lg bg-muted shrink-0" />
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="h-3.5 bg-muted rounded-md w-2/5" />
                    <div className="h-2.5 bg-muted/60 rounded-md w-3/5" />
                  </div>
                  <div className="w-6 h-6 rounded bg-muted/60 shrink-0" />
                </div>
              ))}
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-5 text-center text-sm text-destructive">
              {error}
            </div>
          )}

          {!loading && !error && visibleProjects.length === 0 && (
            <div className="rounded-xl border border-dashed border-border bg-card/40 p-10 text-center space-y-2">
              <FolderOpen className="w-8 h-8 mx-auto text-muted-foreground/50" />
              <p className="text-sm font-medium text-foreground">
                {t.dashboard.noProjects}
              </p>
              <p className="text-xs text-muted-foreground">
                {t.dashboard.noProjectsSub}
              </p>
            </div>
          )}

          {!loading &&
            !error &&
            visibleProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                isRenaming={renamingId === project.id}
                renameValue={renameValue}
                renameInputRef={renameInputRef}
                onOpen={() => handleOpenProject(project)}
                onRenameStart={(e) => handleRenameStart(e, project)}
                onRenameChange={setRenameValue}
                onRenameCommit={() => handleRenameCommit(project.id)}
                onRenameCancel={() => setRenamingId(null)}
                onDeleteRequest={(e) => handleDeleteRequest(e, project.id)}
              />
            ))}
        </section>
      </main>

      {/* Confirm delete dialog */}
      <ConfirmDialog
        open={!!confirmId}
        title={t.dashboard.confirmDeleteTitle}
        description={t.common.undoDescription}
        confirmLabel={t.common.delete}
        cancelLabel={t.common.cancel}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirmId(null)}
      />

      {/* New project modal */}
      <NewProjectModal
        open={newProjectOpen}
        onClose={() => setNewProjectOpen(false)}
      />
    </div>
  );
}

// ─── Project card ─────────────────────────────────────────────────────────────

interface ProjectCardProps {
  project: ProjectSummary;
  isRenaming: boolean;
  renameValue: string;
  renameInputRef: React.RefObject<HTMLInputElement | null>;
  onOpen: () => void;
  onRenameStart: (e: React.MouseEvent) => void;
  onRenameChange: (v: string) => void;
  onRenameCommit: () => void;
  onRenameCancel: () => void;
  onDeleteRequest: (e: React.MouseEvent) => void;
}

function ProjectCard({
  project,
  isRenaming,
  renameValue,
  renameInputRef,
  onOpen,
  onRenameStart,
  onRenameChange,
  onRenameCommit,
  onRenameCancel,
  onDeleteRequest,
}: ProjectCardProps) {
  const { t, dir } = useLocale();
  const fileCount = project.files?.length ?? 0;
  const totalRows = project.files?.reduce(
    (sum, f) => sum + (f.rowCount ?? 0),
    0,
  );

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") onRenameCommit();
    if (e.key === "Escape") onRenameCancel();
  }

  return (
    <div
      dir={dir}
      className="group relative flex items-center gap-4 rounded-xl border border-border bg-card p-4 hover:border-primary/30 hover:shadow-sm transition-all cursor-pointer"
      onClick={isRenaming ? undefined : onOpen}
      role="button"
      tabIndex={isRenaming ? -1 : 0}
      onKeyDown={
        isRenaming
          ? undefined
          : (e) => {
              if (e.key === "Enter" || e.key === " ") onOpen();
            }
      }
    >
      {/* Icon */}
      <div className="p-2 rounded-lg bg-primary/8 text-primary shrink-0">
        <FolderOpen className="w-5 h-5" />
      </div>

      {/* Name / rename input */}
      <div className="flex-1 min-w-0">
        {isRenaming ? (
          <input
            ref={renameInputRef}
            value={renameValue}
            autoFocus
            onChange={(e) => onRenameChange(e.target.value)}
            onBlur={onRenameCommit}
            onKeyDown={handleKeyDown}
            onClick={(e) => e.stopPropagation()}
            className="w-full text-sm font-semibold bg-transparent border-b border-primary outline-none text-foreground"
            maxLength={100}
            placeholder={t.dashboard.renameInputPlaceholder}
          />
        ) : (
          <p className="text-sm font-semibold text-foreground truncate">
            {project.name}
          </p>
        )}

        {/* File stats */}
        <div className="mt-0.5 flex items-center flex-wrap gap-x-2 gap-y-0.5">
          {fileCount > 0 && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <FileSpreadsheet className="w-3 h-3" />
              {fileCount === 1
                ? `1 ${t.dashboard.file}`
                : `${fileCount} ${t.dashboard.files}`}
            </span>
          )}
          {totalRows > 0 && (
            <span className="text-xs text-muted-foreground">
              · {tpl(t.dashboard.rows, { n: totalRows.toLocaleString() })}
            </span>
          )}
        </div>
      </div>

      {/* Actions (visible on hover) */}
      {!isRenaming && (
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button
            onClick={onRenameStart}
            aria-label={t.dashboard.renameProject}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onDeleteRequest}
            aria-label={t.dashboard.deleteProject}
            className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <ChevronRight className="w-4 h-4 text-muted-foreground/40 ms-1" />
        </div>
      )}
    </div>
  );
}
