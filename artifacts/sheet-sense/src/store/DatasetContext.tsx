/**
 * DatasetContext — global store for all uploaded datasets.
 *
 * Actions:
 *   addDataset       — registers a new ParsedFile, returns its id
 *   removeDataset    — removes a dataset and updates active selection
 *   renameDataset    — sets a user-facing display name (file.fileName preserved)
 *   reorderDatasets  — moves a dataset before or after another by id
 *   setActiveId      — switches the active view
 *   clearDatasets    — resets to an empty workspace (used on logo/home navigation)
 */

import {
  createContext,
  useContext,
  useCallback,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Dataset, ParsedFile } from "@/types";

// ─── Context shape ────────────────────────────────────────────────────────────

interface DatasetContextValue {
  datasets: Dataset[];
  activeId: string | null;
  activeDataset: Dataset | null;

  /** Register a new parsed file. Returns the new dataset's id. */
  addDataset: (file: ParsedFile) => string;

  /** Remove a dataset by id. Automatically selects the next dataset if active. */
  removeDataset: (id: string) => void;

  /**
   * Set a user-facing display name for a dataset.
   * Passing an empty string removes the custom name (falls back to file.fileName).
   */
  renameDataset: (id: string, name: string) => void;

  /**
   * Move dataset `dragId` to be immediately before or after `targetId`.
   * The active selection is preserved.
   */
  reorderDatasets: (dragId: string, targetId: string, before: boolean) => void;

  /** Switch the active dataset view. */
  setActiveId: (id: string) => void;

  /** Reset the workspace — removes all datasets and clears the active selection. */
  clearDatasets: () => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const DatasetContext = createContext<DatasetContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function DatasetProvider({ children }: { children: ReactNode }) {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [activeId, setActiveIdState] = useState<string | null>(null);

  // Keep a ref so closures always see the current list without stale captures.
  const datasetsRef = useRef<Dataset[]>(datasets);
  datasetsRef.current = datasets;

  const addDataset = useCallback((file: ParsedFile): string => {
    const id = `ds_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const dataset: Dataset = { id, uploadedAt: Date.now(), file };
    setDatasets((prev) => [...prev, dataset]);
    setActiveIdState(id);
    return id;
  }, []);

  const removeDataset = useCallback((id: string) => {
    setDatasets((prev) => {
      const next = prev.filter((d) => d.id !== id);
      setActiveIdState((current) => {
        if (current !== id) return current;
        return next.at(-1)?.id ?? null;
      });
      return next;
    });
  }, []);

  const renameDataset = useCallback((id: string, name: string) => {
    setDatasets((prev) =>
      prev.map((d) =>
        d.id === id
          ? { ...d, displayName: name.trim() || undefined }
          : d,
      ),
    );
  }, []);

  const reorderDatasets = useCallback(
    (dragId: string, targetId: string, before: boolean) => {
      setDatasets((prev) => {
        const dragged = prev.find((d) => d.id === dragId);
        if (!dragged || dragId === targetId) return prev;
        const rest = prev.filter((d) => d.id !== dragId);
        const targetIdx = rest.findIndex((d) => d.id === targetId);
        if (targetIdx === -1) return prev;
        const insertIdx = before ? targetIdx : targetIdx + 1;
        const next = [...rest];
        next.splice(insertIdx, 0, dragged);
        return next;
      });
    },
    [],
  );

  const setActiveId = useCallback((id: string) => {
    setActiveIdState(id);
  }, []);

  const clearDatasets = useCallback(() => {
    setDatasets([]);
    setActiveIdState(null);
  }, []);

  const activeDataset = datasets.find((d) => d.id === activeId) ?? null;

  return (
    <DatasetContext.Provider
      value={{
        datasets,
        activeId,
        activeDataset,
        addDataset,
        removeDataset,
        renameDataset,
        reorderDatasets,
        setActiveId,
        clearDatasets,
      }}
    >
      {children}
    </DatasetContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useDatasets(): DatasetContextValue {
  const ctx = useContext(DatasetContext);
  if (!ctx)
    throw new Error("useDatasets must be called inside <DatasetProvider>");
  return ctx;
}
