import { useEffect, useState, useCallback } from "react";
import { Link, useLocation } from "wouter";
import { BarChart2, Plus, FolderOpen, LogOut, FileSpreadsheet, ChevronRight } from "lucide-react";
import { useLocale } from "@/i18n/context";
import { useAuth } from "@/store/AuthContext";
import { useProject, type ActiveProject } from "@/store/ProjectContext";
import { useDatasets } from "@/store/DatasetContext";
import { apiGet, apiDelete } from "@/lib/api";

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
  const { user, signOut } = useAuth();
  const { setActiveProject, clearActiveProject } = useProject();
  const { clearDatasets } = useDatasets();
  const [, navigate] = useLocation();

  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const displayName =
    user?.user_metadata?.display_name ||
    user?.email?.split("@")[0] ||
    "there";

  const loadProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiGet<ProjectSummary[]>("/api/projects");
      // Enrich with file counts by loading each project's files
      setProjects(data);
    } catch {
      setError("Could not load projects. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  async function handleSignOut() {
    await signOut();
  }

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
      files: project.files.map((f) => ({
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

  async function handleDeleteProject(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    if (!confirm("Delete this project? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      await apiDelete(`/api/projects/${id}`);
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } catch {
      alert("Could not delete project. Please try again.");
    } finally {
      setDeletingId(null);
    }
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  return (
    <div className="min-h-[100dvh] bg-background text-foreground">
      {/* Top nav */}
      <header className="border-b border-border bg-card/60 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <div className="bg-primary p-1.5 rounded-lg text-primary-foreground shadow-sm">
              <BarChart2 className="w-4 h-4" />
            </div>
            <span className="text-base font-bold tracking-tight hidden sm:inline">{t.nav.appName}</span>
          </Link>

          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:inline truncate max-w-[180px]">
              {user?.email}
            </span>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Body */}
      <main className="max-w-5xl mx-auto px-4 py-10 space-y-10">
        {/* Welcome */}
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Welcome back</p>
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
            <p className="text-sm font-semibold">New Project</p>
            <p className="text-xs text-muted-foreground">
              Upload a spreadsheet and start analyzing
            </p>
          </div>
        </button>

        {/* Projects list */}
        <section className="space-y-4">
          <h2 className="text-base font-semibold">Your Projects</h2>

          {loading && (
            <div className="flex items-center justify-center py-16">
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {!loading && error && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}{" "}
              <button
                onClick={loadProjects}
                className="underline hover:no-underline ml-1"
              >
                Retry
              </button>
            </div>
          )}

          {!loading && !error && projects.length === 0 && (
            <div className="rounded-xl border border-border bg-card/30 p-12 flex flex-col items-center justify-center text-center space-y-3">
              <div className="p-3 rounded-full bg-muted/50">
                <FolderOpen className="w-6 h-6 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium">No projects yet</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Upload a file to create your first project.
                </p>
              </div>
            </div>
          )}

          {!loading && !error && projects.length > 0 && (
            <div className="space-y-2">
              {projects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => handleOpenProject(project)}
                  disabled={deletingId === project.id}
                  className="w-full text-start flex items-center gap-4 rounded-xl border border-border bg-card/40 hover:bg-card hover:border-primary/30 transition-colors p-4 group disabled:opacity-50"
                >
                  <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                    <FolderOpen className="w-4 h-4" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{project.name}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <FileSpreadsheet className="w-3 h-3" />
                        {project.files.length}{" "}
                        {project.files.length === 1 ? "file" : "files"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(project.updatedAt)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={(e) => handleDeleteProject(e, project.id)}
                      className="text-xs text-muted-foreground hover:text-destructive transition-colors px-2 py-1 rounded opacity-0 group-hover:opacity-100"
                    >
                      Delete
                    </button>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
