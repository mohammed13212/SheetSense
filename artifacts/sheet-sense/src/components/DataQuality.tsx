import type { ReactNode } from "react";
import { Hash, AlertTriangle, Percent, Copy, EyeOff, Info, CheckCircle2, AlertCircle, XCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { DataQuality as DataQualityType } from "@/types";

// ─── Status types & helpers ────────────────────────────────────────────────

type Status = "healthy" | "warning" | "critical";

const STATUS_CONFIG: Record<Status, {
  label: string;
  dot: string;
  badge: string;
  border: string;
  iconBg: string;
  icon: ReactNode;
}> = {
  healthy: {
    label: "Healthy",
    dot: "bg-emerald-500",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800",
    border: "border-l-emerald-500",
    iconBg: "bg-emerald-50 dark:bg-emerald-950",
    icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />,
  },
  warning: {
    label: "Warning",
    dot: "bg-amber-500",
    badge: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800",
    border: "border-l-amber-500",
    iconBg: "bg-amber-50 dark:bg-amber-950",
    icon: <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />,
  },
  critical: {
    label: "Critical",
    dot: "bg-red-500",
    badge: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800",
    border: "border-l-red-500",
    iconBg: "bg-red-50 dark:bg-red-950",
    icon: <XCircle className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />,
  },
};

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

// ─── Metric definitions ────────────────────────────────────────────────────

interface MetricDef {
  key: string;
  label: string;
  tooltip: string;
  icon: ReactNode;
  getValue: (q: DataQualityType) => string;
  getStatus: (q: DataQualityType) => Status;
  testId: string;
}

const METRICS: MetricDef[] = [
  {
    key: "totalCells",
    label: "Total Cells",
    tooltip: "The total number of data cells analyzed, calculated as rows × columns (header row excluded).",
    icon: <Hash className="w-4 h-4" />,
    getValue: (q) => q.totalCells.toLocaleString(),
    getStatus: () => "healthy",
    testId: "quality-total-cells",
  },
  {
    key: "missingValues",
    label: "Missing Values",
    tooltip: "Count of cells with no value (null, empty string, or undefined). High counts may indicate data entry issues or export problems.",
    icon: <AlertTriangle className="w-4 h-4" />,
    getValue: (q) => q.missingValues.toLocaleString(),
    getStatus: (q) => getMissingStatus(q.missingPercent),
    testId: "quality-missing-values",
  },
  {
    key: "missingPercent",
    label: "Missing %",
    tooltip: "Percentage of cells with missing data. Above 5% is a warning; above 20% is critical and may significantly affect analysis.",
    icon: <Percent className="w-4 h-4" />,
    getValue: (q) => `${q.missingPercent.toFixed(1)}%`,
    getStatus: (q) => getMissingStatus(q.missingPercent),
    testId: "quality-missing-percent",
  },
  {
    key: "duplicateRows",
    label: "Duplicate Rows",
    tooltip: "Rows where all column values are identical to another row. Duplicates can skew aggregations and should be reviewed.",
    icon: <Copy className="w-4 h-4" />,
    getValue: (q) => q.duplicateRows.toLocaleString(),
    getStatus: (q) => (q.duplicateRows > 0 ? "warning" : "healthy"),
    testId: "quality-duplicate-rows",
  },
  {
    key: "emptyColumns",
    label: "Empty Columns",
    tooltip: "Columns where every data row is blank. These columns carry no information and are likely safe to remove.",
    icon: <EyeOff className="w-4 h-4" />,
    getValue: (q) => q.emptyColumns.toLocaleString(),
    getStatus: (q) => (q.emptyColumns > 0 ? "critical" : "healthy"),
    testId: "quality-empty-columns",
  },
];

// ─── Component ─────────────────────────────────────────────────────────────

interface DataQualityProps {
  quality?: DataQualityType;
}

export function DataQuality({ quality }: DataQualityProps) {
  if (!quality) return null;

  const statuses = METRICS.map((m) => m.getStatus(quality));
  const overall = getOverallStatus(statuses);
  const overallCfg = STATUS_CONFIG[overall];

  return (
    <section className="w-full flex flex-col gap-4" data-testid="data-quality-section">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2.5">
          <h3 className="text-lg font-semibold text-foreground tracking-tight">
            Data Quality
          </h3>
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${overallCfg.badge}`}
            data-testid="quality-overall-status"
          >
            <span className={`w-1.5 h-1.5 rounded-full ${overallCfg.dot}`} />
            {overallCfg.label}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          Hover each metric for details
        </p>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 w-full">
        {METRICS.map((metric, i) => {
          const status = statuses[i];
          const cfg = STATUS_CONFIG[status];
          const value = metric.getValue(quality);
          return (
            <MetricCard
              key={metric.key}
              label={metric.label}
              tooltip={metric.tooltip}
              icon={metric.icon}
              value={value}
              status={status}
              cfg={cfg}
              testId={metric.testId}
            />
          );
        })}
      </div>
    </section>
  );
}

// ─── MetricCard ────────────────────────────────────────────────────────────

interface MetricCardProps {
  label: string;
  tooltip: string;
  icon: ReactNode;
  value: string;
  status: Status;
  cfg: typeof STATUS_CONFIG[Status];
  testId: string;
}

function MetricCard({ label, tooltip, icon, value, status, cfg, testId }: MetricCardProps) {
  const valueColor =
    status === "critical"
      ? "text-red-600 dark:text-red-400"
      : status === "warning"
      ? "text-amber-600 dark:text-amber-400"
      : "text-foreground";

  const iconColor =
    status === "critical"
      ? "text-red-500 dark:text-red-400"
      : status === "warning"
      ? "text-amber-500 dark:text-amber-400"
      : "text-primary";

  return (
    <div
      className={`relative bg-card border border-card-border border-l-4 ${cfg.border} rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 group`}
      data-testid={testId}
    >
      <div className="p-5 flex flex-col gap-3">
        {/* Top row: icon + label + info tooltip */}
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
                aria-label={`Info about ${label}`}
                data-testid={`${testId}-info`}
              >
                <Info className="w-3.5 h-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent
              side="top"
              className="max-w-[220px] text-center leading-snug bg-popover text-popover-foreground border border-popover-border shadow-md"
            >
              {tooltip}
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Value */}
        <p
          className={`text-2xl font-bold tracking-tight leading-none ${valueColor}`}
          data-testid={`${testId}-value`}
        >
          {value}
        </p>

        {/* Status pill */}
        <div className="flex items-center gap-1.5">
          {cfg.icon}
          <span className={`text-xs font-medium ${
            status === "critical"
              ? "text-red-600 dark:text-red-400"
              : status === "warning"
              ? "text-amber-600 dark:text-amber-400"
              : "text-emerald-600 dark:text-emerald-400"
          }`}>
            {cfg.label}
          </span>
        </div>
      </div>
    </div>
  );
}
