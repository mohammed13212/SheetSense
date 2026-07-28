/**
 * SummaryCard — deterministic AI-style summary panel.
 *
 * All text comes from t.summary.* — fully localised, no hardcoded strings.
 * All prose is derived from existing analysis results; no model calls.
 */

import { CheckCircle2, AlertTriangle, XCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocale } from "@/i18n/context";
import { tpl } from "@/i18n/tpl";
import type { ParsedFile } from "@/types";
import type { Translations } from "@/i18n/types";

// ─── Health tier ──────────────────────────────────────────────────────────────

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
      pillCls: "bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20",
      dotCls:  "bg-emerald-500",
      Icon:    CheckCircle2,
      iconCls: "text-emerald-400",
    };
  if (score >= 60)
    return {
      tier: "good",
      label: t.scoreLabel.good,
      pillCls: "bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/20",
      dotCls:  "bg-blue-500",
      Icon:    Info,
      iconCls: "text-blue-400",
    };
  if (score >= 40)
    return {
      tier: "fair",
      label: t.scoreLabel.fair,
      pillCls: "bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20",
      dotCls:  "bg-amber-500",
      Icon:    AlertTriangle,
      iconCls: "text-amber-400",
    };
  return {
    tier: "poor",
    label: t.scoreLabel.poor,
    pillCls: "bg-red-500/10 text-red-400 ring-1 ring-red-500/20",
    dotCls:  "bg-red-500",
    Icon:    XCircle,
    iconCls: "text-red-400",
  };
}

// ─── Deterministic summary prose ──────────────────────────────────────────────

function buildSummary(file: ParsedFile, t: Translations): string {
  const p        = t.summary.prose;
  const dq       = file.dataQuality;
  const dataRows = Math.max(0, file.rowCount - 1);
  const sentences: string[] = [];

  // 1 — Size
  sentences.push(
    tpl(p.size, {
      rows: dataRows.toLocaleString(),
      cols: file.colCount.toLocaleString(),
    }),
  );

  // 2 — Quality tier
  if (!dq) {
    // no quality data — skip tier sentence
  } else if (dq.qualityScore >= 80) {
    const hasMissing = dq.missingValues > 0;
    const hasDupes   = dq.duplicateRows > 0;
    if (!hasMissing && !hasDupes) {
      sentences.push(p.qualityExcellentClean);
    } else if (hasMissing && !hasDupes) {
      sentences.push(tpl(p.qualityExcellentMissing, { pct: dq.missingPercent.toFixed(1) }));
    } else if (!hasMissing && hasDupes) {
      sentences.push(tpl(p.qualityExcellentDupes, { count: dq.duplicateRows.toLocaleString() }));
    } else {
      sentences.push(
        tpl(p.qualityExcellentBoth, {
          pct:   dq.missingPercent.toFixed(1),
          count: dq.duplicateRows.toLocaleString(),
        }),
      );
    }
  } else if (dq.qualityScore >= 60) {
    sentences.push(tpl(p.qualityGood, { score: String(dq.qualityScore) }));
  } else if (dq.qualityScore >= 40) {
    sentences.push(tpl(p.qualityFair, { score: String(dq.qualityScore) }));
  } else {
    sentences.push(tpl(p.qualityPoor, { score: String(dq.qualityScore) }));
  }

  // 3 — Column composition
  if (dq && dq.numericColumns > 0 && dq.textColumns > 0) {
    sentences.push(
      tpl(p.compositionMixed, {
        numeric: dq.numericColumns.toLocaleString(),
        text:    dq.textColumns.toLocaleString(),
      }),
    );
  } else if (dq && dq.numericColumns > 0 && dq.textColumns === 0) {
    sentences.push(tpl(p.compositionNumericOnly, { numeric: dq.numericColumns.toLocaleString() }));
  } else if (dq && dq.textColumns > 0 && dq.numericColumns === 0) {
    sentences.push(tpl(p.compositionTextOnly, { text: dq.textColumns.toLocaleString() }));
  }

  // 4 — Closing verdict
  if (!dq || dq.qualityScore >= 80) {
    sentences.push(p.closingReady);
  } else if (dq.qualityScore >= 60) {
    sentences.push(p.closingGood);
  } else {
    sentences.push(p.closingPoor);
  }

  return sentences.join(" ");
}

// ─── Recommended actions ──────────────────────────────────────────────────────

interface Action {
  kind: "warning" | "success";
  text: string;
}

function buildActions(file: ParsedFile, t: Translations): Action[] {
  const a  = t.summary.actions;
  const dq = file.dataQuality;

  if (!dq) return [{ kind: "success", text: a.noAction }];

  const actions: Action[] = [];

  if (dq.duplicateRows > 0) {
    actions.push({
      kind: "warning",
      text: tpl(a.duplicates, { count: dq.duplicateRows.toLocaleString() }),
    });
  }

  if (dq.missingValues > 0) {
    actions.push({
      kind: "warning",
      text: tpl(a.missing, {
        count: dq.missingValues.toLocaleString(),
        pct:   dq.missingPercent.toFixed(1),
      }),
    });
  }

  if (dq.emptyColumns > 0) {
    actions.push({
      kind: "warning",
      text: tpl(a.emptyColumns, { count: dq.emptyColumns.toLocaleString() }),
    });
  }

  if (actions.length === 0) {
    actions.push({ kind: "success", text: a.noAction });
  }

  return actions;
}

// ─── Key metrics ──────────────────────────────────────────────────────────────

interface Metric {
  label: string;
  value: string;
  sub?: string;
}

function buildMetrics(file: ParsedFile, t: Translations): Metric[] {
  const m  = t.summary.metrics;
  const dq = file.dataQuality;
  const dataRows = Math.max(0, file.rowCount - 1);

  return [
    { label: m.rows,           value: dataRows.toLocaleString() },
    { label: m.columns,        value: file.colCount.toLocaleString() },
    {
      label: m.missingValues,
      value: dq ? dq.missingValues.toLocaleString() : "—",
      sub:   dq && dq.missingValues > 0 ? `${dq.missingPercent.toFixed(1)}%` : undefined,
    },
    { label: m.duplicateRows,  value: dq ? dq.duplicateRows.toLocaleString() : "—" },
    {
      label: m.qualityScore,
      value: dq ? `${dq.qualityScore}` : "—",
      sub:   dq ? "/ 100" : undefined,
    },
  ];
}

// ─── Component ────────────────────────────────────────────────────────────────

interface SummaryCardProps {
  file: ParsedFile;
}

export function SummaryCard({ file }: SummaryCardProps) {
  const { t }   = useLocale();
  const dq      = file.dataQuality;
  const score   = dq?.qualityScore ?? 0;
  const health  = getHealth(dq ? score : 0, t);
  const summary = buildSummary(file, t);
  const actions = buildActions(file, t);
  const metrics = buildMetrics(file, t);

  return (
    <div className="mx-6 mt-6 mb-1 rounded-2xl border border-border bg-card overflow-hidden">
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border/60">
        <div className="flex items-center gap-2.5">
          <health.Icon className={cn("w-4 h-4 shrink-0", health.iconCls)} />
          <span className="text-sm font-semibold text-foreground">
            {t.summary.datasetHealth}
          </span>
          <span
            className={cn(
              "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold",
              health.pillCls,
            )}
          >
            <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", health.dotCls)} />
            {health.label}
          </span>
        </div>
        <span className="text-[10px] font-medium tracking-widest uppercase text-muted-foreground/50 select-none">
          {t.summary.title}
        </span>
      </div>

      {/* ── Body ── */}
      <div className="flex flex-col gap-0 divide-y divide-border/50">
        {/* Quick summary */}
        <div className="px-5 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 mb-2">
            {t.summary.quickSummary}
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">{summary}</p>
        </div>

        {/* Key metrics */}
        <div className="px-5 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 mb-3">
            {t.summary.keyMetrics}
          </p>
          <div className="grid grid-cols-5 gap-3">
            {metrics.map((m) => (
              <MetricTile key={m.label} metric={m} />
            ))}
          </div>
        </div>

        {/* Recommended actions */}
        <div className="px-5 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 mb-3">
            {t.summary.recommendedActions}
          </p>
          <ul className="flex flex-col gap-2">
            {actions.map((action, i) => (
              <ActionRow key={i} action={action} />
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

// ─── Metric tile ──────────────────────────────────────────────────────────────

function MetricTile({ metric }: { metric: Metric }) {
  return (
    <div className="flex flex-col gap-0.5 bg-muted/30 rounded-xl px-3 py-2.5">
      <span className="text-[10px] font-medium text-muted-foreground/70 leading-none truncate">
        {metric.label}
      </span>
      <div className="flex items-baseline gap-1 mt-1">
        <span className="text-lg font-bold text-foreground tabular-nums leading-none">
          {metric.value}
        </span>
        {metric.sub && (
          <span className="text-xs text-muted-foreground font-normal">{metric.sub}</span>
        )}
      </div>
    </div>
  );
}

// ─── Action row ───────────────────────────────────────────────────────────────

function ActionRow({ action }: { action: Action }) {
  return (
    <li className="flex items-start gap-2.5">
      {action.kind === "success" ? (
        <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5 text-emerald-500" />
      ) : (
        <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-500" />
      )}
      <span className="text-sm text-foreground leading-snug">{action.text}</span>
    </li>
  );
}
