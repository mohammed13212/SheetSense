/**
 * DatasetContext — global store for all uploaded datasets.
 *
 * Architecture notes for future maintainers:
 *
 * Datasets are intentionally kept independent. Each `Dataset` is a self-
 * contained record identified by a stable `id`. The store exposes:
 *
 *   addDataset       — registers a new ParsedFile, returns its id
 *   removeDataset    — removes a dataset and updates active selection
 *   setActiveId      — switches the active view
 *
 * To add inter-dataset relationship management in the future:
 *   1. Define `DatasetRelationship` in `src/types/relationships.ts`
 *   2. Add a `relationships` array to this context value
 *   3. Add `addRelationship(rel)` and `removeRelationship(id)` actions here
 *   4. The RelationshipPanel component will read from this same context
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

  /** Switch the active dataset view. */
  setActiveId: (id: string) => void;

  // ── Extension points for future relationship management ────────────────────
  // Uncomment and implement when DatasetRelationship is defined:
  //
  // relationships: DatasetRelationship[];
  // addRelationship(rel: DatasetRelationship): void;
  // removeRelationship(id: string): void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const DatasetContext = createContext<DatasetContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function DatasetProvider({ children }: { children: ReactNode }) {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [activeId, setActiveIdState] = useState<string | null>(null);

  // Keep a ref to datasets so removeDataset closure always sees current list
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
      // If we just removed the active dataset, activate the last remaining one
      setActiveIdState((current) => {
        if (current !== id) return current;
        return next.at(-1)?.id ?? null;
      });
      return next;
    });
  }, []);

  const setActiveId = useCallback((id: string) => {
    setActiveIdState(id);
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
        setActiveId,
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
