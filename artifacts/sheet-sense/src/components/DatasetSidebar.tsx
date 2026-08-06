import { useRef, useState, useCallback, useEffect } from "react";
import {
  Plus, X, Loader2, FileSpreadsheet, AlertCircle,
  PanelLeftClose, Pencil, GripVertical, MoreVertical, Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useLocale } from "@/i18n/context";
import { tpl } from "@/i18n/tpl";
import { useDatasets } from "@/store/DatasetContext";
import { useAuth } from "@/store/AuthContext";
import { useProject } from "@/store/ProjectContext";
import { parseFile, FileParseError } from "@/lib/parseFile";
import { apiPost, apiPatch, apiDelete } from "@/lib/api";
import { uploadToStorage } from "@/lib/projectLoader";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import type { Dataset, ParsedFile } from "@/types";
import type { ActiveProject, ProjectFile } from "@/store/ProjectContext";
import type { User } from "@supabase/supabase-js";

// ─── Props ────────────────────────────────────────────────────────────────────

interface DatasetSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function DatasetSidebar({ isOpen, onClose }: DatasetSidebarProps) {
  const { t, dir } = useLocale();
  const {
    datasets, activeId, setActiveId,
    removeDataset, addDataset, renameDataset, reorderDatasets,
  } = useDatasets();
  const { user } = useAuth();
  const {
    activeProject,
    setActiveProject,
    addFileToProject,
    removeFileFromProject,
    updateFileDisplayName,
  } = useProject();

  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  // IDs that are soft-deleted (hidden, pending permanent removal on toast expire)
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());
  // Confirm dialog
  const [confirmDataset, setConfirmDataset] = useState<Dataset | null>(null);

  // ── Drag-to-reorder state ──────────────────────────────────────────────────
  const [dragId, setDragId]         = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);
  const [dropBefore, setDropBefore] = useState(true);

  // ── File upload ───────────────────────────────────────────────────────────
  const handleFiles = useCallback(
    async (files: File[]) => {
      if (files.length === 0) return;
      setIsUploading(true);
      setUploadError(null);
      await new Promise((r) => setTimeout(r, 50));
      try {
        for (const file of files) {
          const pf = await parseFile(file);
          if (user) {
            // With auth: persist to storage + API, then add with serverFileId
            const serverFileId = await persistFileSidebar(
              pf,
              file,
              user,
              activeProject,
              setActiveProject,
              addFileToProject,
            );
            addDataset(pf, { serverFileId: serverFileId ?? undefined });
          } else {
            // Without auth: add locally only
            addDataset(pf);
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
          setUploadError(map[err.code] ?? t.errors.parseError);
        } else {
          setUploadError(t.errors.parseError);
        }
      } finally {
        setIsUploading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [addDataset, t, user, activeProject?.id, setActiveProject, addFileToProject],
  );

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    handleFiles(files);
  };

  const onDropzoneDragOver  = (e: React.DragEvent) => { e.preventDefault(); setIsDraggingOver(true); };
  const onDropzoneDragLeave = () => setIsDraggingOver(false);
  const onDropzoneDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    handleFiles(Array.from(e.dataTransfer.files));
  };

  // ── Drag-to-reorder handlers ──────────────────────────────────────────────

  const onCardDragStart = useCallback((e: React.DragEvent, id: string) => {
    setDragId(id);
    e.dataTransfer.setData("text/plain", id);
    e.dataTransfer.effectAllowed = "move";
  }, []);

  const onCardDragOver = useCallback(
    (e: React.DragEvent, id: string) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      if (id === dragId) return;
      setDropTargetId(id);
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      setDropBefore(e.clientY < rect.top + rect.height / 2);
    },
    [dragId],
  );

  const onCardDragLeave = useCallback(() => { setDropTargetId(null); }, []);

  const onCardDrop = useCallback(
    (e: React.DragEvent, targetId: string) => {
      e.preventDefault();
      if (dragId && dragId !== targetId) {
        reorderDatasets(dragId, targetId, dropBefore);
      }
      setDragId(null);
      setDropTargetId(null);
    },
    [dragId, dropBefore, reorderDatasets],
  );

  const onCardDragEnd = useCallback(() => {
    setDragId(null);
    setDropTargetId(null);
  }, []);

  // ── Delete with undo ──────────────────────────────────────────────────────

  function handleDeleteRequest(dataset: Dataset) {
    setConfirmDataset(dataset);
  }

  function handleDeleteConfirm() {
    const dataset = confirmDataset;
    if (!dataset) return;
    setConfirmDataset(null);

    const displayName = dataset.displayName ?? dataset.file.fileName;

    // Optimistically hide
    setHiddenIds((prev) => new Set([...prev, dataset.id]));

    let undone = false;

    const commitDelete = () => {
      if (undone) return;
      removeDataset(dataset.id);
      setHiddenIds((prev) => {
        const next = new Set(prev);
        next.delete(dataset.id);
        return next;
      });
      // Sync to server: delete DB record + GCS object
      if (dataset.serverFileId && activeProject) {
        apiDelete(
          `/api/projects/${activeProject.id}/files/${dataset.serverFileId}`,
        )
          .then(() => removeFileFromProject(dataset.serverFileId!))
          .catch(() => toast.error(t.datasets.deleteError));
      }
    };

    toast(tpl(t.datasets.deleted, { name: displayName }), {
      duration: 7000,
      action: {
        label: t.common.undo,
        onClick: () => {
          undone = true;
          setHiddenIds((prev) => {
            const next = new Set(prev);
            next.delete(dataset.id);
            return next;
          });
        },
      },
      onDismiss: commitDelete,
      onAutoClose: commitDelete,
    });
  }

  const visibleDatasets = datasets.filter((d) => !hiddenIds.has(d.id));

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={onClose}
          aria-hidden
        />
      )}

      <aside
        data-testid="dataset-sidebar"
        className={cn(
          "flex flex-col bg-card border-e border-border shrink-0",
          "w-[272px] h-[calc(100dvh-64px)]",
          "fixed top-[64px] z-40 transition-transform duration-200 ease-out",
          dir === "rtl" ? "right-0" : "left-0",
          isOpen
            ? "translate-x-0"
            : dir === "rtl"
              ? "translate-x-full"
              : "-translate-x-full",
          "lg:relative lg:top-0 lg:z-auto lg:translate-x-0 lg:block",
        )}
      >
        {/* ── Header ── */}
        <div className="h-14 px-4 flex items-center justify-between border-b border-border shrink-0">
          <span className="text-sm font-semibold text-foreground">
            {t.datasets.sidebarTitle}
          </span>
          <div className="flex items-center gap-1">
            <span className="text-xs text-muted-foreground tabular-nums bg-muted rounded-full px-2 py-0.5">
              {visibleDatasets.length}
            </span>
            <button
              onClick={onClose}
              aria-label={t.datasets.closeSidebar}
              className="lg:hidden ms-1 p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Add Dataset drop zone ── */}
        <div
          ref={dropRef}
          onDragOver={onDropzoneDragOver}
          onDragLeave={onDropzoneDragLeave}
          onDrop={onDropzoneDrop}
          className="p-3 border-b border-border shrink-0"
        >
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className={cn(
              "w-full flex items-center justify-center gap-2 rounded-lg border-2 border-dashed",
              "px-3 py-2.5 text-sm font-medium transition-all duration-150",
              isDraggingOver
                ? "border-primary bg-primary/8 text-primary"
                : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground hover:bg-muted/50",
              isUploading && "opacity-60 cursor-not-allowed",
            )}
          >
            {isUploading ? (
              <Loader2 className="w-4 h-4 animate-spin shrink-0" />
            ) : (
              <Plus className="w-4 h-4 shrink-0" />
            )}
            <span>
              {isUploading ? t.datasets.uploading : t.datasets.addDataset}
            </span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            multiple
            className="hidden"
            onChange={onFileInputChange}
          />
          {uploadError && (
            <p className="mt-2 text-xs text-destructive flex items-start gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-px" />
              {uploadError}
            </p>
          )}
        </div>

        {/* ── Dataset list ── */}
        <div className="flex-1 overflow-y-auto py-2 px-2 space-y-1.5">
          {visibleDatasets.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-8 px-4">
              {t.datasets.noDatasets}
            </p>
          )}
          {visibleDatasets.map((dataset) => (
            <DatasetCard
              key={dataset.id}
              dataset={dataset}
              isActive={dataset.id === activeId}
              isDragging={dataset.id === dragId}
              isDropTarget={dataset.id === dropTargetId}
              dropBefore={dropBefore}
              onSelect={() => { setActiveId(dataset.id); onClose(); }}
              onRemove={() => handleDeleteRequest(dataset)}
              onRename={(name) => {
                renameDataset(dataset.id, name);
                // Sync display name to server if this dataset is persisted
                if (dataset.serverFileId && activeProject) {
                  const newName = name.trim() || null;
                  apiPatch(
                    `/api/projects/${activeProject.id}/files/${dataset.serverFileId}`,
                    { displayName: newName },
                  )
                    .then(() =>
                      updateFileDisplayName(dataset.serverFileId!, newName),
                    )
                    .catch(() => toast.error(t.datasets.renameError));
                }
              }}
              onDragStart={(e) => onCardDragStart(e, dataset.id)}
              onDragOver={(e) => onCardDragOver(e, dataset.id)}
              onDragLeave={onCardDragLeave}
              onDrop={(e) => onCardDrop(e, dataset.id)}
              onDragEnd={onCardDragEnd}
            />
          ))}
        </div>
      </aside>

      {/* Confirm delete dialog */}
      <ConfirmDialog
        open={confirmDataset !== null}
        title={t.datasets.confirmDeleteTitle}
        description={t.common.undoDescription}
        confirmLabel={t.common.delete}
        cancelLabel={t.common.cancel}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirmDataset(null)}
      />
    </>
  );
}

// ─── Persist helper (sidebar uploads) ─────────────────────────────────────────

/**
 * Uploads a file to object storage + saves the file record to the API.
 * Returns the server-side UUID of the created file record, or null on error.
 * Storage upload is best-effort — analysis still works locally if it fails.
 */
async function persistFileSidebar(
  pf: ParsedFile,
  file: File,
  _user: User,
  activeProject: ActiveProject | null,
  setActiveProject: (p: ActiveProject) => void,
  addFileToProject: (f: ProjectFile) => void,
): Promise<string | null> {
  try {
    let project = activeProject;
    if (!project) {
      // Create an auto-named project from the file name
      const projectName = file.name.replace(/\.[^.]+$/, "");
      const created = await apiPost<ActiveProject>("/api/projects", {
        name: projectName,
      });
      project = { ...created, files: [] };
      setActiveProject(project);
    }

    // Upload to object storage (best-effort)
    let storageKey: string | null = null;
    try {
      storageKey = await uploadToStorage(file);
    } catch {
      // Storage failure is non-fatal — the file is still analysed locally
    }

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
        storageKey,
      },
    );
    addFileToProject(savedFile);
    return savedFile.id;
  } catch (err) {
    return null;
  }
}

// ─── Dataset card ─────────────────────────────────────────────────────────────

interface DatasetCardProps {
  dataset: Dataset;
  isActive: boolean;
  isDragging: boolean;
  isDropTarget: boolean;
  dropBefore: boolean;
  onSelect: () => void;
  onRemove: () => void;
  onRename: (name: string) => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
  onDragEnd: () => void;
}

function DatasetCard({
  dataset,
  isActive,
  isDragging,
  isDropTarget,
  dropBefore,
  onSelect,
  onRemove,
  onRename,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragEnd,
}: DatasetCardProps) {
  const { t } = useLocale();
  const { file } = dataset;
  const displayName = dataset.displayName ?? file.fileName;
  const score = file.dataQuality?.qualityScore ?? null;

  // ── Inline rename state ──────────────────────────────────────────────────
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(displayName);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isEditing) setEditValue(displayName);
  }, [displayName, isEditing]);

  const startEditing = useCallback(() => {
    setEditValue(displayName);
    setIsEditing(true);
    setMenuOpen(false);
  }, [displayName]);

  const commitRename = useCallback(() => {
    onRename(editValue.trim());
    setIsEditing(false);
  }, [editValue, onRename]);

  const cancelRename = useCallback(() => {
    setEditValue(displayName);
    setIsEditing(false);
  }, [displayName]);

  const onInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter")  { e.preventDefault(); commitRename(); }
    if (e.key === "Escape") { e.preventDefault(); cancelRename(); }
  };

  useEffect(() => {
    if (isEditing) {
      const input = inputRef.current;
      if (!input) return;
      input.focus();
      input.select();
    }
  }, [isEditing]);

  // ── Context menu state ────────────────────────────────────────────────────
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  return (
    <div
      draggable={!isEditing}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      className={cn(
        "group relative rounded-lg border px-3 py-2.5 cursor-pointer transition-all duration-150 select-none",
        isActive
          ? "border-primary bg-primary/5 shadow-sm"
          : "border-border hover:border-primary/30 hover:bg-muted/50",
        isDragging && "opacity-40",
        isDropTarget && dropBefore  && "border-t-2 border-t-primary",
        isDropTarget && !dropBefore && "border-b-2 border-b-primary",
      )}
      onClick={isEditing ? undefined : onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (!isEditing && e.key === "Enter") onSelect(); }}
      aria-current={isActive ? "page" : undefined}
    >
      {/* ── File name / rename input row ── */}
      <div className="flex items-start gap-1.5 pe-8">
        <div
          className="mt-0.5 shrink-0 cursor-grab active:cursor-grabbing text-muted-foreground/30 group-hover:text-muted-foreground/60 transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="w-3.5 h-3.5" />
        </div>

        <FileSpreadsheet
          className={cn(
            "w-4 h-4 mt-px shrink-0",
            isActive ? "text-primary" : "text-muted-foreground",
          )}
        />

        {isEditing ? (
          <input
            ref={inputRef}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={onInputKeyDown}
            onBlur={commitRename}
            onClick={(e) => e.stopPropagation()}
            placeholder={t.datasets.renameInputPlaceholder}
            className={cn(
              "flex-1 min-w-0 text-sm font-medium text-foreground bg-transparent",
              "border-b border-primary outline-none leading-snug pb-px",
              "placeholder:text-muted-foreground/50",
            )}
          />
        ) : (
          <span
            className="flex-1 min-w-0 text-sm font-medium text-foreground leading-snug break-all line-clamp-2 cursor-text"
            title={dataset.displayName ? `${dataset.displayName} (${file.fileName})` : file.fileName}
            onDoubleClick={(e) => { e.stopPropagation(); startEditing(); }}
          >
            {displayName}
          </span>
        )}
      </div>

      {/* ── Stats row ── */}
      <div className="mt-1.5 ps-9 flex items-center gap-2 flex-wrap">
        <span className="text-[11px] text-muted-foreground">
          {tpl(t.datasets.rows, { n: (file.rowCount - 1).toLocaleString() })}
        </span>
        <span className="text-[11px] text-muted-foreground">·</span>
        <span className="text-[11px] text-muted-foreground">
          {tpl(t.datasets.cols, { n: file.colCount.toLocaleString() })}
        </span>
        {score !== null && (
          <>
            <span className="text-[11px] text-muted-foreground">·</span>
            <span className={cn("text-[10px] font-semibold px-1.5 py-px rounded-full border", scoreStyle(score))}>
              {tpl(t.datasets.qualityScore, { n: score })}
            </span>
          </>
        )}
        {isActive && (
          <span className="text-[10px] font-semibold text-primary bg-primary/10 border border-primary/20 px-1.5 py-px rounded-full ms-auto">
            {t.datasets.activeLabel}
          </span>
        )}
      </div>

      {/* ── Quality bar ── */}
      {score !== null && (
        <div className="mt-2 ps-9 h-1 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{ width: `${score}%`, backgroundColor: scoreColor(score) }}
          />
        </div>
      )}

      {/* ── ⋮ context menu ── */}
      {!isEditing && (
        <div
          ref={menuRef}
          className="absolute top-1.5 end-1.5"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={t.datasets.datasetOptions}
            aria-expanded={menuOpen}
            className="p-1 rounded-md text-muted-foreground opacity-0 group-hover:opacity-100 hover:bg-muted hover:text-foreground transition-all duration-150"
          >
            <MoreVertical className="w-3.5 h-3.5" />
          </button>

          {menuOpen && (
            <div className="absolute end-0 top-full mt-1 w-36 rounded-lg border border-border bg-card shadow-lg z-50 py-1 overflow-hidden">
              <button
                onClick={() => startEditing()}
                className="w-full flex items-center gap-2.5 px-3 py-1.5 text-sm text-foreground hover:bg-muted transition-colors"
              >
                <Pencil className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                {t.datasets.menuRename}
              </button>
              <div className="my-1 border-t border-border/60" />
              <button
                onClick={() => { setMenuOpen(false); onRemove(); }}
                className="w-full flex items-center gap-2.5 px-3 py-1.5 text-sm text-destructive hover:bg-destructive/10 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5 shrink-0" />
                {t.datasets.menuDelete}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function scoreColor(score: number): string {
  if (score >= 80) return "#10b981";
  if (score >= 60) return "#f59e0b";
  return "#ef4444";
}

function scoreStyle(score: number): string {
  if (score >= 80) return "text-emerald-700 bg-emerald-50 border-emerald-200";
  if (score >= 60) return "text-amber-700 bg-amber-50 border-amber-200";
  return "text-red-700 bg-red-50 border-red-200";
}
