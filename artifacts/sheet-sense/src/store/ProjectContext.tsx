/**
 * ProjectContext — tracks the currently active server-side project.
 *
 * An "active project" is created on the server when an authenticated user
 * uploads their first file. Subsequent uploads in the same session add files
 * to the same project.
 *
 * Unauthenticated users have no active project (null). Their uploads are
 * local-only (existing behaviour is unchanged).
 */

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ProjectFile {
  id: string;
  projectId: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  rowCount: number | null;
  colCount: number | null;
  headers: string[];
  sheetNames: string[];
  createdAt: string;
}

export interface ActiveProject {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  files: ProjectFile[];
}

interface ProjectContextValue {
  /** The currently open project, or null if no project is active. */
  activeProject: ActiveProject | null;

  /** Set the active project (e.g. when opening one from the Dashboard). */
  setActiveProject: (project: ActiveProject) => void;

  /** Add a file record to the active project (after a successful API save). */
  addFileToProject: (file: ProjectFile) => void;

  /** Clear the active project (e.g. when starting a "New Project"). */
  clearActiveProject: () => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const ProjectContext = createContext<ProjectContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [activeProject, setActiveProjectState] =
    useState<ActiveProject | null>(null);

  const setActiveProject = useCallback((project: ActiveProject) => {
    setActiveProjectState(project);
  }, []);

  const addFileToProject = useCallback((file: ProjectFile) => {
    setActiveProjectState((prev) =>
      prev ? { ...prev, files: [...prev.files, file] } : prev
    );
  }, []);

  const clearActiveProject = useCallback(() => {
    setActiveProjectState(null);
  }, []);

  return (
    <ProjectContext.Provider
      value={{
        activeProject,
        setActiveProject,
        addFileToProject,
        clearActiveProject,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useProject(): ProjectContextValue {
  const ctx = useContext(ProjectContext);
  if (!ctx)
    throw new Error("useProject must be called inside <ProjectProvider>");
  return ctx;
}
