import type { ReactNode } from "react";
import { CheckCircle2, AlertTriangle, Info, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocale } from "@/i18n/context";
import type { ParsedFile } from "@/types";
import type { Insight, InsightKind } from "@/lib/insights";
// ─── Props ────────────────────────────────────────────────────────────────────

interface OverviewTabProps {
  file: ParsedFile;
  insights: Insight[];
  insightsLoading: boolean;
  onViewAllInsights: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function OverviewTab({
  file,
  insights,
  insightsLoading,
  onViewAllInsights,
}: OverviewTabProps) {
  const { t } = useLocale();
  const dq      = file.dataQuality;
  const dataRows = Math.max(0, file.rowCount - 1);
  const topInsights = insights.slice(0, 3);

  return (
    <div className="flex flex-col gap-8 p-6 max-w-3xl">
      {/* ── Stats ── */}
      <div className="grid grid-cols-3 gap-4">
        <StatTile
          label={t.fileStats.rows}
          value={dataRows.toLocaleString()}
        />
        <StatTile
          label={t.fileStats.columns}
          value={file.colCount.toLocaleString()}
        />
        <StatTile
          label={t.fileStats.numericCols}
          value={dq ? dq.numericColumns.toLocaleString() : "—"}
        />
      </div>

      {/* ── Key findings ── */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">
            {t.tabs.topInsights}
          </h3>
          <button
            onClick={onViewAllInsights}
            className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
          >
            {t.tabs.viewAllInsights}
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {insightsLoading ? (
          <div className="flex flex-col gap-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-10 bg-muted/50 rounded-lg animate-pulse"
              />
            ))}
          </div>
        ) : topInsights.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t.tabs.noInsights}</p>
        ) : (
          <div className="flex flex-col gap-1.5">
            {topInsights.map((insight) => (
              <InsightRow key={insight.id} insight={insight} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Stat tile ────────────────────────────────────────────────────────────────

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 flex flex-col gap-1.5">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        {label}
      </p>
      <p className="text-2xl font-bold text-foreground tabular-nums">{value}</p>
    </div>
  );
}

// ─── Quality score ring (compact 44 × 44) ─────────────────────────────────────

function ScoreRing({ score }: { score: number }) {
  const color =
    score >= 80 ? "#10b981" : score >= 50 ? "#f59e0b" : "#ef4444";
  const r = 16;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - score / 100);

  return (
    <div className="relative shrink-0 w-11 h-11">
      <svg
        viewBox="0 0 40 40"
        className="w-full h-full -rotate-90"
        aria-hidden
      >
        <circle
          cx="20"
          cy="20"
          r={r}
          fill="none"
          strokeWidth="4"
          className="stroke-muted/30"
        />
        <circle
          cx="20"
          cy="20"
          r={r}
          fill="none"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ stroke: color, transition: "stroke-dashoffset 0.7s ease-out" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className="text-[11px] font-bold leading-none"
          style={{ color }}
        >
          {score}
        </span>
      </div>
    </div>
  );
}

// ─── Insight row (icon + title only) ─────────────────────────────────────────

const KIND_ICON: Record<InsightKind, (cls: string) => ReactNode> = {
  success: (cls) => <CheckCircle2 className={cn("w-4 h-4 shrink-0 text-emerald-500", cls)} />,
  warning: (cls) => <AlertTriangle className={cn("w-4 h-4 shrink-0 text-amber-500", cls)} />,
  info:    (cls) => <Info          className={cn("w-4 h-4 shrink-0 text-blue-500",  cls)} />,
};

function InsightRow({ insight }: { insight: Insight }) {
  return (
    <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-card border border-border">
      {KIND_ICON[insight.kind]("")}
      <span className="text-sm text-foreground truncate">{insight.title}</span>
    </div>
  );
}
