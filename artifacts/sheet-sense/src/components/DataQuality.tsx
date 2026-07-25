import type { ReactNode } from "react";
import { Hash, AlertTriangle, Percent, Copy, EyeOff } from "lucide-react";
import type { DataQuality as DataQualityType } from "@/types";

interface DataQualityProps {
  quality: DataQualityType;
}

export function DataQuality({ quality }: DataQualityProps) {
  if (!quality) return null;
  const { totalCells, missingValues, missingPercent, duplicateRows, emptyColumns } = quality;

  const missingColor =
    missingPercent > 20 ? "text-destructive" :
    missingPercent > 5  ? "text-amber-600 dark:text-amber-400" :
    undefined;

  const duplicateColor = duplicateRows > 0 ? "text-amber-600 dark:text-amber-400" : undefined;
  const emptyColColor  = emptyColumns  > 0 ? "text-amber-600 dark:text-amber-400" : undefined;

  return (
    <div className="w-full flex flex-col gap-3" data-testid="data-quality-section">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-foreground tracking-tight">
          Data Quality
        </h3>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 w-full">
        <QualityCard
          icon={<Hash className="w-5 h-5 text-primary" />}
          label="Total Cells"
          value={totalCells.toLocaleString()}
          testId="quality-total-cells"
        />
        <QualityCard
          icon={<AlertTriangle className="w-5 h-5 text-primary" />}
          label="Missing Values"
          value={missingValues.toLocaleString()}
          valueClass={missingColor}
          testId="quality-missing-values"
        />
        <QualityCard
          icon={<Percent className="w-5 h-5 text-primary" />}
          label="Missing %"
          value={`${missingPercent.toFixed(1)}%`}
          valueClass={missingColor}
          testId="quality-missing-percent"
        />
        <QualityCard
          icon={<Copy className="w-5 h-5 text-primary" />}
          label="Duplicate Rows"
          value={duplicateRows.toLocaleString()}
          valueClass={duplicateColor}
          testId="quality-duplicate-rows"
        />
        <QualityCard
          icon={<EyeOff className="w-5 h-5 text-primary" />}
          label="Empty Columns"
          value={emptyColumns.toLocaleString()}
          valueClass={emptyColColor}
          testId="quality-empty-columns"
        />
      </div>
    </div>
  );
}

function QualityCard({
  icon,
  label,
  value,
  valueClass,
  testId,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  valueClass?: string;
  testId: string;
}) {
  return (
    <div
      className="bg-card border border-card-border rounded-xl p-5 flex items-start gap-4 shadow-sm hover:shadow-md transition-shadow duration-200"
      data-testid={testId}
    >
      <div className="mt-0.5 shrink-0 bg-primary/10 p-2 rounded-lg">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
          {label}
        </p>
        <p className={`text-base font-semibold truncate ${valueClass ?? "text-foreground"}`} title={value} data-testid={`${testId}-value`}>
          {value}
        </p>
      </div>
    </div>
  );
}
