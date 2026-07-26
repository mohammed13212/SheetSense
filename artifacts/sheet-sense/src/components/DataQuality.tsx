import type { ReactNode } from "react";
import {
  Hash,
  AlertTriangle,
  Percent,
  Copy,
  EyeOff,
  Info,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Binary,
  Type,
  ShieldCheck,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { DataQuality as DataQualityType } from "@/types";
import { useLocale } from "@/i18n/context";

// ─── Status types ──────────────────────────────────────────────────────────────

type Status = "healthy" | "warning" | "critical";

// Hex values map to status — used for CSS borderInlineStart (RTL-aware)
const STATUS_BORDER_COLOR: Record<Status, string> = {
  healthy: "#10b981",  // emerald-500
  warning: "#f59e0b",  // amber-500
  critical: "#ef4444", // red-500
};

interface StatusConfig {
  badge: string;
  icon: ReactNode;
  valueColor: string;
  pillText: string;
  dot: string;
}

const STATUS_CONFIG: Record<Status, StatusConfig> = {
  healthy: {
    dot: "bg-emerald-500",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />,
    valueColor: "text-foreground",
    pillText: "text-emerald-600",
  },
  warning: {
    dot: "bg-amber-500",
    badge: "bg-amber-50 text-amber-700 border-amber-200",
    icon: <AlertCircle className="w-3.5 h-3.5 text-amber-600" />,
    valueColor: "text-amber-600",
    pillText: "text-amber-600",
  },
  critical: {
    dot: "bg-red-500",
    badge: "bg-red-50 text-red-700 border-red-200",
    icon: <XCircle className="w-3.5 h-3.5 text-red-600" />,
    valueColor: "text-red-600",
    pillText: "text-red-600",
  },
};

// ─── Status helpers ────────────────────────────────────────────────────────────

function getMissingStatus(pct: number): Status {
  if (pct > 20) return "critical";
  if (pct > 5) return "warning";
  return "healthy";
}

function getOverallStatus(statuses: Status[]): Status {
  if (statuses.includes("critical")) return "critical";
  if (statuses.includes("warning")) return "warning";
  return "healthy";
}

function getScoreStatus(score: number): Status {
  if (score >= 80) return "healthy";
  if (score >= 50) return "warning";
  return "critical";
}

function getScoreGradient(score: number): string {
  if (score >= 80) return "from-emerald-500 to-emerald-400";
  if (score >= 50) return "from-amber-500 to-amber-400";
  return "from-red-500 to-red-400";
}

// ─── Component ────────────────────────────────────────────────────────────────

interface DataQualityProps {
  quality?: DataQualityType;
}

export function DataQuality({ quality }: DataQualityProps) {
  const { t } = useLocale();

  if (!quality) return null;

  // Build metric definitions inline so labels/tooltips pick up current locale
  type MetricDef = {
    key: string;
    label: string;
    tooltip: string;
    icon: ReactNode;
    getValue: (q: DataQualityType) => string;
    getStatus: (q: DataQualityType) => Status;
    testId: string;
  };

  const METRICS: MetricDef[] = [
    {
      key: "totalCells",
      label: t.metrics.totalCells.label,
      tooltip: t.metrics.totalCells.tooltip,
      icon: <Hash className="w-4 h-4" />,
      getValue: (q) => q.totalCells.toLocaleString(),
      getStatus: () => "healthy",
      testId: "quality-total-cells",
    },
    {
      key: "missingValues",
      label: t.metrics.missingValues.label,
      tooltip: t.metrics.missingValues.tooltip,
      icon: <AlertTriangle className="w-4 h-4" />,
      getValue: (q) => q.missingValues.toLocaleString(),
      getStatus: (q) => getMissingStatus(q.missingPercent),
      testId: "quality-missing-values",
    },
    {
      key: "missingPercent",
      label: t.metrics.missingPercent.label,
      tooltip: t.metrics.missingPercent.tooltip,
      icon: <Percent className="w-4 h-4" />,
      getValue: (q) => `${q.missingPercent.toFixed(1)}%`,
      getStatus: (q) => getMissingStatus(q.missingPercent),
      testId: "quality-missing-percent",
    },
    {
      key: "duplicateRows",
      label: t.metrics.duplicateRows.label,
      tooltip: t.metrics.duplicateRows.tooltip,
      icon: <Copy className="w-4 h-4" />,
      getValue: (q) => q.duplicateRows.toLocaleString(),
      getStatus: (q) => (q.duplicateRows > 0 ? "warning" : "healthy"),
      testId: "quality-duplicate-rows",
    },
    {
      key: "emptyColumns",
      label: t.metrics.emptyColumns.label,
      tooltip: t.metrics.emptyColumns.tooltip,
      icon: <EyeOff className="w-4 h-4" />,
      getValue: (q) => q.emptyColumns.toLocaleString(),
      getStatus: (q) => (q.emptyColumns > 0 ? "critical" : "healthy"),
      testId: "quality-empty-columns",
    },
    {
      key: "numericColumns",
      label: t.metrics.numericColumns.label,
      tooltip: t.metrics.numericColumns.tooltip,
      icon: <Binary className="w-4 h-4" />,
      getValue: (q) => q.numericColumns.toLocaleString(),
      getStatus: () => "healthy",
      testId: "quality-numeric-columns",
    },
    {
      key: "textColumns",
      label: t.metrics.textColumns.label,
      tooltip: t.metrics.textColumns.tooltip,
      icon: <Type className="w-4 h-4" />,
      getValue: (q) => q.textColumns.toLocaleString(),
      getStatus: () => "healthy",
      testId: "quality-text-columns",
    },
  ];

  const statuses = METRICS.map((m) => m.getStatus(quality));
  const overall = getOverallStatus(statuses);
  const overallCfg = STATUS_CONFIG[overall];
  const scoreStatus = getScoreStatus(quality.qualityScore);

  return (
    <section className="w-full flex flex-col gap-5" data-testid="data-quality-section">
      {/* ── Section header ── */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground tracking-tight">
            {t.quality.sectionTitle}
          </h3>
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${overallCfg.badge}`}
            data-testid="quality-overall-status"
          >
            <span className={`w-1.5 h-1.5 rounded-full ${overallCfg.dot}`} />
            {t.status[overall]}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">{t.quality.hoverHint}</p>
      </div>

      {/* ── Quality Score Banner ── */}
      <QualityScoreBanner score={quality.qualityScore} status={scoreStatus} />

      {/* ── Metric cards grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 w-full">
        {METRICS.map((metric, i) => {
          const status = statuses[i];
          const cfg = STATUS_CONFIG[status];
          return (
            <MetricCard
              key={metric.key}
              label={metric.label}
              tooltip={metric.tooltip}
              icon={metric.icon}
              value={metric.getValue(quality)}
              status={status}
              statusLabel={t.status[status]}
              cfg={cfg}
              borderColor={STATUS_BORDER_COLOR[status]}
              testId={metric.testId}
            />
          );
        })}
      </div>
    </section>
  );
}

// ─── Quality Score Banner ──────────────────────────────────────────────────────

interface QualityScoreBannerProps {
  score: number;
  status: Status;
}

function QualityScoreBanner({ score, status }: QualityScoreBannerProps) {
  const { t } = useLocale();
  const gradient = getScoreGradient(score);
  const cfg = STATUS_CONFIG[status];

  // Map score to a translated label
  const scoreLabelKey: keyof typeof t.scoreLabel =
    score >= 90 ? "excellent"
    : score >= 80 ? "good"
    : score >= 60 ? "fair"
    : score >= 40 ? "poor"
    : "critical";

  return (
    <div
      className="w-full bg-card border border-border rounded-xl overflow-hidden shadow-sm"
      data-testid="quality-score-banner"
    >
      <div className="px-6 py-5 flex flex-col sm:flex-row sm:items-center gap-5">
        {/* Left: score ring + label */}
        <div className="flex items-center gap-5 shrink-0">
          {/* SVG ring — always LTR visually */}
          <div
            className="relative w-20 h-20 shrink-0"
            aria-label={`${t.quality.overallScore}: ${score} ${t.quality.outOf}`}
          >
            <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90" aria-hidden>
              <circle
                cx="40" cy="40" r="32"
                fill="none" strokeWidth="8"
                className="stroke-muted/30"
              />
              <circle
                cx="40" cy="40" r="32"
                fill="none" strokeWidth="8" strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 32}`}
                strokeDashoffset={`${2 * Math.PI * 32 * (1 - score / 100)}`}
                className={`transition-all duration-700 ease-out ${
                  status === "healthy" ? "stroke-emerald-500"
                  : status === "warning" ? "stroke-amber-500"
                  : "stroke-red-500"
                }`}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-xl font-bold leading-none ${cfg.valueColor}`}>{score}</span>
              <span className="text-[10px] text-muted-foreground font-medium mt-0.5">
                {t.quality.outOf}
              </span>
            </div>
          </div>

          {/* Label block */}
          <div className="flex flex-col gap-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {t.quality.overallScore}
            </p>
            <p className={`text-2xl font-bold tracking-tight ${cfg.valueColor}`}>
              {t.scoreLabel[scoreLabelKey]}
            </p>
            <span
              className={`self-start inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${cfg.badge}`}
            >
              {cfg.icon}
              {t.status[status]}
            </span>
          </div>
        </div>

        {/* Right: progress bar */}
        <div className="flex-1 flex flex-col gap-2 min-w-0">
          <div className="flex justify-between items-center text-xs text-muted-foreground">
            <span>{t.quality.scoreBreakdown}</span>
            <span className={`font-semibold ${cfg.valueColor}`}>{score}%</span>
          </div>

          <div className="relative h-3 w-full rounded-full bg-muted/40 overflow-hidden">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${gradient} transition-all duration-700 ease-out`}
              style={{ width: `${score}%` }}
              role="progressbar"
              aria-valuenow={score}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>

          {/* Threshold markers — always LTR so 0 is on the left */}
          <div className="relative flex text-[10px] text-muted-foreground font-medium select-none mt-0.5" dir="ltr">
            <span className="absolute left-0">0</span>
            <span className="absolute" style={{ left: "50%" }}>50</span>
            <span className="absolute" style={{ left: "80%" }}>80</span>
            <span className="absolute right-0">100</span>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-3 mt-1 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
              {t.quality.legendCritical}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
              {t.quality.legendWarning}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              {t.quality.legendHealthy}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MetricCard ───────────────────────────────────────────────────────────────

interface MetricCardProps {
  label: string;
  tooltip: string;
  icon: ReactNode;
  value: string;
  status: Status;
  statusLabel: string;
  cfg: StatusConfig;
  borderColor: string;
  testId: string;
}

function MetricCard({ label, tooltip, icon, value, status, statusLabel, cfg, borderColor, testId }: MetricCardProps) {
  const iconColor =
    status === "critical" ? "text-red-500"
    : status === "warning" ? "text-amber-500"
    : "text-primary";

  return (
    <div
      className="relative bg-card border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200"
      style={{
        borderInlineStartWidth: "4px",
        borderInlineStartColor: borderColor,
        borderInlineStartStyle: "solid",
      }}
      data-testid={testId}
    >
      <div className="p-5 flex flex-col gap-3">
        {/* Top row: icon + label + tooltip */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className={`shrink-0 ${iconColor}`}>{icon}</span>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider truncate">
              {label}
            </span>
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                className="shrink-0 text-muted-foreground/40 hover:text-muted-foreground transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded"
                aria-label={`Info: ${label}`}
                data-testid={`${testId}-info`}
              >
                <Info className="w-3.5 h-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent
              side="top"
              className="max-w-[220px] text-center leading-snug bg-popover text-popover-foreground border border-border shadow-md"
            >
              {tooltip}
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Value */}
        <p
          className={`text-2xl font-bold tracking-tight leading-none ${cfg.valueColor}`}
          data-testid={`${testId}-value`}
        >
          {value}
        </p>

        {/* Status pill */}
        <div className="flex items-center gap-1.5">
          {cfg.icon}
          <span className={`text-xs font-medium ${cfg.pillText}`}>
            {statusLabel}
          </span>
        </div>
      </div>
    </div>
  );
}
