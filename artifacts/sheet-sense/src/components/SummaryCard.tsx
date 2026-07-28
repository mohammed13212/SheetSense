/**
 * SummaryCard — deterministic AI-style summary panel.
 *
 * All text is derived from existing analysis results.
 * No model calls. No animations.
 */

import { CheckCircle2, AlertTriangle, XCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ParsedFile } from "@/types";

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

function getHealth(score: number): Health {
  if (score >= 80)
    return {
      tier: "excellent",
      label: "Excellent",
      pillCls: "bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20",
      dotCls:  "bg-emerald-500",
      Icon:    CheckCircle2,
      iconCls: "text-emerald-400",
    };
  if (score >= 60)
    return {
      tier: "good",
      label: "Good",
      pillCls: "bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/20",
      dotCls:  "bg-blue-500",
      Icon:    Info,
      iconCls: "text-blue-400",
    };
  if (score >= 40)
    return {
      tier: "fair",
      label: "Fair",
      pillCls: "bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20",
      dotCls:  "bg-amber-500",
      Icon:    AlertTriangle,
      iconCls: "text-amber-400",
    };
  return {
    tier: "poor",
    label: "Poor",
    pillCls: "bg-red-500/10 text-red-400 ring-1 ring-red-500/20",
    dotCls:  "bg-red-500",
    Icon:    XCircle,
    iconCls: "text-red-400",
  };
}

// ─── Deterministic summary prose ──────────────────────────────────────────────

function buildSummary(file: ParsedFile): string {
  const dq       = file.dataQuality;
  const dataRows = Math.max(0, file.rowCount - 1);
  const sentences: string[] = [];

  // 1 — Size
  sentences.push(
    `This dataset contains ${dataRows.toLocaleString()} rows and ${file.colCount.toLocaleString()} columns.`,
  );

  // 2 — Quality + notable issues
  if (!dq) {
    sentences.push("Quality analysis is not available for this file.");
  } else if (dq.qualityScore >= 80) {
    const missingPart =
      dq.missingValues === 0
        ? "no missing values"
        : `only ${dq.missingPercent.toFixed(1)}% missing values`;
    const dupPart =
      dq.duplicateRows === 0
        ? "no duplicate records"
        : `${dq.duplicateRows.toLocaleString()} duplicate row${dq.duplicateRows !== 1 ? "s" : ""}`;
    sentences.push(
      `The data quality is excellent with ${missingPart} and ${dupPart}.`,
    );
  } else if (dq.qualityScore >= 60) {
    const issues: string[] = [];
    if (dq.missingValues > 0) issues.push(`${dq.missingPercent.toFixed(1)}% missing values`);
    if (dq.duplicateRows  > 0) issues.push(`${dq.duplicateRows.toLocaleString()} duplicate rows`);
    if (dq.emptyColumns   > 0) issues.push(`${dq.emptyColumns} empty column${dq.emptyColumns !== 1 ? "s" : ""}`);
    sentences.push(
      issues.length > 0
        ? `The data quality is good (${dq.qualityScore}/100), with minor issues: ${issues.join(", ")}.`
        : `The data quality is good with a score of ${dq.qualityScore}/100.`,
    );
  } else if (dq.qualityScore >= 40) {
    sentences.push(
      `The data quality is fair (${dq.qualityScore}/100). Several issues were detected that should be addressed before analysis.`,
    );
  } else {
    sentences.push(
      `The data quality is poor (${dq.qualityScore}/100). Significant cleaning is recommended before proceeding.`,
    );
  }

  // 3 — Column composition (only if meaningful)
  if (dq && dq.numericColumns > 0 && dq.textColumns > 0) {
    sentences.push(
      `It contains ${dq.numericColumns} numeric and ${dq.textColumns} text column${dq.textColumns !== 1 ? "s" : ""}, supporting both statistical and categorical analysis.`,
    );
  } else if (dq && dq.numericColumns > 0 && dq.textColumns === 0) {
    sentences.push(
      `All ${dq.numericColumns} column${dq.numericColumns !== 1 ? "s are" : " is"} numeric, making it well-suited for statistical analysis.`,
    );
  } else if (dq && dq.textColumns > 0 && dq.numericColumns === 0) {
    sentences.push(
      `The dataset is entirely categorical with ${dq.textColumns} text column${dq.textColumns !== 1 ? "s" : ""}.`,
    );
  }

  // 4 — Closing verdict
  if (!dq || dq.qualityScore >= 80) {
    sentences.push("The dataset is ready for analysis and visualization.");
  } else if (dq.qualityScore >= 60) {
    sentences.push(
      "Addressing the detected issues will improve the reliability of your analysis.",
    );
  } else {
    sentences.push(
      "Review and clean the data before drawing conclusions from it.",
    );
  }

  return sentences.join(" ");
}

// ─── Recommended actions ──────────────────────────────────────────────────────

interface Action {
  kind: "warning" | "success";
  text: string;
}

function buildActions(file: ParsedFile): Action[] {
  const dq = file.dataQuality;
  if (!dq) return [{ kind: "success", text: "No action required. The dataset is ready for analysis." }];

  const actions: Action[] = [];

  if (dq.duplicateRows > 0) {
    actions.push({
      kind: "warning",
      text: `Remove ${dq.duplicateRows.toLocaleString()} duplicate row${dq.duplicateRows !== 1 ? "s" : ""} to avoid skewed results.`,
    });
  }

  if (dq.missingValues > 0) {
    actions.push({
      kind: "warning",
      text: `Fill or remove ${dq.missingValues.toLocaleString()} missing value${dq.missingValues !== 1 ? "s" : ""} (${dq.missingPercent.toFixed(1)}% of all cells).`,
    });
  }

  if (dq.emptyColumns > 0) {
    actions.push({
      kind: "warning",
      text: `Drop or inspect ${dq.emptyColumns} empty column${dq.emptyColumns !== 1 ? "s" : ""} — they contribute no data.`,
    });
  }

  if (actions.length === 0) {
    actions.push({ kind: "success", text: "No action required. The dataset is ready for analysis." });
  }

  return actions;
}

// ─── Key metrics ──────────────────────────────────────────────────────────────

interface Metric {
  label: string;
  value: string;
  sub?: string;
}

function buildMetrics(file: ParsedFile): Metric[] {
  const dq       = file.dataQuality;
  const dataRows = Math.max(0, file.rowCount - 1);

  return [
    {
      label: "Rows",
      value: dataRows.toLocaleString(),
    },
    {
      label: "Columns",
      value: file.colCount.toLocaleString(),
    },
    {
      label: "Missing Values",
      value: dq ? dq.missingValues.toLocaleString() : "—",
      sub:   dq && dq.missingValues > 0 ? `${dq.missingPercent.toFixed(1)}%` : undefined,
    },
    {
      label: "Duplicate Rows",
      value: dq ? dq.duplicateRows.toLocaleString() : "—",
    },
    {
      label: "Quality Score",
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
  const dq      = file.dataQuality;
  const score   = dq?.qualityScore ?? 0;
  const health  = getHealth(dq ? score : 0);
  const summary = buildSummary(file);
  const actions = buildActions(file);
  const metrics = buildMetrics(file);

  return (
    <div className="mx-6 mt-6 mb-1 rounded-2xl border border-border bg-card overflow-hidden">
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border/60">
        <div className="flex items-center gap-2.5">
          <health.Icon className={cn("w-4 h-4 shrink-0", health.iconCls)} />
          <span className="text-sm font-semibold text-foreground">Dataset Health</span>
          <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold", health.pillCls)}>
            <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", health.dotCls)} />
            {health.label}
          </span>
        </div>
        <span className="text-[10px] font-medium tracking-widest uppercase text-muted-foreground/50 select-none">
          Summary
        </span>
      </div>

      {/* ── Body ── */}
      <div className="flex flex-col gap-0 divide-y divide-border/50">
        {/* Quick summary */}
        <div className="px-5 py-4">
          <p className="text-sm leading-relaxed text-muted-foreground">{summary}</p>
        </div>

        {/* Key metrics */}
        <div className="px-5 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 mb-3">
            Key Metrics
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
            Recommended Actions
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
