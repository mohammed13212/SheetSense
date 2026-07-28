/**
 * Insights engine — rule-based today, AI-replaceable tomorrow.
 *
 * To swap in a real AI service, create a new function that satisfies
 * `InsightEngine` and pass it as the `engine` prop to <Insights />.
 * The UI never needs to change.
 *
 * Design principle: insights are practical RECOMMENDATIONS, not quality checks.
 * Quality checks (missing values, duplicates, etc.) belong in the Summary Card.
 * Here we only surface:
 *   1. Actionable warnings — emitted only when the problem is actually present
 *   2. Size observations — only when dataset size is notably small or large
 *   3. Next-step recommendations — what the user should DO with this data
 *   4. A single readiness verdict — one of: ready / mostly ready / needs cleaning
 */

import type { DataQuality } from "@/types";
import type { Translations } from "@/i18n/types";
import { tpl } from "@/i18n/tpl";

// ─── Public types ─────────────────────────────────────────────────────────────

export type InsightKind = "success" | "warning" | "info";

export interface Insight {
  /** Stable ID — used as React key and for deduplication. */
  id: string;
  kind: InsightKind;
  title: string;
  description: string;
}

export interface FileMeta {
  fileName: string;
  rowCount: number;
  colCount: number;
}

/**
 * The engine contract.
 * Returns a Promise so async AI engines plug in without any interface change.
 */
export type InsightEngine = (
  quality: DataQuality,
  meta: FileMeta,
  t: Translations,
) => Promise<Insight[]>;

// ─── Rule-based engine ────────────────────────────────────────────────────────

export const ruleBasedEngine: InsightEngine = async (quality, _meta, t) => {
  const r = t.insights.rules;
  const insights: Insight[] = [];

  // ── Section 1: Actionable data quality warnings ────────────────────────────
  // These are emitted only when the problem is actually present.
  // "No missing values" and "no duplicates" are NOT surfaced here —
  // those confirmations belong in the Summary Card, not Insights.

  if (quality.missingPercent > 20) {
    insights.push({
      id: "high-missing",
      kind: "warning",
      title: r.highMissing.title,
      description: tpl(r.highMissing.desc, {
        pct:   quality.missingPercent.toFixed(1),
        count: quality.missingValues.toLocaleString(),
      }),
    });
  } else if (quality.missingPercent > 5) {
    insights.push({
      id: "significant-missing",
      kind: "warning",
      title: r.significantMissing.title,
      description: tpl(r.significantMissing.desc, {
        pct:   quality.missingPercent.toFixed(1),
        count: quality.missingValues.toLocaleString(),
      }),
    });
  } else if (quality.missingPercent > 0) {
    insights.push({
      id: "minor-missing",
      kind: "warning",
      title: r.minorMissing.title,
      description: tpl(r.minorMissing.desc, { pct: quality.missingPercent.toFixed(1) }),
    });
  }

  if (quality.duplicateRows > 0) {
    insights.push({
      id: "duplicates-found",
      kind: "warning",
      title: r.duplicatesFound.title,
      description: tpl(r.duplicatesFound.desc, { count: quality.duplicateRows.toLocaleString() }),
    });
  }

  if (quality.emptyColumns > 0) {
    insights.push({
      id: "empty-columns",
      kind: "warning",
      title: r.emptyColumnsFound.title,
      description: tpl(r.emptyColumnsFound.desc, { count: quality.emptyColumns.toLocaleString() }),
    });
  }

  // ── Section 2: Size observations ──────────────────────────────────────────
  const dataRows = quality.totalDataRows;

  if (dataRows > 0 && dataRows < 10) {
    insights.push({
      id: "small-dataset",
      kind: "info",
      title: r.smallDataset.title,
      description: tpl(r.smallDataset.desc, { count: dataRows.toLocaleString() }),
    });
  } else if (dataRows > 10_000) {
    insights.push({
      id: "large-dataset",
      kind: "info",
      title: r.largeDataset.title,
      description: tpl(r.largeDataset.desc, { count: dataRows.toLocaleString() }),
    });
  }

  // ── Section 3: Practical next-step recommendations ────────────────────────
  const hasNumeric = quality.numericColumns > 0;
  const hasText    = quality.textColumns    > 0;

  if (hasNumeric && !hasText) {
    insights.push({
      id: "numeric-dataset",
      kind: "info",
      title: r.numericDataset.title,
      description: tpl(r.numericDataset.desc, { count: quality.numericColumns.toLocaleString() }),
    });
  } else if (hasNumeric && hasText) {
    insights.push({
      id: "categorical-possible",
      kind: "info",
      title: r.categoricalPossible.title,
      description: r.categoricalPossible.desc,
    });
  } else if (!hasNumeric && hasText) {
    insights.push({
      id: "text-only-dataset",
      kind: "info",
      title: r.textOnlyDataset.title,
      description: r.textOnlyDataset.desc,
    });
  }

  // ── Section 4: Readiness verdict — exactly one fires ─────────────────────
  const hasWarnings = insights.some((i) => i.kind === "warning");

  if (!hasWarnings && quality.qualityScore >= 80) {
    // Clean dataset, no issues — celebrate and direct the user to Charts
    insights.push({
      id: "ready-for-viz",
      kind: "success",
      title: r.readyForViz.title,
      description: r.readyForViz.desc,
    });
  } else if (quality.qualityScore >= 50) {
    // Usable but imperfect
    insights.push({
      id: "ready-with-issues",
      kind: "info",
      title: r.readyWithIssues.title,
      description: r.readyWithIssues.desc,
    });
  } else {
    // Score too low — cleaning should come first
    insights.push({
      id: "needs-cleaning",
      kind: "warning",
      title: r.needsCleaning.title,
      description: r.needsCleaning.desc,
    });
  }

  return insights;
};
