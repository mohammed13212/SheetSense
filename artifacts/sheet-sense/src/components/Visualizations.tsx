import { useState, useEffect } from "react";
import { BarChart2, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocale } from "@/i18n/context";
import type { ChartData, CategoricalSeries, NumericSeries } from "@/types";
import { BarChartView } from "./charts/BarChartView";
import { PieChartView } from "./charts/PieChartView";
import { LineChartView } from "./charts/LineChartView";
import { HistogramView } from "./charts/HistogramView";

// ─── Types ────────────────────────────────────────────────────────────────────

type ChartType = "bar" | "pie" | "line" | "histogram";

interface TabDef {
  type: ChartType;
  needsCategorical: boolean;
}

const TAB_DEFS: TabDef[] = [
  { type: "bar",       needsCategorical: true  },
  { type: "pie",       needsCategorical: true  },
  { type: "line",      needsCategorical: false },
  { type: "histogram", needsCategorical: false },
];

// ─── Props ────────────────────────────────────────────────────────────────────

interface VisualizationsProps {
  chartData?: ChartData;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function Visualizations({ chartData }: VisualizationsProps) {
  const { t } = useLocale();

  const hasCat = (chartData?.categorical.length ?? 0) > 0;
  const hasNum = (chartData?.numeric.length ?? 0) > 0;

  const availableTabs = TAB_DEFS.filter((td) =>
    td.needsCategorical ? hasCat : hasNum,
  );

  const [activeType, setActiveType] = useState<ChartType>(
    availableTabs[0]?.type ?? "bar",
  );
  const [catIdx, setCatIdx] = useState(0);
  const [numIdx, setNumIdx] = useState(0);

  // Reset selected indices when chartData changes (new file)
  useEffect(() => {
    setCatIdx(0);
    setNumIdx(0);
    const first = TAB_DEFS.find((td) =>
      td.needsCategorical ? hasCat : hasNum,
    );
    if (first) setActiveType(first.type);
  }, [chartData]); // eslint-disable-line react-hooks/exhaustive-deps

  const isCategoricalChart = activeType === "bar" || activeType === "pie";
  const isNumericChart = activeType === "line" || activeType === "histogram";

  const catSeries: CategoricalSeries | undefined =
    chartData?.categorical[catIdx];
  const numSeries: NumericSeries | undefined = chartData?.numeric[numIdx];

  const totalRows = chartData?.totalRows ?? 0;

  // Guard: nothing to show
  if (!chartData || (!hasCat && !hasNum)) {
    return (
      <section
        className="w-full flex flex-col gap-5"
        data-testid="visualizations-section"
      >
        <SectionHeader count={0} />
        <div className="w-full border border-border rounded-xl bg-card flex items-center justify-center h-40 text-sm text-muted-foreground">
          {t.viz.noData}
        </div>
      </section>
    );
  }

  return (
    <section
      className="w-full flex flex-col gap-5"
      data-testid="visualizations-section"
    >
      <SectionHeader count={availableTabs.length} />

      {/* ── Main card ── */}
      <div className="w-full bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        {/* Tab bar */}
        <div className="flex items-center gap-1 p-3 border-b border-border bg-muted/30 overflow-x-auto">
          {availableTabs.map((tab) => (
            <button
              key={tab.type}
              onClick={() => setActiveType(tab.type)}
              className={cn(
                "shrink-0 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-150",
                activeType === tab.type
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
              data-testid={`tab-${tab.type}`}
            >
              {t.viz.chartTypes[tab.type]}
            </button>
          ))}

          {/* Column selector — pushed to right */}
          <div className="ms-auto shrink-0">
            {isCategoricalChart && chartData.categorical.length > 1 && (
              <ColumnSelect
                label={t.viz.selectColumn}
                options={chartData.categorical.map((s) => s.colName)}
                value={catIdx}
                onChange={setCatIdx}
              />
            )}
            {isNumericChart && chartData.numeric.length > 1 && (
              <ColumnSelect
                label={t.viz.selectColumn}
                options={chartData.numeric.map((s) => s.colName)}
                value={numIdx}
                onChange={setNumIdx}
              />
            )}
          </div>
        </div>

        {/* Chart body */}
        <div className="p-5">
          {activeType === "bar" && catSeries && (
            <BarChartView series={catSeries} totalRows={totalRows} />
          )}
          {activeType === "pie" && catSeries && (
            <PieChartView series={catSeries} totalRows={totalRows} />
          )}
          {activeType === "line" && numSeries && (
            <LineChartView series={numSeries} totalRows={totalRows} />
          )}
          {activeType === "histogram" && numSeries && (
            <HistogramView series={numSeries} totalRows={totalRows} />
          )}

          {/* Fallback if selected series is missing */}
          {((isCategoricalChart && !catSeries) ||
            (isNumericChart && !numSeries)) && (
            <div className="flex items-center justify-center h-40 text-sm text-muted-foreground">
              {t.viz.noData}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// ─── Section header ───────────────────────────────────────────────────────────

function SectionHeader({ count }: { count: number }) {
  const { t } = useLocale();
  return (
    <div className="flex items-center justify-between gap-3 flex-wrap">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2.5">
          <BarChart2 className="w-5 h-5 text-primary shrink-0" />
          <h3 className="text-lg font-semibold text-foreground tracking-tight">
            {t.viz.sectionTitle}
          </h3>
          {count > 0 && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary/10 text-primary border border-primary/20">
              {count}
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground ps-7">{t.viz.subtitle}</p>
      </div>
    </div>
  );
}

// ─── Column selector ──────────────────────────────────────────────────────────

interface ColumnSelectProps {
  label: string;
  options: string[];
  value: number;
  onChange: (idx: number) => void;
}

function ColumnSelect({ label, options, value, onChange }: ColumnSelectProps) {
  return (
    <div className="relative inline-flex items-center gap-1.5">
      <span className="text-xs text-muted-foreground font-medium hidden sm:inline">
        {label}:
      </span>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="appearance-none bg-card border border-border rounded-lg ps-3 pe-7 py-1.5 text-sm font-medium text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer pr-7"
        >
          {options.map((opt, i) => (
            <option key={i} value={i}>
              {opt.length > 22 ? opt.slice(0, 21) + "…" : opt}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
      </div>
    </div>
  );
}
