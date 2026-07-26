import { useState, useMemo } from "react";
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
  Check,
} from "lucide-react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { useLocale } from "@/i18n/context";
import { tpl } from "@/i18n/tpl";
import { useDatasets } from "@/store/DatasetContext";
import { AppHeader } from "@/components/AppHeader";
import type { Dataset } from "@/types";

// ─── Domain types (local to this page) ───────────────────────────────────────

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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function RelationshipManager() {
  const { t, dir } = useLocale();
  const { datasets } = useDatasets();

  const [selectedIdA, setSelectedIdA] = useState<string | null>(null);
  const [selectedIdB, setSelectedIdB] = useState<string | null>(null);
  const [selectedColIdxA, setSelectedColIdxA] = useState<number | null>(null);
  const [selectedColIdxB, setSelectedColIdxB] = useState<number | null>(null);

  const datasetA = datasets.find((d) => d.id === selectedIdA) ?? null;
  const datasetB = datasets.find((d) => d.id === selectedIdB) ?? null;

  const columnsA = useMemo(
    () => (datasetA ? getColumns(datasetA) : []),
    [datasetA],
  );
  const columnsB = useMemo(
    () => (datasetB ? getColumns(datasetB) : []),
    [datasetB],
  );

  const suggestions = useMemo(() => {
    if (!datasetA || !datasetB) return [];
    return computeSuggestions(columnsA, columnsB);
  }, [columnsA, columnsB, datasetA, datasetB]);

  const handleSelectA = (id: string) => {
    setSelectedIdA(id);
    setSelectedColIdxA(null);
  };
  const handleSelectB = (id: string) => {
    setSelectedIdB(id);
    setSelectedColIdxB(null);
  };

  const hasDatasets = datasets.length > 0;

  return (
    <div
      dir={dir}
      className="flex flex-col h-[100dvh] bg-background text-foreground overflow-hidden"
    >
      <AppHeader />

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 space-y-8">
          {/* ── Page header ── */}
          <div className="flex items-start gap-4">
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

          {/* ── No datasets state ── */}
          {!hasDatasets && (
            <div className="flex flex-col items-center justify-center gap-5 py-20 border-2 border-dashed border-border rounded-xl">
              <div className="p-4 rounded-full bg-muted">
                <Database className="w-8 h-8 text-muted-foreground" />
              </div>
              <div className="text-center max-w-sm">
                <p className="font-medium text-foreground mb-1">
                  {t.relationships.noDatasets}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t.relationships.noDatasetsSub}
                </p>
              </div>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                {t.relationships.goToWorkspace}
              </Link>
            </div>
          )}

          {hasDatasets && (
            <>
              {/* ── Dataset selectors ── */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <DatasetSelectorPanel
                  sideLabel={t.relationships.datasetA}
                  sideKey="A"
                  datasets={datasets}
                  selectedId={selectedIdA}
                  onSelect={handleSelectA}
                  columns={columnsA}
                  selectedColIdx={selectedColIdxA}
                  onSelectCol={setSelectedColIdxA}
                  excludeId={selectedIdB}
                />
                <DatasetSelectorPanel
                  sideLabel={t.relationships.datasetB}
                  sideKey="B"
                  datasets={datasets}
                  selectedId={selectedIdB}
                  onSelect={handleSelectB}
                  columns={columnsB}
                  selectedColIdx={selectedColIdxB}
                  onSelectCol={setSelectedColIdxB}
                  excludeId={selectedIdA}
                />
              </div>

              {/* ── Suggested relationships ── */}
              <SuggestionsSection
                suggestions={suggestions}
                datasetA={datasetA}
                datasetB={datasetB}
              />

              {/* ── Relationship diagram ── */}
              <DiagramSection
                datasetA={datasetA}
                datasetB={datasetB}
                colA={
                  selectedColIdxA !== null
                    ? columnsA.find((c) => c.index === selectedColIdxA) ?? null
                    : null
                }
                colB={
                  selectedColIdxB !== null
                    ? columnsB.find((c) => c.index === selectedColIdxB) ?? null
                    : null
                }
                suggestionsCount={suggestions.length}
              />
            </>
          )}
        </div>
      </main>
    </div>
  );
}

// ─── Dataset selector panel ───────────────────────────────────────────────────

interface DatasetSelectorPanelProps {
  sideLabel: string;
  sideKey: "A" | "B";
  datasets: Dataset[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  columns: ColumnInfo[];
  selectedColIdx: number | null;
  onSelectCol: (idx: number) => void;
  excludeId: string | null;
}

function DatasetSelectorPanel({
  sideLabel,
  sideKey,
  datasets,
  selectedId,
  onSelect,
  columns,
  selectedColIdx,
  onSelectCol,
  excludeId,
}: DatasetSelectorPanelProps) {
  const { t } = useLocale();
  const available = datasets.filter((d) => d.id !== excludeId);
  const selected = datasets.find((d) => d.id === selectedId) ?? null;

  const accentClass =
    sideKey === "A"
      ? "border-blue-200 bg-blue-500/8"
      : "border-violet-200 bg-violet-500/8";
  const accentText = sideKey === "A" ? "text-blue-700" : "text-violet-700";
  const accentBg = sideKey === "A" ? "bg-blue-500" : "bg-violet-500";

  return (
    <div className="flex flex-col rounded-xl border border-border bg-card overflow-hidden shadow-sm">
      {/* Header */}
      <div
        className={cn(
          "px-4 py-3 border-b border-border flex items-center gap-2.5",
          sideKey === "A" ? "bg-blue-50/60" : "bg-violet-50/60",
        )}
      >
        <div
          className={cn(
            "w-6 h-6 rounded-md flex items-center justify-center text-white text-xs font-bold shrink-0",
            accentBg,
          )}
        >
          {sideKey}
        </div>
        <span className="font-semibold text-sm text-foreground">{sideLabel}</span>
        {selected && (
          <span className="ms-auto text-xs text-muted-foreground">
            {tpl(t.datasets.rows, { n: (selected.file.rowCount - 1).toLocaleString() })}{" "}
            · {tpl(t.datasets.cols, { n: selected.file.colCount.toLocaleString() })}
          </span>
        )}
      </div>

      {/* Dataset dropdown */}
      <div className="p-3 border-b border-border bg-muted/20">
        <div className="relative">
          <select
            value={selectedId ?? ""}
            onChange={(e) => e.target.value && onSelect(e.target.value)}
            className="w-full appearance-none bg-card border border-border rounded-lg ps-3 pe-8 py-2 text-sm font-medium text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
          >
            <option value="" disabled>
              {t.relationships.selectDataset}
            </option>
            {available.map((d) => (
              <option key={d.id} value={d.id}>
                {d.file.fileName}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute end-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        </div>
      </div>

      {/* Column list */}
      <div className="flex-1">
        <div className="px-3 py-2 flex items-center justify-between border-b border-border/60">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {t.relationships.columnsTitle}
          </span>
          {columns.length > 0 && (
            <span className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full tabular-nums">
              {columns.length}
            </span>
          )}
        </div>

        {!selected ? (
          <div className="flex flex-col items-center justify-center gap-2 py-10 text-muted-foreground">
            <Database className="w-7 h-7 opacity-30" />
            <p className="text-xs text-center px-4">{t.relationships.noColumns}</p>
          </div>
        ) : (
          <div className="overflow-y-auto max-h-64">
            {columns.map((col) => {
              const isSelected = col.index === selectedColIdx;
              return (
                <button
                  key={col.index}
                  onClick={() => onSelectCol(col.index)}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-3 py-2 text-start transition-colors duration-100",
                    "border-b border-border/40 last:border-0",
                    isSelected
                      ? cn("bg-primary/5 border-s-2 border-s-primary", accentClass)
                      : "hover:bg-muted/50",
                  )}
                >
                  <ColTypeIcon type={col.type} />
                  <span
                    className={cn(
                      "flex-1 text-sm font-medium truncate",
                      isSelected ? accentText : "text-foreground",
                    )}
                    title={col.name}
                  >
                    {col.name}
                  </span>
                  <ColTypeBadge type={col.type} />
                  {isSelected && (
                    <Check className={cn("w-3.5 h-3.5 shrink-0", accentText)} />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Suggestions section ──────────────────────────────────────────────────────

interface SuggestionsSectionProps {
  suggestions: Suggestion[];
  datasetA: Dataset | null;
  datasetB: Dataset | null;
}

function SuggestionsSection({
  suggestions,
  datasetA,
  datasetB,
}: SuggestionsSectionProps) {
  const { t } = useLocale();
  const bothSelected = !!datasetA && !!datasetB;

  return (
    <section className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
      {/* Section header */}
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
        {bothSelected && suggestions.length > 0 && (
          <span className="shrink-0 text-xs font-semibold bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full tabular-nums">
            {tpl(t.relationships.suggestions.countLabel, {
              n: suggestions.length,
            })}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="divide-y divide-border">
        {!bothSelected && (
          <EmptyState
            icon={<GitBranch className="w-7 h-7 opacity-25" />}
            message={t.relationships.suggestions.noneSelected}
          />
        )}

        {bothSelected && suggestions.length === 0 && (
          <EmptyState
            icon={<Link2Off className="w-7 h-7 opacity-25" />}
            message={t.relationships.suggestions.empty}
          />
        )}

        {bothSelected &&
          suggestions.map((s) => (
            <SuggestionCard
              key={s.id}
              suggestion={s}
              fileNameA={datasetA!.file.fileName}
              fileNameB={datasetB!.file.fileName}
            />
          ))}
      </div>
    </section>
  );
}

interface SuggestionCardProps {
  suggestion: Suggestion;
  fileNameA: string;
  fileNameB: string;
}

function SuggestionCard({
  suggestion,
  fileNameA,
  fileNameB,
}: SuggestionCardProps) {
  const { t } = useLocale();
  const { colA, colB, confidence, reasonCode } = suggestion;

  const reasonStr = buildReasonString(reasonCode, colA.type, colB.type, t);

  return (
    <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-4">
      {/* Confidence badge */}
      <div className="shrink-0">
        <ConfidenceBadge confidence={confidence} />
      </div>

      {/* Column match display */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Column A */}
          <div className="flex items-center gap-1.5 bg-blue-50 border border-blue-200 rounded-lg px-2.5 py-1">
            <ColTypeIcon type={colA.type} className="text-blue-600" />
            <div className="min-w-0">
              <p className="text-xs text-blue-500 font-medium leading-none mb-0.5 truncate max-w-[120px]">
                {baseName(fileNameA)}
              </p>
              <p className="text-sm font-semibold text-blue-800 truncate max-w-[120px]">
                {colA.name}
              </p>
            </div>
          </div>

          {/* Arrow */}
          <ArrowLeftRight className="w-4 h-4 text-muted-foreground shrink-0" />

          {/* Column B */}
          <div className="flex items-center gap-1.5 bg-violet-50 border border-violet-200 rounded-lg px-2.5 py-1">
            <ColTypeIcon type={colB.type} className="text-violet-600" />
            <div className="min-w-0">
              <p className="text-xs text-violet-500 font-medium leading-none mb-0.5 truncate max-w-[120px]">
                {baseName(fileNameB)}
              </p>
              <p className="text-sm font-semibold text-violet-800 truncate max-w-[120px]">
                {colB.name}
              </p>
            </div>
          </div>
        </div>

        {/* Reason */}
        <p className="text-xs text-muted-foreground mt-2">{reasonStr}</p>
      </div>

      {/* Create button (disabled) */}
      <div className="shrink-0">
        <button
          disabled
          title={t.relationships.suggestions.createTooltip}
          className="flex items-center gap-2 px-3.5 py-2 rounded-lg border border-border bg-muted/50 text-sm font-medium text-muted-foreground opacity-60 cursor-not-allowed select-none"
        >
          <GitBranch className="w-3.5 h-3.5" />
          {t.relationships.suggestions.createButton}
        </button>
      </div>
    </div>
  );
}

// ─── Diagram section ──────────────────────────────────────────────────────────

interface DiagramSectionProps {
  datasetA: Dataset | null;
  datasetB: Dataset | null;
  colA: ColumnInfo | null;
  colB: ColumnInfo | null;
  suggestionsCount: number;
}

function DiagramSection({
  datasetA,
  datasetB,
  colA,
  colB,
}: DiagramSectionProps) {
  const { t } = useLocale();

  return (
    <section className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border flex items-center justify-between bg-muted/20">
        <div>
          <h2 className="text-sm font-semibold text-foreground">
            {t.relationships.diagram.title}
          </h2>
          <p className="text-xs text-muted-foreground mt-px">
            {t.relationships.diagram.subtitle}
          </p>
        </div>
        <span className="text-[10px] font-semibold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">
          {t.relationships.diagram.comingSoon}
        </span>
      </div>

      {/* Diagram canvas */}
      <div className="p-8 flex items-center justify-center min-h-[260px]">
        <div className="w-full max-w-2xl flex items-center gap-0">
          {/* Node A */}
          <DiagramNode dataset={datasetA} side="A" selectedCol={colA} />

          {/* Connector */}
          <div className="flex-1 flex items-center min-w-[80px]">
            <div
              className={cn(
                "flex-1 border-t-2 transition-colors duration-300",
                datasetA && datasetB
                  ? "border-primary/40 border-dashed"
                  : "border-border border-dashed",
              )}
            />
            <div
              className={cn(
                "mx-2 w-9 h-9 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-300",
                datasetA && datasetB
                  ? "border-primary/40 bg-primary/5"
                  : "border-border bg-muted",
              )}
            >
              <ArrowLeftRight
                className={cn(
                  "w-4 h-4 transition-colors duration-300",
                  datasetA && datasetB ? "text-primary/60" : "text-muted-foreground/30",
                )}
              />
            </div>
            <div
              className={cn(
                "flex-1 border-t-2 transition-colors duration-300",
                datasetA && datasetB
                  ? "border-primary/40 border-dashed"
                  : "border-border border-dashed",
              )}
            />
          </div>

          {/* Node B */}
          <DiagramNode dataset={datasetB} side="B" selectedCol={colB} />
        </div>
      </div>

      {/* Placeholder caption */}
      {(!datasetA || !datasetB) && (
        <div className="border-t border-border px-5 py-3 bg-muted/10">
          <p className="text-xs text-center text-muted-foreground">
            {t.relationships.diagram.placeholder}
          </p>
        </div>
      )}
    </section>
  );
}

interface DiagramNodeProps {
  dataset: Dataset | null;
  side: "A" | "B";
  selectedCol: ColumnInfo | null;
}

function DiagramNode({ dataset, side, selectedCol }: DiagramNodeProps) {
  const { t } = useLocale();
  const isA = side === "A";

  if (!dataset) {
    return (
      <div
        className={cn(
          "w-40 h-32 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-2",
          isA ? "border-blue-200" : "border-violet-200",
        )}
      >
        <Database
          className={cn(
            "w-7 h-7 opacity-20",
            isA ? "text-blue-500" : "text-violet-500",
          )}
        />
        <span className="text-xs font-medium text-muted-foreground">
          {isA ? t.relationships.datasetA : t.relationships.datasetB}
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "w-44 rounded-xl border-2 overflow-hidden shadow-sm",
        isA ? "border-blue-300" : "border-violet-300",
      )}
    >
      {/* Title bar */}
      <div
        className={cn(
          "px-3 py-1.5 flex items-center gap-2",
          isA ? "bg-blue-500" : "bg-violet-500",
        )}
      >
        <Database className="w-3 h-3 text-white/80 shrink-0" />
        <span className="text-[10px] text-white font-bold uppercase tracking-wider truncate">
          {side}
        </span>
      </div>
      {/* File name */}
      <div
        className={cn(
          "px-3 py-2 border-b",
          isA ? "bg-blue-50 border-blue-200" : "bg-violet-50 border-violet-200",
        )}
      >
        <p
          className={cn(
            "text-xs font-semibold truncate",
            isA ? "text-blue-900" : "text-violet-900",
          )}
          title={dataset.file.fileName}
        >
          {baseName(dataset.file.fileName)}
        </p>
        <p
          className={cn(
            "text-[10px] mt-px",
            isA ? "text-blue-500" : "text-violet-500",
          )}
        >
          {tpl(t.datasets.cols, { n: dataset.file.colCount })}
          {" · "}
          {tpl(t.datasets.rows, { n: (dataset.file.rowCount - 1).toLocaleString() })}
        </p>
      </div>
      {/* Selected column */}
      <div
        className={cn(
          "px-3 py-2",
          isA ? "bg-blue-50/50" : "bg-violet-50/50",
        )}
      >
        {selectedCol ? (
          <div className="flex items-center gap-1.5">
            <div
              className={cn(
                "w-1.5 h-1.5 rounded-full shrink-0",
                isA ? "bg-blue-400" : "bg-violet-400",
              )}
            />
            <span
              className={cn(
                "text-xs font-medium truncate",
                isA ? "text-blue-700" : "text-violet-700",
              )}
            >
              {selectedCol.name}
            </span>
          </div>
        ) : (
          <span className="text-[10px] text-muted-foreground italic">
            {t.relationships.selectColumn}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Small reusable pieces ────────────────────────────────────────────────────

function ConfidenceBadge({ confidence }: { confidence: Confidence }) {
  const { t } = useLocale();
  const styles: Record<Confidence, string> = {
    high: "bg-emerald-50 text-emerald-700 border-emerald-200",
    medium: "bg-amber-50 text-amber-700 border-amber-200",
    low: "bg-sky-50 text-sky-700 border-sky-200",
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

function ColTypeIcon({
  type,
  className,
}: {
  type: ColType;
  className?: string;
}) {
  const base = cn("w-3.5 h-3.5 shrink-0", className);
  if (type === "numeric") return <Hash className={cn(base, "text-blue-500")} />;
  if (type === "categorical") return <Type className={cn(base, "text-violet-500")} />;
  return <HelpCircle className={cn(base, "text-muted-foreground opacity-40")} />;
}

function ColTypeBadge({ type }: { type: ColType }) {
  const { t } = useLocale();
  const label =
    type === "numeric"
      ? t.relationships.typeNumeric
      : type === "categorical"
        ? t.relationships.typeCategorical
        : t.relationships.typeUnknown;
  const styles: Record<ColType, string> = {
    numeric: "bg-blue-50 text-blue-600 border-blue-200",
    categorical: "bg-violet-50 text-violet-600 border-violet-200",
    unknown: "bg-muted text-muted-foreground border-border",
  };
  return (
    <span
      className={cn(
        "text-[9px] font-semibold uppercase tracking-wider px-1.5 py-px rounded border shrink-0",
        styles[type],
      )}
    >
      {label}
    </span>
  );
}

function EmptyState({
  icon,
  message,
}: {
  icon: React.ReactNode;
  message: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-14 text-muted-foreground">
      {icon}
      <p className="text-sm text-center max-w-xs px-4">{message}</p>
    </div>
  );
}

// ─── Pure helpers ─────────────────────────────────────────────────────────────

function getColumns(dataset: Dataset): ColumnInfo[] {
  const { file } = dataset;
  const numericSet = new Set(file.chartData?.numeric.map((s) => s.colIndex) ?? []);
  const categoricalSet = new Set(
    file.chartData?.categorical.map((s) => s.colIndex) ?? [],
  );

  return file.headers.map((name, index) => ({
    index,
    name,
    type: numericSet.has(index)
      ? "numeric"
      : categoricalSet.has(index)
        ? "categorical"
        : "unknown",
  }));
}

/** Compare two column lists and find relationship candidates. */
function computeSuggestions(
  colsA: ColumnInfo[],
  colsB: ColumnInfo[],
): Suggestion[] {
  const results: Suggestion[] = [];

  for (const a of colsA) {
    for (const b of colsB) {
      const match = scorePair(a, b);
      if (match) {
        results.push({ id: `${a.index}:${b.index}`, colA: a, colB: b, ...match });
      }
    }
  }

  const CONFIDENCE_ORDER: Record<Confidence, number> = { high: 0, medium: 1, low: 2 };
  results.sort(
    (a, b) =>
      CONFIDENCE_ORDER[a.confidence] - CONFIDENCE_ORDER[b.confidence] ||
      a.colA.name.localeCompare(b.colA.name),
  );

  return results.slice(0, 20);
}

const KEY_SUFFIX = /(id|key|code|num|number|ref|no|pk|fk)$/i;
const NORM_RE = /[\s_\-\.]/g;

function norm(s: string): string {
  return s.toLowerCase().replace(NORM_RE, "");
}

function scorePair(
  a: ColumnInfo,
  b: ColumnInfo,
): { confidence: Confidence; reasonCode: ReasonCode } | null {
  const na = norm(a.name);
  const nb = norm(b.name);
  const sameType =
    a.type !== "unknown" && b.type !== "unknown" && a.type === b.type;

  // ── Exact name match ──────────────────────────────────────────────────────
  if (na === nb) {
    return {
      confidence: sameType ? "high" : "medium",
      reasonCode: sameType ? "exactSameType" : "exactDiffType",
    };
  }

  // ── One name contains the other ───────────────────────────────────────────
  if (na.includes(nb) || nb.includes(na)) {
    return {
      confidence: sameType ? "medium" : "low",
      reasonCode: sameType ? "partialSameType" : "partialDiffType",
    };
  }

  // ── Both are key-like columns with related bases ───────────────────────────
  if (KEY_SUFFIX.test(a.name) && KEY_SUFFIX.test(b.name)) {
    const baseA = na.replace(KEY_SUFFIX, "");
    const baseB = nb.replace(KEY_SUFFIX, "");
    if (baseA === baseB || baseA.includes(baseB) || baseB.includes(baseA)) {
      return { confidence: "low", reasonCode: "similarKeys" };
    }
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
    type === "numeric"
      ? t.relationships.typeNumeric
      : type === "categorical"
        ? t.relationships.typeCategorical
        : t.relationships.typeUnknown;

  const tA = typeLabel(typeA);
  const tB = typeLabel(typeB);
  const template = t.relationships.suggestions.reasons[code];

  return tpl(template, { type: tA, typeA: tA, typeB: tB });
}

function baseName(fileName: string): string {
  return fileName.replace(/\.(xlsx|xls|csv)$/i, "");
}
