import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { NumericSeries } from "@/types";
import { useLocale } from "@/i18n/context";
import { tpl } from "@/i18n/tpl";
import {
  CHART_COLORS,
  AXIS_TICK_STYLE,
  GRID_STROKE,
  AXIS_STROKE,
  CustomTooltip,
} from "./shared";

interface HistogramViewProps {
  series: NumericSeries;
  totalRows: number;
}

export function HistogramView({ series, totalRows }: HistogramViewProps) {
  const { t } = useLocale();
  const vl = t.viz.labels;

  // Recharts needs flat objects; map bin data
  const data = series.bins.map((bin) => ({
    name: bin.range,
    [vl.frequency]: bin.count,
  }));

  const freqKey = vl.frequency;
  const maxCount = Math.max(...series.bins.map((b) => b.count));

  return (
    <div className="flex flex-col gap-3">
      {/* Title + stats */}
      <div className="flex flex-col gap-0.5">
        <h4 className="text-sm font-semibold text-foreground">
          {tpl(t.viz.chartTitles.histogram, { col: series.colName })}
        </h4>
        <p className="text-xs text-muted-foreground">
          {tpl(vl.statsLine, {
            min: fmt(series.min),
            mean: fmt(series.mean),
            max: fmt(series.max),
          })}{" "}
          · {tpl(vl.totalRows, { n: totalRows.toLocaleString() })}
        </p>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={320}>
        <BarChart
          data={data}
          margin={{ top: 4, right: 16, left: 0, bottom: 56 }}
          barCategoryGap="4%"
        >
          <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} vertical={false} />
          <XAxis
            dataKey="name"
            tick={AXIS_TICK_STYLE}
            stroke={AXIS_STROKE}
            interval={0}
            angle={-40}
            textAnchor="end"
            height={72}
          />
          <YAxis
            tick={AXIS_TICK_STYLE}
            stroke={AXIS_STROKE}
            allowDecimals={false}
            tickFormatter={(v) => v.toLocaleString()}
            width={40}
          />
          <Tooltip
            content={
              <CustomTooltip
                valueFormatter={(v) =>
                  typeof v === "number" ? v.toLocaleString() : String(v)
                }
              />
            }
            cursor={{ fill: "#f1f5f9" }}
          />
          <Bar dataKey={freqKey} radius={[3, 3, 0, 0]}>
            {data.map((entry, i) => {
              const freq = (entry as any)[freqKey] as number;
              // Shade intensity by frequency
              const intensity = maxCount > 0 ? freq / maxCount : 0;
              const alpha = Math.round(40 + intensity * 210);
              return (
                <Cell
                  key={i}
                  fill={CHART_COLORS[3]}
                  fillOpacity={0.4 + intensity * 0.6}
                />
              );
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function fmt(n: number): string {
  if (!isFinite(n)) return "?";
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  if (Number.isInteger(n)) return String(n);
  return n.toFixed(2);
}
