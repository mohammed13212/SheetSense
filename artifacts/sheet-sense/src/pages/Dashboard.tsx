import { useEffect, useState, useCallback } from "react";
import { useLocation } from "wouter";
import { Plus, FolderOpen, FileSpreadsheet, ChevronRight, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useLocale } from "@/i18n/context";
import { tpl } from "@/i18n/tpl";
import { useAuth } from "@/store/AuthContext";
import { useProject, type ActiveProject } from "@/store/ProjectContext";
import { useDatasets } from "@/store/DatasetContext";
import { apiGet, apiDelete } from "@/lib/api";
import { AuthNav } from "@/components/AuthNav";
import { ConfirmDialog } from "@/components/ConfirmDialog";

interface ProjectSummary {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  files: {
    id: string;
    originalName: string;
    rowCount: number | null;
    colCount: number | null;
    createdAt: string;
  }[];
}

export default function Dashboard() {
  const { t } = useLocale();
  const { user } = useAuth();
  const { setActiveProject, clearActiveProject } = useProject();
  const { clearDatasets } = useDatasets();
  const [, navigate] = useLocation();

  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Confirm dialog state
  const [confirmId, setConfirmId] = useState<string | null>(null);

  // Hidden IDs = items pending soft-delete (hidden optimistically, not yet deleted from DB)
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());

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
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  function handleNewProject() {
    clearActiveProject();
    clearDatasets();
    navigate("/");
  }

  function handleOpenProject(project: ProjectSummary) {
    const activeProject: ActiveProject = {
      id: project.id,
      name: project.name,
      description: project.description,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      files: (project.files ?? []).map((f) => ({
        id: f.id,
        projectId: project.id,
        originalName: f.originalName,
        mimeType: "",
        fileSize: 0,
        rowCount: f.rowCount,
        colCount: f.colCount,
        headers: [],
        sheetNames: [],
        createdAt: f.createdAt,
      })),
    };
    setActiveProject(activeProject);
    clearDatasets();
    navigate("/");
  }

  function handleDeleteClick(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    setConfirmId(id);
  }

  function handleDeleteConfirm() {
    const id = confirmId;
    if (!id) return;
    setConfirmId(null);

    // Optimistically hide the project
    setHiddenIds((prev) => new Set([...prev, id]));

    const project = projects.find((p) => p.id === id);
    const projectName = project?.name ?? t.dashboard.projectFallbackName;

    let undone = false;

    toast(tpl(t.dashboard.projectDeleted, { name: projectName }), {
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
        if (!undone) commitDelete(id);
      },
      onAutoClose: () => {
        if (!undone) commitDelete(id);
      },
    });
  }

  async function commitDelete(id: string) {
    try {
      await apiDelete(`/api/projects/${id}`);
      setProjects((prev) => prev.filter((p) => p.id !== id));
      setHiddenIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    } catch {
      // Restore on error
      setHiddenIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      toast.error(t.dashboard.deleteError);
    }
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  const visibleProjects = projects.filter((p) => !hiddenIds.has(p.id));

  return (
    <div className="min-h-[100dvh] bg-background text-foreground">
      <AuthNav />

      {/* Body */}
      <main className="max-w-5xl mx-auto px-4 py-10 space-y-10">
        {/* Welcome */}
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{t.dashboard.welcomeBack}</p>
          <h1 className="text-3xl font-bold tracking-tight capitalize">
            {displayName}
          </h1>
        </div>

        {/* New Project CTA */}
        <button
          onClick={handleNewProject}
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
          <h2 className="text-base font-semibold">{t.dashboard.recentProjects}</h2>

          {loading && (
            <div className="space-y-2" aria-busy="true" aria-label={t.common.loading}>
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-full flex items-center gap-4 rounded-xl border border-border bg-card/40 p-4 animate-pulse"
                >
                  <div className="w-8 h-8 rounded-lg bg-muted shrink-0" />
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="h-3.5 bg-muted rounded-md w-2/5" />
                    <div className="h-2.5 bg-muted rounded-md w-1/4" />
                  </div>
                  <div className="w-4 h-4 bg-muted rounded shrink-0" />
                </div>
              ))}
            </div>
          )}

          {!loading && error && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}{" "}
              <button onClick={loadProjects} className="underline hover:no-underline ml-1">
                {t.common.retry}
              </button>
            </div>
          )}

          {!loading && !error && visibleProjects.length === 0 && (
            <div className="rounded-xl border border-border bg-card/30 p-12 flex flex-col items-center justify-center text-center space-y-3">
              <div className="p-3 rounded-full bg-muted/50">
                <FolderOpen className="w-6 h-6 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium">{t.dashboard.noProjects}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {t.dashboard.noProjectsSub}
                </p>
              </div>
            </div>
          )}

          {!loading && !error && visibleProjects.length > 0 && (
            <div className="space-y-2">
              {visibleProjects.map((project) => {
                const totalRows = (project.files ?? []).reduce(
                  (sum, f) => sum + (f.rowCount ?? 0),
                  0,
                );
                return (
                <button
                  key={project.id}
                  onClick={() => handleOpenProject(project)}
                  className="w-full text-start flex items-center gap-4 rounded-xl border border-border bg-card/40 hover:bg-card hover:border-primary/30 transition-colors p-4 group"
                >
                  <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                    <FolderOpen className="w-4 h-4" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{project.name}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <FileSpreadsheet className="w-3 h-3" />
                        {(project.files ?? []).length}{" "}
                        {(project.files ?? []).length === 1 ? t.dashboard.file : t.dashboard.files}
                      </span>
                      {totalRows > 0 && (
                        <span className="text-xs text-muted-foreground">
                          {tpl(t.dashboard.rows, { n: totalRows.toLocaleString() })}
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {formatDate(project.updatedAt)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={(e) => handleDeleteClick(e, project.id)}
                      aria-label={t.dashboard.deleteProject}
                      className="text-muted-foreground hover:text-destructive transition-colors p-1.5 rounded-lg hover:bg-destructive/10 opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </div>
                </button>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* Confirm delete dialog */}
      <ConfirmDialog
        open={confirmId !== null}
        title={t.dashboard.confirmDeleteTitle}
        description={t.common.undoDescription}
        confirmLabel={t.common.delete}
        cancelLabel={t.common.cancel}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirmId(null)}
      />
    </div>
  );
}
