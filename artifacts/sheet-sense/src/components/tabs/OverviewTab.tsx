/**
 * OverviewTab — the single dataset summary page.
 *
 * Sections (in order):
 *   1. Summary      — health badge + prose
 *   2. Key Stats    — rows, columns, numeric columns
 *   3. Data Quality — score + missing/duplicate/empty metrics
 *   4. Key Findings — insights list (with refresh)
 *   5. Recommendations — actionable next steps
 */

import { useState, type ReactNode } from "react";
import {
  CheckCircle2, AlertTriangle, XCircle, Info,
  RefreshCw, ChevronDown, ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocale } from "@/i18n/context";
import { tpl } from "@/i18n/tpl";
import type { ParsedFile } from "@/types";
import type { Insight, InsightKind } from "@/lib/insights";
import type { Translations } from "@/i18n/types";

// ─── Props ────────────────────────────────────────────────────────────────────

interface OverviewTabProps {
  file: ParsedFile;
  insights: Insight[];
  insightStatus: "idle" | "loading" | "done";
  onRegenerate: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function OverviewTab({ file, insights, insightStatus, onRegenerate }: OverviewTabProps) {
  const { t } = useLocale();
  const dq       = file.dataQuality;
  const dataRows = Math.max(0, file.rowCount - 1);
  const isLoading = insightStatus === "loading";

  return (
    <div className="divide-y divide-border/50">

      {/* ── 1. Summary ─────────────────────────────────────────────────────── */}
      {dq && (
        <Section title={t.summary.quickSummary}>
          <SummarySection file={file} t={t} />
        </Section>
      )}

      {/* ── 2. Key Statistics ───────────────────────────────────────────────── */}
      <Section title={t.tabs.keyStatistics}>
        <div className="grid grid-cols-3 gap-3">
          <StatTile label={t.fileStats.rows}       value={dataRows.toLocaleString()} />
          <StatTile label={t.fileStats.columns}    value={file.colCount.toLocaleString()} />
          <StatTile
            label={t.fileStats.numericCols}
            value={dq ? dq.numericColumns.toLocaleString() : "—"}
          />
        </div>
      </Section>

      {/* ── 3. Data Quality ─────────────────────────────────────────────────── */}
      {dq && (
        <Section title={t.quality.sectionTitle}>
          <QualitySection file={file} t={t} />
        </Section>
      )}

      {/* ── 4. Key Findings ─────────────────────────────────────────────────── */}
      <Section
        title={t.tabs.topInsights}
        action={
          <button
            onClick={onRegenerate}
            disabled={isLoading}
            aria-label={t.tabs.refreshFindings}
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-40"
          >
            <RefreshCw className={cn("w-3.5 h-3.5", isLoading && "animate-spin")} />
          </button>
        }
      >
        {isLoading ? (
          <FindingsSkeleton />
        ) : insights.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t.tabs.insightsEmpty}</p>
        ) : (
          <div className="flex flex-col gap-2">
            {insights.map((insight, i) => (
              <FindingCard key={insight.id} insight={insight} index={i} />
            ))}
          </div>
        )}
      </Section>

      {/* ── 5. Recommendations ─────────────────────────────────────────────── */}
      {dq && (
        <Section title={t.summary.recommendedActions}>
          <RecommendationsSection file={file} t={t} />
        </Section>
      )}
    </div>
  );
}

// ─── Section wrapper ─────────────────────────────────────────────────────────

function Section({
  title,
  action,
  children,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="px-6 py-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
          {title}
        </p>
        {action}
      </div>
      {children}
    </div>
  );
}

// ─── 1. Summary section ───────────────────────────────────────────────────────

type HealthTier = "excellent" | "good" | "fair" | "poor";

interface Health {
  tier: HealthTier;
  label: string;
  pillCls: string;
  dotCls: string;
  Icon: React.ElementType;
  iconCls: string;
}

function getHealth(score: number, t: Translations): Health {
  if (score >= 80)
    return {
      tier: "excellent",
      label: t.scoreLabel.excellent,
      pillCls: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/20",
      dotCls: "bg-emerald-500",
      Icon: CheckCircle2,
      iconCls: "text-emerald-500",
    };
  if (score >= 60)
    return {
      tier: "good",
      label: t.scoreLabel.good,
      pillCls: "bg-blue-500/10 text-blue-600 dark:text-blue-400 ring-1 ring-blue-500/20",
      dotCls: "bg-blue-500",
      Icon: Info,
      iconCls: "text-blue-500",
    };
  if (score >= 40)
    return {
      tier: "fair",
      label: t.scoreLabel.fair,
      pillCls: "bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-1 ring-amber-500/20",
      dotCls: "bg-amber-500",
      Icon: AlertTriangle,
      iconCls: "text-amber-500",
    };
  return {
    tier: "poor",
    label: t.scoreLabel.poor,
    pillCls: "bg-red-500/10 text-red-600 dark:text-red-400 ring-1 ring-red-500/20",
    dotCls: "bg-red-500",
    Icon: XCircle,
    iconCls: "text-red-500",
  };
}

function buildSummaryProse(file: ParsedFile, t: Translations): string {
  const p = t.summary.prose;
  const dq = file.dataQuality!;
  const dataRows = Math.max(0, file.rowCount - 1);
  const sentences: string[] = [];

  sentences.push(tpl(p.size, { rows: dataRows.toLocaleString(), cols: file.colCount.toLocaleString() }));

  if (dq.qualityScore >= 80) {
    const hasMissing = dq.missingValues > 0;
    const hasDupes   = dq.duplicateRows > 0;
    if (!hasMissing && !hasDupes)         sentences.push(p.qualityExcellentClean);
    else if (hasMissing && !hasDupes)     sentences.push(tpl(p.qualityExcellentMissing, { pct: dq.missingPercent.toFixed(1) }));
    else if (!hasMissing && hasDupes)     sentences.push(tpl(p.qualityExcellentDupes,   { count: dq.duplicateRows.toLocaleString() }));
    else                                  sentences.push(tpl(p.qualityExcellentBoth,    { pct: dq.missingPercent.toFixed(1), count: dq.duplicateRows.toLocaleString() }));
  } else if (dq.qualityScore >= 60) {
    sentences.push(tpl(p.qualityGood, { score: String(dq.qualityScore) }));
  } else if (dq.qualityScore >= 40) {
    sentences.push(tpl(p.qualityFair, { score: String(dq.qualityScore) }));
  } else {
    sentences.push(tpl(p.qualityPoor, { score: String(dq.qualityScore) }));
  }

  if (dq.numericColumns > 0 && dq.textColumns > 0)
    sentences.push(tpl(p.compositionMixed, { numeric: dq.numericColumns.toLocaleString(), text: dq.textColumns.toLocaleString() }));
  else if (dq.numericColumns > 0 && dq.textColumns === 0)
    sentences.push(tpl(p.compositionNumericOnly, { numeric: dq.numericColumns.toLocaleString() }));
  else if (dq.textColumns > 0 && dq.numericColumns === 0)
    sentences.push(tpl(p.compositionTextOnly, { text: dq.textColumns.toLocaleString() }));

  if (!dq || dq.qualityScore >= 80) sentences.push(p.closingReady);
  else if (dq.qualityScore >= 60)   sentences.push(p.closingGood);
  else                              sentences.push(p.closingPoor);

  return sentences.join(" ");
}

function SummarySection({ file, t }: { file: ParsedFile; t: Translations }) {
  const dq     = file.dataQuality!;
  const health = getHealth(dq.qualityScore, t);
  const prose  = buildSummaryProse(file, t);

  return (
    <div className="flex flex-col gap-3">
      {/* Health badge */}
      <div className="flex items-center gap-2 flex-wrap">
        <health.Icon className={cn("w-4 h-4 shrink-0", health.iconCls)} />
        <span className="text-sm font-semibold text-foreground">{t.summary.datasetHealth}</span>
        <span className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold",
          health.pillCls,
        )}>
          <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", health.dotCls)} />
          {health.label}
        </span>
      </div>
      {/* Prose */}
      <p className="text-sm leading-relaxed text-muted-foreground">{prose}</p>
    </div>
  );
}

// ─── 2. Stat tile (Key Statistics) ───────────────────────────────────────────

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-muted/40 rounded-xl px-3 py-3 flex flex-col gap-1">
      <p className="text-[10px] font-medium text-muted-foreground/70 leading-none truncate uppercase tracking-wide">
        {label}
      </p>
      <p className="text-2xl font-bold text-foreground tabular-nums leading-tight mt-1">{value}</p>
    </div>
  );
}

// ─── 3. Data Quality section ─────────────────────────────────────────────────

function scoreColor(score: number) {
  if (score >= 80) return { text: "text-emerald-600 dark:text-emerald-400", bar: "#10b981" };
  if (score >= 60) return { text: "text-amber-600  dark:text-amber-400",  bar: "#f59e0b" };
  return                  { text: "text-red-600    dark:text-red-400",    bar: "#ef4444" };
}

function QualitySection({ file, t }: { file: ParsedFile; t: Translations }) {
  const dq    = file.dataQuality!;
  const sc    = scoreColor(dq.qualityScore);
  const m     = t.summary.metrics;

  return (
    <div className="flex flex-col gap-3">
      {/* Score bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${dq.qualityScore}%`, backgroundColor: sc.bar }}
          />
        </div>
        <span className={cn("text-sm font-bold tabular-nums shrink-0", sc.text)}>
          {dq.qualityScore}<span className="text-xs font-normal text-muted-foreground">/100</span>
        </span>
      </div>

      {/* Quality metrics grid */}
      <div className="grid grid-cols-3 gap-3">
        <QualityTile
          label={m.missingValues}
          value={dq.missingValues.toLocaleString()}
          sub={dq.missingValues > 0 ? `${dq.missingPercent.toFixed(1)}%` : undefined}
          warn={dq.missingValues > 0}
        />
        <QualityTile
          label={m.duplicateRows}
          value={dq.duplicateRows.toLocaleString()}
          warn={dq.duplicateRows > 0}
        />
        <QualityTile
          label={t.metrics.emptyColumns.label}
          value={dq.emptyColumns.toLocaleString()}
          warn={dq.emptyColumns > 0}
        />
      </div>
    </div>
  );
}

function QualityTile({
  label,
  value,
  sub,
  warn = false,
}: {
  label: string;
  value: string;
  sub?: string;
  warn?: boolean;
}) {
  return (
    <div className={cn(
      "rounded-xl px-3 py-3 flex flex-col gap-1",
      warn ? "bg-amber-500/8 border border-amber-500/15" : "bg-muted/40",
    )}>
      <p className="text-[10px] font-medium uppercase tracking-wide leading-none truncate text-muted-foreground/70">
        {label}
      </p>
      <div className="flex items-baseline gap-1 mt-1">
        <span className={cn(
          "text-xl font-bold tabular-nums leading-tight",
          warn ? "text-amber-600 dark:text-amber-400" : "text-foreground",
        )}>
          {value}
        </span>
        {sub && (
          <span className="text-xs text-muted-foreground font-normal">{sub}</span>
        )}
      </div>
    </div>
  );
}

// ─── 4. Key Findings ─────────────────────────────────────────────────────────

const KIND_CONFIG: Record<InsightKind, {
  icon: (cls?: string) => ReactNode;
  badge: string;
  labelKey: "success" | "warning" | "info";
}> = {
  success: {
    icon: (cls) => <CheckCircle2 className={cn("w-4 h-4 text-emerald-500", cls)} />,
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
    labelKey: "success",
  },
  warning: {
    icon: (cls) => <AlertTriangle className={cn("w-4 h-4 text-amber-500", cls)} />,
    badge: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20",
    labelKey: "warning",
  },
  info: {
    icon: (cls) => <Info className={cn("w-4 h-4 text-blue-500", cls)} />,
    badge: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20",
    labelKey: "info",
  },
};

function FindingCard({ insight, index }: { insight: Insight; index: number }) {
  const { t } = useLocale();
  const [expanded, setExpanded] = useState(false);
  const cfg = KIND_CONFIG[insight.kind];

  return (
    <div
      className="bg-card border border-border rounded-xl overflow-hidden animate-in fade-in slide-in-from-bottom-1"
      style={{ animationDelay: `${index * 35}ms`, animationFillMode: "both" }}
    >
      <div className="px-4 py-3 flex items-start gap-3">
        <div className="mt-0.5 shrink-0">{cfg.icon()}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className={cn(
              "shrink-0 inline-flex items-center px-1.5 py-px rounded-full text-[10px] font-semibold border uppercase tracking-wide",
              cfg.badge,
            )}>
              {t.insights.kindLabel[cfg.labelKey]}
            </span>
            <p className="text-sm font-semibold text-foreground leading-snug">{insight.title}</p>
          </div>
          <p className={cn("text-sm text-muted-foreground leading-relaxed", !expanded && "line-clamp-2")}>
            {insight.description}
          </p>
          <button
            onClick={() => setExpanded((v) => !v)}
            className="inline-flex items-center gap-1 mt-1.5 text-xs font-medium text-primary/70 hover:text-primary transition-colors"
          >
            {expanded ? (
              <><ChevronUp className="w-3 h-3" />{t.tabs.hideDetails}</>
            ) : (
              <><ChevronDown className="w-3 h-3" />{t.tabs.viewDetails}</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function FindingsSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      {[0, 1, 2].map((i) => (
        <div key={i} className="bg-card border border-border rounded-xl px-4 py-3 flex gap-3 animate-pulse">
          <div className="shrink-0 w-4 h-4 rounded-full bg-muted mt-0.5" />
          <div className="flex flex-col gap-1.5 flex-1">
            <div className="h-3 bg-muted rounded w-1/4" />
            <div className="h-4 bg-muted rounded w-3/5" />
            <div className="h-3 bg-muted rounded w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── 5. Recommendations section ───────────────────────────────────────────────

interface ActionItem {
  kind: "warning" | "success";
  text: string;
}

function buildActions(file: ParsedFile, t: Translations): ActionItem[] {
  const a  = t.summary.actions;
  const dq = file.dataQuality;
  if (!dq) return [{ kind: "success", text: a.noAction }];

  const actions: ActionItem[] = [];
  if (dq.duplicateRows > 0)
    actions.push({ kind: "warning", text: tpl(a.duplicates, { count: dq.duplicateRows.toLocaleString() }) });
  if (dq.missingValues > 0)
    actions.push({ kind: "warning", text: tpl(a.missing, { count: dq.missingValues.toLocaleString(), pct: dq.missingPercent.toFixed(1) }) });
  if (dq.emptyColumns > 0)
    actions.push({ kind: "warning", text: tpl(a.emptyColumns, { count: dq.emptyColumns.toLocaleString() }) });
  if (actions.length === 0)
    actions.push({ kind: "success", text: a.noAction });
  return actions;
}

function RecommendationsSection({ file, t }: { file: ParsedFile; t: Translations }) {
  const actions = buildActions(file, t);
  return (
    <ul className="flex flex-col gap-2">
      {actions.map((action, i) => (
        <li key={i} className="flex items-start gap-2.5">
          {action.kind === "success" ? (
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5 text-emerald-500" />
          ) : (
            <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-500" />
          )}
          <span className="text-sm text-foreground leading-snug">{action.text}</span>
        </li>
      ))}
    </ul>
  );
}
