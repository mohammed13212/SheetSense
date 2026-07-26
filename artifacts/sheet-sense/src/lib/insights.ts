/**
 * Insights engine — rule-based today, AI-replaceable tomorrow.
 *
 * To swap in a real AI service, create a new function that satisfies
 * `InsightEngine` and pass it as the `engine` prop to <Insights />.
 * The UI never needs to change.
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

export const ruleBasedEngine: InsightEngine = async (quality, meta, t) => {
  const r = t.insights.rules;
  const insights: Insight[] = [];

  // ── Missing values ──────────────────────────────────────────────────────────
  if (quality.missingPercent === 0) {
    insights.push({
      id: "no-missing",
      kind: "success",
      title: r.noMissingValues.title,
      description: r.noMissingValues.desc,
    });
  } else if (quality.missingPercent <= 5) {
    insights.push({
      id: "minor-missing",
      kind: "warning",
      title: r.minorMissing.title,
      description: tpl(r.minorMissing.desc, {
        pct: quality.missingPercent.toFixed(1),
      }),
    });
  } else if (quality.missingPercent <= 20) {
    insights.push({
      id: "significant-missing",
      kind: "warning",
      title: r.significantMissing.title,
      description: tpl(r.significantMissing.desc, {
        pct: quality.missingPercent.toFixed(1),
        count: quality.missingValues.toLocaleString(),
      }),
    });
  } else {
    insights.push({
      id: "high-missing",
      kind: "warning",
      title: r.highMissing.title,
      description: tpl(r.highMissing.desc, {
        pct: quality.missingPercent.toFixed(1),
        count: quality.missingValues.toLocaleString(),
      }),
    });
  }

  // ── Duplicate rows ──────────────────────────────────────────────────────────
  if (quality.duplicateRows === 0) {
    insights.push({
      id: "no-duplicates",
      kind: "success",
      title: r.noDuplicates.title,
      description: r.noDuplicates.desc,
    });
  } else {
    insights.push({
      id: "duplicates-found",
      kind: "warning",
      title: r.duplicatesFound.title,
      description: tpl(r.duplicatesFound.desc, {
        count: quality.duplicateRows.toLocaleString(),
      }),
    });
  }

  // ── Empty columns ───────────────────────────────────────────────────────────
  if (quality.emptyColumns > 0) {
    insights.push({
      id: "empty-columns",
      kind: "warning",
      title: r.emptyColumnsFound.title,
      description: tpl(r.emptyColumnsFound.desc, {
        count: quality.emptyColumns.toLocaleString(),
      }),
    });
  }

  // ── Column types ────────────────────────────────────────────────────────────
  if (quality.numericColumns > 0) {
    insights.push({
      id: "numeric-available",
      kind: "info",
      title: r.numericAvailable.title,
      description: tpl(r.numericAvailable.desc, {
        count: quality.numericColumns.toLocaleString(),
      }),
    });
  }

  if (quality.textColumns > 0) {
    insights.push({
      id: "text-available",
      kind: "info",
      title: r.textAvailable.title,
      description: tpl(r.textAvailable.desc, {
        count: quality.textColumns.toLocaleString(),
      }),
    });
  }

  // ── Mixed column types ──────────────────────────────────────────────────────
  if (quality.numericColumns > 0 && quality.textColumns > 0) {
    insights.push({
      id: "mixed-dataset",
      kind: "info",
      title: r.mixedDataset.title,
      description: r.mixedDataset.desc,
    });
  }

  // ── Dataset size ────────────────────────────────────────────────────────────
  const dataRows = quality.totalDataRows;
  if (dataRows < 10 && dataRows > 0) {
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

  // ── Overall quality verdict ─────────────────────────────────────────────────
  if (quality.qualityScore >= 80) {
    insights.push({
      id: "ready-for-viz",
      kind: "success",
      title: r.readyForViz.title,
      description: tpl(r.readyForViz.desc, { score: String(quality.qualityScore) }),
    });
  } else if (quality.qualityScore >= 50) {
    insights.push({
      id: "needs-minor-cleaning",
      kind: "info",
      title: r.needsMinorCleaning.title,
      description: tpl(r.needsMinorCleaning.desc, { score: String(quality.qualityScore) }),
    });
  } else {
    insights.push({
      id: "needs-cleaning",
      kind: "warning",
      title: r.needsCleaning.title,
      description: tpl(r.needsCleaning.desc, { score: String(quality.qualityScore) }),
    });
  }

  return insights;
};
