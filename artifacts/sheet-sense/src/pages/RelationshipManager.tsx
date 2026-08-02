import { useState, useMemo, useCallback, useEffect } from "react";
import {
  GitBranch,
  Database,
  Hash,
  Type,
  HelpCircle,
  ArrowLeftRight,
  Link2Off,
  Sparkles,
  ChevronDown,
  ChevronLeft,
  Plus,
  Pencil,
  Trash2,
  X,
  CheckCircle2,
  Check,
} from "lucide-react";
import { Link, useParams } from "wouter";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useLocale } from "@/i18n/context";
import { tpl } from "@/i18n/tpl";
import { useDatasets } from "@/store/DatasetContext";
import { useAuth } from "@/store/AuthContext";
import { useProject } from "@/store/ProjectContext";
import { AuthNav } from "@/components/AuthNav";
import { AppHeader } from "@/components/AppHeader";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { apiPost, apiDelete } from "@/lib/api";
import type { Dataset } from "@/types";

// ─── Domain types ─────────────────────────────────────────────────────────────

type ColType = "numeric" | "categorical" | "unknown";
type Confidence = "high" | "medium" | "low";
type ReasonCode =
  | "exactSameType"
  | "exactDiffType"
  | "partialSameType"
  | "partialDiffType"
  | "similarKeys";

interface ColumnInfo {
  index: number;
  name: string;
  type: ColType;
}

interface Suggestion {
  id: string;
  colA: ColumnInfo;
  colB: ColumnInfo;
  confidence: Confidence;
  reasonCode: ReasonCode;
}

interface Relationship {
  id: string;
  datasetAId: string;
  datasetBId: string;
  colA: ColumnInfo;
  colB: ColumnInfo;
  confidence?: Confidence;
}

interface EditorInit {
  existingId?: string;
  datasetAId?: string;
  colA?: ColumnInfo;
  datasetBId?: string;
  colB?: ColumnInfo;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function RelationshipManager() {
  const { t, dir } = useLocale();
  const { datasets } = useDatasets();
  const { user } = useAuth();
  const { activeProject, relationships: persistedRels, addRelationship, removeRelationship } = useProject();
  const params = useParams<{ projectId: string }>();
  const projectId = params.projectId ?? activeProject?.id ?? null;

  // Back link to the project workspace (if project context is available)
  const workspaceHref = projectId ? `/projects/${projectId}` : "/";

  const hasDatasets = datasets.length > 0;

  // ── Relationships state ────────────────────────────────────────────────────
  // Local relationships are a superset of persisted ones. When the project is
  // loaded, persisted relationships are mapped to the local format using
  // dataset.serverFileId as the bridge.
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [dismissedKeys, setDismissedKeys] = useState<Set<string>>(() => new Set());
  const [editorInit, setEditorInit] = useState<EditorInit | null>(null);
  const [selectedDiagramId, setSelectedDiagramId] = useState<string | null>(null);

  // Soft-delete: hidden IDs are removed from view immediately; permanent after undo expires
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // ── Load persisted relationships into local state on mount ─────────────────
  useEffect(() => {
    if (!persistedRels.length || !datasets.length) return;
    const mapped: Relationship[] = [];
    for (const pr of persistedRels) {
      const dsA = datasets.find(d => d.serverFileId === pr.sourceFileId);
      const dsB = datasets.find(d => d.serverFileId === pr.targetFileId);
      if (!dsA || !dsB) continue;

      // Resolve column info from the parsed file headers
      const colAIdx = dsA.file.headers.indexOf(pr.sourceColumn);
      const colBIdx = dsB.file.headers.indexOf(pr.targetColumn);

      mapped.push({
        id: pr.id,
        datasetAId: dsA.id,
        datasetBId: dsB.id,
        colA: {
          index: colAIdx >= 0 ? colAIdx : 0,
          name: pr.sourceColumn,
          type: "unknown",
        },
        colB: {
          index: colBIdx >= 0 ? colBIdx : 0,
          name: pr.targetColumn,
          type: "unknown",
        },
        confidence: pr.confidenceLevel as Confidence,
      });
    }
    if (mapped.length) setRelationships(mapped);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Editor helpers ────────────────────────────────────────────────────────
  const openCreate = useCallback(() => setEditorInit({}), []);

  const openEdit = useCallback((rel: Relationship) => {
    const dsA = datasets.find(d => d.id === rel.datasetAId);
    const dsB = datasets.find(d => d.id === rel.datasetBId);
    if (!dsA || !dsB) return;
    setEditorInit({
      existingId: rel.id,
      datasetAId: rel.datasetAId,
      colA: rel.colA,
      datasetBId: rel.datasetBId,
      colB: rel.colB,
    });
  }, [datasets]);

  const saveRelationship = useCallback(async (rel: Relationship) => {
    setRelationships(prev => {
      const idx = prev.findIndex(r => r.id === rel.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = rel;
        return next;
      }
      return [...prev, rel];
    });
    setEditorInit(null);

    // Persist to API if we have a project and both datasets have server IDs
    if (!projectId) return;
    const dsA = datasets.find(d => d.id === rel.datasetAId);
    const dsB = datasets.find(d => d.id === rel.datasetBId);
    if (!dsA?.serverFileId || !dsB?.serverFileId) return;

    try {
      const saved = await apiPost(
        `/api/projects/${projectId}/relationships`,
        {
          sourceFileId: dsA.serverFileId,
          sourceColumn: rel.colA.name,
          targetFileId: dsB.serverFileId,
          targetColumn: rel.colB.name,
          confidence: rel.confidence === "high" ? 90 : rel.confidence === "medium" ? 60 : 30,
          confidenceLevel: rel.confidence ?? "low",
          isAutoCreated: false,
        },
      );
      // Replace local UUID with server UUID for subsequent deletes
      if (saved && typeof saved === "object" && "id" in saved) {
        const serverId = (saved as { id: string }).id;
        setRelationships(prev =>
          prev.map(r => r.id === rel.id ? { ...r, id: serverId } : r),
        );
        addRelationship(saved as Parameters<typeof addRelationship>[0]);
      }
    } catch {
      toast.error(t.relationships.savingError);
    }
  }, [projectId, datasets, addRelationship, t.relationships.savingError]);

  // Opens the confirm dialog
  const requestDeleteRelationship = useCallback((id: string) => {
    setConfirmDeleteId(id);
  }, []);

  // Called after confirm — soft-delete + undo toast
  const handleDeleteConfirm = useCallback(() => {
    const id = confirmDeleteId;
    if (!id) return;
    setConfirmDeleteId(null);

    // Optimistically hide
    setHiddenIds(prev => new Set([...prev, id]));
    if (selectedDiagramId === id) setSelectedDiagramId(null);

    let undone = false;

    toast(t.relationships.deleted, {
      duration: 7000,
      action: {
        label: t.common.undo,
        onClick: () => {
          undone = true;
          setHiddenIds(prev => {
            const next = new Set(prev);
            next.delete(id);
            return next;
          });
        },
      },
      onDismiss: () => {
        if (!undone) {
          setRelationships(prev => prev.filter(r => r.id !== id));
          setHiddenIds(prev => { const next = new Set(prev); next.delete(id); return next; });
          // Delete from server
          if (projectId) {
            apiDelete(`/api/projects/${projectId}/relationships/${id}`)
              .catch(() => toast.error(t.relationships.deletingError));
            removeRelationship(id);
          }
        }
      },
      onAutoClose: () => {
        if (!undone) {
          setRelationships(prev => prev.filter(r => r.id !== id));
          setHiddenIds(prev => { const next = new Set(prev); next.delete(id); return next; });
          if (projectId) {
            apiDelete(`/api/projects/${projectId}/relationships/${id}`)
              .catch(() => toast.error(t.relationships.deletingError));
            removeRelationship(id);
          }
        }
      },
    });
  }, [confirmDeleteId, selectedDiagramId, projectId, removeRelationship, t.relationships.deletingError]);

  // ── Suggestion helpers ────────────────────────────────────────────────────
  const dismissKey = (dsAId: string, dsBId: string, suggestionId: string) =>
    `${dsAId}||${dsBId}||${suggestionId}`;

  const acceptSuggestion = useCallback(
    (s: Suggestion, dsA: Dataset, dsB: Dataset) => {
      const key = dismissKey(dsA.id, dsB.id, s.id);
      setDismissedKeys(prev => new Set([...prev, key]));
      setRelationships(prev => [
        ...prev,
        {
          id: crypto.randomUUID(),
          datasetAId: dsA.id,
          datasetBId: dsB.id,
          colA: s.colA,
          colB: s.colB,
          confidence: s.confidence,
        },
      ]);
    },
    [],
  );

  const editSuggestion = useCallback(
    (s: Suggestion, dsA: Dataset, dsB: Dataset) => {
      setEditorInit({
        datasetAId: dsA.id,
        colA: s.colA,
        datasetBId: dsB.id,
        colB: s.colB,
      });
    },
    [],
  );

  const ignoreSuggestion = useCallback(
    (s: Suggestion, dsA: Dataset, dsB: Dataset) => {
      const key = dismissKey(dsA.id, dsB.id, s.id);
      setDismissedKeys(prev => new Set([...prev, key]));
    },
    [],
  );

  const visibleRelationships = relationships.filter(r => !hiddenIds.has(r.id));

  return (
    <div
      dir={dir}
      className="flex flex-col h-[100dvh] bg-background text-foreground overflow-hidden"
    >
      {user ? <AuthNav /> : <AppHeader isInWorkspace={hasDatasets} />}

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-8 space-y-8">

          {/* ── Page header ── */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              {/* Back to Workspace */}
              <Link
                href={workspaceHref}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors shrink-0 mt-1"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>{t.nav.workspace}</span>
              </Link>
              <div className="p-2.5 rounded-xl bg-primary text-primary-foreground shadow-sm shrink-0 mt-0.5">
                <GitBranch className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  {t.relationships.pageTitle}
                </h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {t.relationships.pageSubtitle}
                </p>
              </div>
            </div>
            {hasDatasets && (
              <button
                onClick={openCreate}
                className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">{t.relationships.addRelationship}</span>
              </button>
            )}
          </div>

          {/* ── No datasets ── */}
          {!hasDatasets && (
            <div className="flex flex-col items-center justify-center gap-5 py-20 border-2 border-dashed border-border rounded-xl">
              <div className="p-4 rounded-full bg-muted">
                <Database className="w-8 h-8 text-muted-foreground" />
              </div>
              <div className="text-center max-w-sm">
                <p className="font-medium text-foreground mb-1">{t.relationships.noDatasets}</p>
                <p className="text-sm text-muted-foreground">{t.relationships.noDatasetsSub}</p>
              </div>
              <Link
                href={workspaceHref}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                {t.relationships.goToWorkspace}
              </Link>
            </div>
          )}

          {hasDatasets && (
            <>
              {/* ── Current Relationships ── */}
              <CurrentRelationshipsSection
                relationships={visibleRelationships}
                datasets={datasets}
                onEdit={openEdit}
                onDeleteRequest={requestDeleteRelationship}
              />

              {/* ── Relationship Diagram ── */}
              <DiagramSection
                relationships={visibleRelationships}
                datasets={datasets}
                selectedId={selectedDiagramId}
                onSelect={(id) => setSelectedDiagramId(prev => prev === id ? null : id)}
                onEdit={openEdit}
                onDelete={requestDeleteRelationship}
              />

              {/* ── Explore Suggestions ── */}
              <ExploreSuggestionsSection
                datasets={datasets}
                dismissedKeys={dismissedKeys}
                dismissKey={dismissKey}
                onAccept={acceptSuggestion}
                onEdit={editSuggestion}
                onIgnore={ignoreSuggestion}
              />
            </>
          )}
        </div>
      </main>

      {/* ── Editor modal ── */}
      {editorInit !== null && (
        <RelationshipEditorModal
          datasets={datasets}
          init={editorInit}
          onSave={saveRelationship}
          onClose={() => setEditorInit(null)}
        />
      )}

      {/* ── Confirm delete dialog ── */}
      <ConfirmDialog
        open={confirmDeleteId !== null}
        title={t.relationships.confirmDeleteTitle}
        description={t.common.undoDescription}
        confirmLabel={t.common.delete}
        cancelLabel={t.common.cancel}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </div>
  );
}

// ─── Current Relationships section ───────────────────────────────────────────

interface CurrentRelsSectionProps {
  relationships: Relationship[];
  datasets: Dataset[];
  onEdit: (rel: Relationship) => void;
  onDeleteRequest: (id: string) => void;
}

function CurrentRelationshipsSection({
  relationships,
  datasets,
  onEdit,
  onDeleteRequest,
}: CurrentRelsSectionProps) {
  const { t } = useLocale();

  return (
    <section className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
      <div className="px-5 py-4 border-b border-border flex items-center gap-3 bg-muted/20">
        <GitBranch className="w-4 h-4 text-primary shrink-0" />
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-semibold text-foreground">
            {t.relationships.currentRelationships.title}
          </h2>
          <p className="text-xs text-muted-foreground mt-px">
            {t.relationships.currentRelationships.subtitle}
          </p>
        </div>
        {relationships.length > 0 && (
          <span className="shrink-0 text-xs font-semibold bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full tabular-nums">
            {relationships.length}
          </span>
        )}
      </div>

      {relationships.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-10 text-muted-foreground">
          <Link2Off className="w-7 h-7 opacity-25" />
          <p className="text-sm font-medium">{t.relationships.currentRelationships.empty}</p>
          <p className="text-xs text-muted-foreground/70">{t.relationships.currentRelationships.emptySub}</p>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {relationships.map((rel) => {
            const dsA = datasets.find(d => d.id === rel.datasetAId);
            const dsB = datasets.find(d => d.id === rel.datasetBId);
            if (!dsA || !dsB) return null;
            return (
              <RelationshipRow
                key={rel.id}
                relationship={rel}
                dsA={dsA}
                dsB={dsB}
                onEdit={() => onEdit(rel)}
                onDeleteRequest={() => onDeleteRequest(rel.id)}
              />
            );
          })}
        </div>
      )}
    </section>
  );
}

interface RelationshipRowProps {
  relationship: Relationship;
  dsA: Dataset;
  dsB: Dataset;
  onEdit: () => void;
  onDeleteRequest: () => void;
}

function RelationshipRow({
  relationship,
  dsA,
  dsB,
  onEdit,
  onDeleteRequest,
}: RelationshipRowProps) {
  const { t } = useLocale();
  const { colA, colB, confidence } = relationship;

  return (
    <div className="px-5 py-3.5 flex flex-col sm:flex-row sm:items-center gap-3">
      {/* Confidence badge (if from suggestion) */}
      {confidence && (
        <div className="shrink-0">
          <ConfidenceBadge confidence={confidence} />
        </div>
      )}

      {/* Column match */}
      <div className="flex-1 min-w-0 flex items-center gap-2 flex-wrap">
        <ColChip fileName={dsA.file.fileName} col={colA} side="A" />
        <ArrowLeftRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        <ColChip fileName={dsB.file.fileName} col={colB} side="B" />
      </div>

      {/* Actions */}
      <div className="shrink-0 flex items-center gap-1.5">
        <IconButton onClick={onEdit} title={t.relationships.editRelationship}>
          <Pencil className="w-3.5 h-3.5" />
        </IconButton>
        <IconButton
          onClick={onDeleteRequest}
          title={t.relationships.deleteRelationship}
          danger
        >
          <Trash2 className="w-3.5 h-3.5" />
        </IconButton>
      </div>
    </div>
  );
}

// ─── Diagram section ──────────────────────────────────────────────────────────

interface DiagramSectionProps {
  relationships: Relationship[];
  datasets: Dataset[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onEdit: (rel: Relationship) => void;
  onDelete: (id: string) => void;
}

function DiagramSection({
  relationships,
  datasets,
  selectedId,
  onSelect,
  onEdit,
  onDelete,
}: DiagramSectionProps) {
  const { t } = useLocale();

  return (
    <section className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between gap-3 bg-muted/20">
        <div>
          <h2 className="text-sm font-semibold text-foreground">{t.relationships.diagram.title}</h2>
          <p className="text-xs text-muted-foreground mt-px">{t.relationships.diagram.subtitle}</p>
        </div>
        {relationships.length > 0 && (
          <span className="text-[10px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full shrink-0">
            {t.relationships.diagram.clickHint}
          </span>
        )}
      </div>

      {relationships.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-12">
          <div className="flex items-center gap-3 opacity-20">
            <div className="w-16 h-10 rounded-lg border-2 border-blue-400 bg-blue-50" />
            <div className="w-8 border-t-2 border-dashed border-muted-foreground" />
            <div className="w-5 h-5 rounded-full border-2 border-muted-foreground flex items-center justify-center">
              <ArrowLeftRight className="w-2.5 h-2.5 text-muted-foreground" />
            </div>
            <div className="w-8 border-t-2 border-dashed border-muted-foreground" />
            <div className="w-16 h-10 rounded-lg border-2 border-violet-400 bg-violet-50" />
          </div>
          <p className="text-sm font-medium text-muted-foreground mt-1">{t.relationships.diagram.empty}</p>
          <p className="text-xs text-muted-foreground/60">{t.relationships.diagram.emptySub}</p>
        </div>
      ) : (
        <div className="p-6 flex flex-col gap-3">
          {relationships.map((rel) => {
            const dsA = datasets.find(d => d.id === rel.datasetAId);
            const dsB = datasets.find(d => d.id === rel.datasetBId);
            if (!dsA || !dsB) return null;
            const isSelected = selectedId === rel.id;

            return (
              <DiagramCard
                key={rel.id}
                relationship={rel}
                dsA={dsA}
                dsB={dsB}
                isSelected={isSelected}
                onSelect={() => onSelect(rel.id)}
                onEdit={() => { onEdit(rel); }}
                onDelete={() => onDelete(rel.id)}
              />
            );
          })}
        </div>
      )}
    </section>
  );
}

interface DiagramCardProps {
  relationship: Relationship;
  dsA: Dataset;
  dsB: Dataset;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function DiagramCard({
  relationship,
  dsA,
  dsB,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
}: DiagramCardProps) {
  const { t } = useLocale();
  const { colA, colB } = relationship;

  return (
    <button
      onClick={onSelect}
      className={cn(
        "w-full text-start rounded-xl border-2 overflow-hidden transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        isSelected
          ? "border-primary shadow-md shadow-primary/10"
          : "border-border hover:border-primary/30 hover:shadow-sm",
      )}
    >
      {/* Visual connection */}
      <div className="flex items-stretch">
        {/* Node A */}
        <div className="flex-1 min-w-0">
          <div className="px-3 py-1.5 bg-blue-500 flex items-center gap-1.5">
            <Database className="w-3 h-3 text-white/70 shrink-0" />
            <span className="text-[10px] text-white font-bold uppercase tracking-wider truncate">
              {baseName(dsA.file.fileName)}
            </span>
          </div>
          <div className="px-3 py-2 bg-blue-50 dark:bg-blue-950/30 flex items-center gap-1.5">
            <ColTypeIcon type={colA.type} className="text-blue-500 shrink-0" />
            <span className="text-xs font-semibold text-blue-800 dark:text-blue-300 truncate">
              {colA.name}
            </span>
          </div>
        </div>

        {/* Connector */}
        <div
          className={cn(
            "shrink-0 flex flex-col items-center justify-center px-3 gap-1 border-x border-border transition-colors duration-150",
            isSelected ? "bg-primary/5 border-primary/20" : "bg-muted/30",
          )}
        >
          <ArrowLeftRight
            className={cn(
              "w-4 h-4 transition-colors duration-150",
              isSelected ? "text-primary" : "text-muted-foreground/50",
            )}
          />
          {isSelected && (
            <span className="text-[9px] font-semibold text-primary uppercase tracking-wider">
              {t.relationships.joinLabel}
            </span>
          )}
        </div>

        {/* Node B */}
        <div className="flex-1 min-w-0">
          <div className="px-3 py-1.5 bg-violet-500 flex items-center gap-1.5">
            <Database className="w-3 h-3 text-white/70 shrink-0" />
            <span className="text-[10px] text-white font-bold uppercase tracking-wider truncate">
              {baseName(dsB.file.fileName)}
            </span>
          </div>
          <div className="px-3 py-2 bg-violet-50 dark:bg-violet-950/30 flex items-center gap-1.5">
            <ColTypeIcon type={colB.type} className="text-violet-500 shrink-0" />
            <span className="text-xs font-semibold text-violet-800 dark:text-violet-300 truncate">
              {colB.name}
            </span>
          </div>
        </div>
      </div>

      {/* Action bar — only when selected */}
      {isSelected && (
        <div
          className="flex items-center justify-end gap-2 px-4 py-2.5 bg-primary/5 border-t border-primary/15"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onEdit}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-border bg-card hover:bg-muted text-foreground transition-colors"
          >
            <Pencil className="w-3 h-3" />
            {t.relationships.editRelationship}
          </button>
          <button
            onClick={onDelete}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-600 text-white hover:bg-red-700 transition-colors"
          >
            <Trash2 className="w-3 h-3" />
            {t.relationships.deleteRelationship}
          </button>
        </div>
      )}
    </button>
  );
}

// ─── Explore Suggestions section ──────────────────────────────────────────────

interface ExploreSuggestionsSectionProps {
  datasets: Dataset[];
  dismissedKeys: Set<string>;
  dismissKey: (dsAId: string, dsBId: string, suggestionId: string) => string;
  onAccept: (s: Suggestion, dsA: Dataset, dsB: Dataset) => void;
  onEdit: (s: Suggestion, dsA: Dataset, dsB: Dataset) => void;
  onIgnore: (s: Suggestion, dsA: Dataset, dsB: Dataset) => void;
}

function ExploreSuggestionsSection({
  datasets,
  dismissedKeys,
  dismissKey,
  onAccept,
  onEdit,
  onIgnore,
}: ExploreSuggestionsSectionProps) {
  const { t } = useLocale();
  const [selectedIdA, setSelectedIdA] = useState<string>("");
  const [selectedIdB, setSelectedIdB] = useState<string>("");

  const dsA = datasets.find(d => d.id === selectedIdA) ?? null;
  const dsB = datasets.find(d => d.id === selectedIdB) ?? null;

  const colsA = useMemo(() => dsA ? getColumns(dsA) : [], [dsA]);
  const colsB = useMemo(() => dsB ? getColumns(dsB) : [], [dsB]);

  const suggestions = useMemo(() => {
    if (!dsA || !dsB) return [];
    return computeSuggestions(colsA, colsB);
  }, [colsA, colsB, dsA, dsB]);

  const visibleSuggestions = useMemo(() => {
    if (!dsA || !dsB) return suggestions;
    return suggestions.filter(
      (s) => !dismissedKeys.has(dismissKey(dsA.id, dsB.id, s.id)),
    );
  }, [suggestions, dismissedKeys, dsA, dsB, dismissKey]);

  const bothSelected = !!dsA && !!dsB;

  return (
    <section className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border flex items-center gap-3 bg-muted/20">
        <Sparkles className="w-4 h-4 text-primary shrink-0" />
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-semibold text-foreground">
            {t.relationships.suggestions.title}
          </h2>
          <p className="text-xs text-muted-foreground mt-px">
            {t.relationships.suggestions.subtitle}
          </p>
        </div>
        {bothSelected && visibleSuggestions.length > 0 && (
          <span className="shrink-0 text-xs font-semibold bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full tabular-nums">
            {tpl(t.relationships.suggestions.countLabel, { n: visibleSuggestions.length })}
          </span>
        )}
      </div>

      {/* Dataset pair selector */}
      <div className="px-5 py-4 border-b border-border bg-muted/10">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <DatasetSelect
            label={t.relationships.datasetA}
            sideKey="A"
            datasets={datasets}
            value={selectedIdA}
            excludeId={selectedIdB}
            onChange={(id) => { setSelectedIdA(id); }}
          />
          <DatasetSelect
            label={t.relationships.datasetB}
            sideKey="B"
            datasets={datasets}
            value={selectedIdB}
            excludeId={selectedIdA}
            onChange={(id) => { setSelectedIdB(id); }}
          />
        </div>
      </div>

      {/* Suggestions list */}
      <div className="divide-y divide-border">
        {!bothSelected && (
          <EmptyState
            icon={<GitBranch className="w-7 h-7 opacity-25" />}
            message={t.relationships.suggestions.noneSelected}
          />
        )}
        {bothSelected && visibleSuggestions.length === 0 && (
          <EmptyState
            icon={<Link2Off className="w-7 h-7 opacity-25" />}
            message={
              suggestions.length > 0
                ? t.relationships.suggestions.allDismissed
                : t.relationships.suggestions.empty
            }
          />
        )}
        {bothSelected &&
          visibleSuggestions.map((s) => (
            <SuggestionRow
              key={s.id}
              suggestion={s}
              dsA={dsA!}
              dsB={dsB!}
              onAccept={() => onAccept(s, dsA!, dsB!)}
              onEdit={() => onEdit(s, dsA!, dsB!)}
              onIgnore={() => onIgnore(s, dsA!, dsB!)}
            />
          ))}
      </div>
    </section>
  );
}

interface DatasetSelectProps {
  label: string;
  sideKey: "A" | "B";
  datasets: Dataset[];
  value: string;
  excludeId: string;
  onChange: (id: string) => void;
}

function DatasetSelect({ label, sideKey, datasets, value, excludeId, onChange }: DatasetSelectProps) {
  const { t } = useLocale();
  const available = datasets.filter(d => d.id !== excludeId);
  const accentBg = sideKey === "A" ? "bg-blue-500" : "bg-violet-500";

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <div className={cn("w-5 h-5 rounded flex items-center justify-center text-white text-[10px] font-bold shrink-0", accentBg)}>
          {sideKey}
        </div>
        <span className="text-xs font-semibold text-muted-foreground">{label}</span>
      </div>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => e.target.value && onChange(e.target.value)}
          className="w-full appearance-none bg-card border border-border rounded-lg ps-3 pe-8 py-2 text-sm font-medium text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
        >
          <option value="" disabled>{t.relationships.selectDataset}</option>
          {available.map(d => (
            <option key={d.id} value={d.id}>{d.file.fileName}</option>
          ))}
        </select>
        <ChevronDown className="absolute end-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
      </div>
    </div>
  );
}

interface SuggestionRowProps {
  suggestion: Suggestion;
  dsA: Dataset;
  dsB: Dataset;
  onAccept: () => void;
  onEdit: () => void;
  onIgnore: () => void;
}

function SuggestionRow({ suggestion, dsA, dsB, onAccept, onEdit, onIgnore }: SuggestionRowProps) {
  const { t } = useLocale();
  const { colA, colB, confidence, reasonCode } = suggestion;
  const reasonStr = buildReasonString(reasonCode, colA.type, colB.type, t);

  return (
    <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-4">
      {/* Confidence */}
      <div className="shrink-0">
        <ConfidenceBadge confidence={confidence} />
      </div>

      {/* Match display */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <ColChip fileName={dsA.file.fileName} col={colA} side="A" />
          <ArrowLeftRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          <ColChip fileName={dsB.file.fileName} col={colB} side="B" />
        </div>
        <p className="text-xs text-muted-foreground mt-1.5">{reasonStr}</p>
      </div>

      {/* Actions */}
      <div className="shrink-0 flex items-center gap-1.5 flex-wrap">
        <button
          onClick={onAccept}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors"
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          {t.relationships.suggestions.accept}
        </button>
        <button
          onClick={onEdit}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card text-xs font-semibold text-foreground hover:bg-muted transition-colors"
        >
          <Pencil className="w-3.5 h-3.5" />
          {t.relationships.suggestions.edit}
        </button>
        <button
          onClick={onIgnore}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <X className="w-3.5 h-3.5" />
          {t.relationships.suggestions.ignore}
        </button>
      </div>
    </div>
  );
}

// ─── Relationship editor modal ─────────────────────────────────────────────────

interface RelationshipEditorModalProps {
  datasets: Dataset[];
  init: EditorInit;
  onSave: (rel: Relationship) => void;
  onClose: () => void;
}

function RelationshipEditorModal({ datasets, init, onSave, onClose }: RelationshipEditorModalProps) {
  const { t } = useLocale();
  const isEditing = !!init.existingId;

  const [dsAId, setDsAId] = useState(init.datasetAId ?? "");
  const [colA, setColA] = useState<ColumnInfo | null>(init.colA ?? null);
  const [dsBId, setDsBId] = useState(init.datasetBId ?? "");
  const [colB, setColB] = useState<ColumnInfo | null>(init.colB ?? null);

  const dsA = datasets.find(d => d.id === dsAId) ?? null;
  const dsB = datasets.find(d => d.id === dsBId) ?? null;
  const colsA = useMemo(() => dsA ? getColumns(dsA) : [], [dsA]);
  const colsB = useMemo(() => dsB ? getColumns(dsB) : [], [dsB]);

  const canSave = !!dsA && !!dsB && dsAId !== dsBId && !!colA && !!colB;

  const handleSave = () => {
    if (!canSave) return;
    onSave({
      id: init.existingId ?? crypto.randomUUID(),
      datasetAId: dsAId,
      datasetBId: dsBId,
      colA: colA!,
      colB: colB!,
    });
  };

  const handleChangeDsA = (id: string) => {
    setDsAId(id);
    setColA(null);
  };
  const handleChangeDsB = (id: string) => {
    setDsBId(id);
    setColB(null);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <GitBranch className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">
              {isEditing ? t.relationships.editor.titleEdit : t.relationships.editor.titleCreate}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Side A */}
          <EditorSide
            sideKey="A"
            sideLabel={t.relationships.editor.datasetA}
            colLabel={t.relationships.editor.columnA}
            datasets={datasets.filter(d => d.id !== dsBId)}
            dsValue={dsAId}
            colValue={colA?.index ?? ""}
            cols={colsA}
            onChangeDs={handleChangeDsA}
            onChangeCol={(idx) => setColA(colsA.find(c => c.index === idx) ?? null)}
            selectDatasetLabel={t.relationships.editor.selectDataset}
            selectColLabel={t.relationships.editor.selectColumn}
          />

          {/* Arrow divider */}
          <div className="flex items-center gap-3 py-1">
            <div className="flex-1 h-px bg-border" />
            <ArrowLeftRight className="w-4 h-4 text-muted-foreground shrink-0" />
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Side B */}
          <EditorSide
            sideKey="B"
            sideLabel={t.relationships.editor.datasetB}
            colLabel={t.relationships.editor.columnB}
            datasets={datasets.filter(d => d.id !== dsAId)}
            dsValue={dsBId}
            colValue={colB?.index ?? ""}
            cols={colsB}
            onChangeDs={handleChangeDsB}
            onChangeCol={(idx) => setColB(colsB.find(c => c.index === idx) ?? null)}
            selectDatasetLabel={t.relationships.editor.selectDataset}
            selectColLabel={t.relationships.editor.selectColumn}
          />
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-border flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
          >
            {t.relationships.editor.cancel}
          </button>
          <button
            onClick={handleSave}
            disabled={!canSave}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {t.relationships.editor.save}
          </button>
        </div>
      </div>
    </div>
  );
}

interface EditorSideProps {
  sideKey: "A" | "B";
  sideLabel: string;
  colLabel: string;
  datasets: Dataset[];
  dsValue: string;
  colValue: number | "";
  cols: ColumnInfo[];
  onChangeDs: (id: string) => void;
  onChangeCol: (idx: number) => void;
  selectDatasetLabel: string;
  selectColLabel: string;
}

function EditorSide({
  sideKey,
  sideLabel,
  colLabel,
  datasets,
  dsValue,
  colValue,
  cols,
  onChangeDs,
  onChangeCol,
  selectDatasetLabel,
  selectColLabel,
}: EditorSideProps) {
  const isA = sideKey === "A";
  const borderCls = isA ? "border-blue-200 dark:border-blue-900" : "border-violet-200 dark:border-violet-900";
  const bgCls = isA ? "bg-blue-50/50 dark:bg-blue-950/20" : "bg-violet-50/50 dark:bg-violet-950/20";
  const badgeBg = isA ? "bg-blue-500" : "bg-violet-500";
  const headingCls = isA ? "text-blue-700 dark:text-blue-400" : "text-violet-700 dark:text-violet-400";

  return (
    <div className={cn("p-4 rounded-xl border space-y-3", borderCls, bgCls)}>
      <div className="flex items-center gap-2">
        <div className={cn("w-5 h-5 rounded flex items-center justify-center text-white text-[10px] font-bold shrink-0", badgeBg)}>
          {sideKey}
        </div>
        <span className={cn("text-xs font-semibold", headingCls)}>{sideLabel}</span>
      </div>

      {/* Dataset select */}
      <div className="space-y-1">
        <div className="relative">
          <select
            value={dsValue}
            onChange={(e) => e.target.value && onChangeDs(e.target.value)}
            className="w-full appearance-none bg-card border border-border rounded-lg ps-3 pe-8 py-2 text-sm font-medium text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
          >
            <option value="" disabled>{selectDatasetLabel}</option>
            {datasets.map(d => (
              <option key={d.id} value={d.id}>{d.file.fileName}</option>
            ))}
          </select>
          <ChevronDown className="absolute end-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        </div>
      </div>

      {/* Column select */}
      <div className="space-y-1">
        <label className="text-[11px] font-medium text-muted-foreground">{colLabel}</label>
        <div className="relative">
          <select
            value={colValue}
            onChange={(e) => onChangeCol(Number(e.target.value))}
            disabled={cols.length === 0}
            className="w-full appearance-none bg-card border border-border rounded-lg ps-3 pe-8 py-2 text-sm font-medium text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="" disabled>{selectColLabel}</option>
            {cols.map(c => (
              <option key={c.index} value={c.index}>{c.name}</option>
            ))}
          </select>
          <ChevronDown className="absolute end-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        </div>
      </div>
    </div>
  );
}

// ─── Small reusable atoms ─────────────────────────────────────────────────────

function ColChip({
  fileName,
  col,
  side,
}: {
  fileName: string;
  col: ColumnInfo;
  side: "A" | "B";
}) {
  const isA = side === "A";
  return (
    <div
      className={cn(
        "flex items-center gap-1.5 rounded-lg px-2.5 py-1 border",
        isA
          ? "bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-900"
          : "bg-violet-50 border-violet-200 dark:bg-violet-950/30 dark:border-violet-900",
      )}
    >
      <ColTypeIcon
        type={col.type}
        className={isA ? "text-blue-500" : "text-violet-500"}
      />
      <div className="min-w-0">
        <p
          className={cn(
            "text-[10px] font-medium leading-none mb-0.5 truncate max-w-[110px]",
            isA ? "text-blue-500" : "text-violet-500",
          )}
        >
          {baseName(fileName)}
        </p>
        <p
          className={cn(
            "text-xs font-semibold truncate max-w-[110px]",
            isA ? "text-blue-800 dark:text-blue-300" : "text-violet-800 dark:text-violet-300",
          )}
        >
          {col.name}
        </p>
      </div>
    </div>
  );
}

function IconButton({
  onClick,
  title,
  danger = false,
  children,
}: {
  onClick: () => void;
  title: string;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={cn(
        "p-1.5 rounded-lg border border-border transition-colors",
        danger
          ? "text-muted-foreground hover:text-red-600 hover:border-red-300 hover:bg-red-50 dark:hover:bg-red-950/30"
          : "text-muted-foreground hover:text-foreground hover:bg-muted",
      )}
    >
      {children}
    </button>
  );
}

function ConfidenceBadge({ confidence }: { confidence: Confidence }) {
  const { t } = useLocale();
  const styles: Record<Confidence, string> = {
    high: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900",
    medium: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900",
    low: "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/30 dark:text-sky-400 dark:border-sky-900",
  };
  const dots: Record<Confidence, string> = {
    high: "bg-emerald-500",
    medium: "bg-amber-500",
    low: "bg-sky-500",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold",
        styles[confidence],
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", dots[confidence])} />
      {t.relationships.suggestions.confidence[confidence]}
    </span>
  );
}

function ColTypeIcon({ type, className }: { type: ColType; className?: string }) {
  const base = cn("w-3.5 h-3.5 shrink-0", className);
  if (type === "numeric") return <Hash className={cn(base, !className && "text-blue-500")} />;
  if (type === "categorical") return <Type className={cn(base, !className && "text-violet-500")} />;
  return <HelpCircle className={cn(base, "text-muted-foreground opacity-40")} />;
}

function EmptyState({ icon, message }: { icon: React.ReactNode; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-muted-foreground">
      {icon}
      <p className="text-sm text-center max-w-xs px-4">{message}</p>
    </div>
  );
}

// ─── Pure helpers ─────────────────────────────────────────────────────────────

function getColumns(dataset: Dataset): ColumnInfo[] {
  const numericSet = new Set(dataset.file.chartData?.numeric.map((s) => s.colIndex) ?? []);
  const categoricalSet = new Set(dataset.file.chartData?.categorical.map((s) => s.colIndex) ?? []);
  return dataset.file.headers.map((name, index) => ({
    index,
    name,
    type: numericSet.has(index) ? "numeric" : categoricalSet.has(index) ? "categorical" : "unknown",
  }));
}

function computeSuggestions(colsA: ColumnInfo[], colsB: ColumnInfo[]): Suggestion[] {
  const results: Suggestion[] = [];
  for (const a of colsA) {
    for (const b of colsB) {
      const match = scorePair(a, b);
      if (match) results.push({ id: `${a.index}:${b.index}`, colA: a, colB: b, ...match });
    }
  }
  const ORDER: Record<Confidence, number> = { high: 0, medium: 1, low: 2 };
  results.sort((a, b) => ORDER[a.confidence] - ORDER[b.confidence] || a.colA.name.localeCompare(b.colA.name));
  return results.slice(0, 20);
}

const KEY_SUFFIX = /(id|key|code|num|number|ref|no|pk|fk)$/i;
const NORM_RE = /[\s_\-\.]/g;

function norm(s: string): string {
  return s.toLowerCase().replace(NORM_RE, "");
}

function scorePair(a: ColumnInfo, b: ColumnInfo): { confidence: Confidence; reasonCode: ReasonCode } | null {
  const na = norm(a.name);
  const nb = norm(b.name);
  const sameType = a.type !== "unknown" && b.type !== "unknown" && a.type === b.type;

  if (na === nb)
    return { confidence: sameType ? "high" : "medium", reasonCode: sameType ? "exactSameType" : "exactDiffType" };
  if (na.includes(nb) || nb.includes(na))
    return { confidence: sameType ? "medium" : "low", reasonCode: sameType ? "partialSameType" : "partialDiffType" };
  if (KEY_SUFFIX.test(a.name) && KEY_SUFFIX.test(b.name)) {
    const baseA = na.replace(KEY_SUFFIX, "");
    const baseB = nb.replace(KEY_SUFFIX, "");
    if (baseA === baseB || baseA.includes(baseB) || baseB.includes(baseA))
      return { confidence: "low", reasonCode: "similarKeys" };
  }
  return null;
}

function buildReasonString(
  code: ReasonCode,
  typeA: ColType,
  typeB: ColType,
  t: ReturnType<typeof useLocale>["t"],
): string {
  const typeLabel = (type: ColType) =>
    type === "numeric" ? t.relationships.typeNumeric
    : type === "categorical" ? t.relationships.typeCategorical
    : t.relationships.typeUnknown;
  const tA = typeLabel(typeA);
  const tB = typeLabel(typeB);
  return tpl(t.relationships.suggestions.reasons[code], { type: tA, typeA: tA, typeB: tB });
}

function baseName(fileName: string): string {
  return fileName.replace(/\.(xlsx|xls|csv)$/i, "");
}
