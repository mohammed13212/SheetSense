/**
 * ProjectContext — tracks the currently active project and its persisted state.
 *
 * The active project is the source of truth for the workspace. When a user
 * opens a project from the Dashboard (/projects/:id), this context is
 * populated from the API. It is cleared on Dashboard navigation or sign-out.
 *
 * Relationships are stored here so they are available to both the workspace
 * and the RelationshipManager without re-fetching.
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
  storageKey: string | null;
  displayName: string | null;
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

/** A persisted relationship record returned by the API. */
export interface PersistedRelationship {
  id: string;
  projectId: string;
  sourceFileId: string;
  sourceColumn: string;
  targetFileId: string;
  targetColumn: string;
  confidence: number;
  confidenceLevel: "high" | "medium" | "low";
  isAutoCreated: boolean;
  label: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ProjectContextValue {
  /** The currently open project, or null if no project is active. */
  activeProject: ActiveProject | null;

  /** Persisted relationships for the active project. */
  relationships: PersistedRelationship[];

  /** Set the active project (e.g. when opening from the Dashboard). */
  setActiveProject: (project: ActiveProject) => void;

  /** Replace the entire relationships list (e.g. after loading from API). */
  setRelationships: (rels: PersistedRelationship[]) => void;

  /** Append a newly created relationship (optimistic / after API create). */
  addRelationship: (rel: PersistedRelationship) => void;

  /** Remove a relationship by ID (optimistic / after API delete). */
  removeRelationship: (id: string) => void;

  /** Add a file record to the active project (after a successful API save). */
  addFileToProject: (file: ProjectFile) => void;

  /** Remove a file record from the active project (after a successful API delete). */
  removeFileFromProject: (fileId: string) => void;

  /** Update the displayName of a file in the active project (after a successful API patch). */
  updateFileDisplayName: (fileId: string, displayName: string | null) => void;

  /** Clear the active project and its relationships. */
  clearActiveProject: () => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const ProjectContext = createContext<ProjectContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [activeProject, setActiveProjectState] =
    useState<ActiveProject | null>(null);
  const [relationships, setRelationshipsState] = useState<
    PersistedRelationship[]
  >([]);

  const setActiveProject = useCallback((project: ActiveProject) => {
    setActiveProjectState(project);
  }, []);

  const setRelationships = useCallback((rels: PersistedRelationship[]) => {
    setRelationshipsState(rels);
  }, []);

  const addRelationship = useCallback((rel: PersistedRelationship) => {
    setRelationshipsState((prev) => [...prev, rel]);
  }, []);

  const removeRelationship = useCallback((id: string) => {
    setRelationshipsState((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const addFileToProject = useCallback((file: ProjectFile) => {
    setActiveProjectState((prev) =>
      prev ? { ...prev, files: [...prev.files, file] } : prev,
    );
  }, []);

  const removeFileFromProject = useCallback((fileId: string) => {
    setActiveProjectState((prev) =>
      prev
        ? { ...prev, files: prev.files.filter((f) => f.id !== fileId) }
        : prev,
    );
  }, []);

  const updateFileDisplayName = useCallback(
    (fileId: string, displayName: string | null) => {
      setActiveProjectState((prev) =>
        prev
          ? {
              ...prev,
              files: prev.files.map((f) =>
                f.id === fileId ? { ...f, displayName } : f,
              ),
            }
          : prev,
      );
    },
    [],
  );

  const clearActiveProject = useCallback(() => {
    setActiveProjectState(null);
    setRelationshipsState([]);
  }, []);

  return (
    <ProjectContext.Provider
      value={{
        activeProject,
        relationships,
        setActiveProject,
        setRelationships,
        addRelationship,
        removeRelationship,
        addFileToProject,
        removeFileFromProject,
        updateFileDisplayName,
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
