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
import type { CategoricalSeries } from "@/types";
import { useLocale } from "@/i18n/context";
import { tpl } from "@/i18n/tpl";
import {
  CHART_COLORS,
  AXIS_TICK_STYLE,
  GRID_STROKE,
  AXIS_STROKE,
  CustomTooltip,
} from "./shared";

interface BarChartViewProps {
  series: CategoricalSeries;
  totalRows: number;
}

export function BarChartView({ series, totalRows }: BarChartViewProps) {
  const { t } = useLocale();
  const vl = t.viz.labels;

  const data = series.topValues.map((item) => ({
    name: truncate(item.name, 18),
    fullName: item.name,
    [vl.count]: item.count,
  }));

  const countKey = vl.count;

  return (
    <div className="flex flex-col gap-3">
      {/* Title */}
      <div className="flex flex-col gap-0.5">
        <h4 className="text-sm font-semibold text-foreground">
          {tpl(t.viz.chartTitles.bar, { col: series.colName })}
        </h4>
        <p className="text-xs text-muted-foreground">
          {tpl(vl.uniqueValues, {
            shown: Math.min(series.topValues.length, series.totalUnique),
            total: series.totalUnique,
          })}{" "}
          · {tpl(vl.totalRows, { n: totalRows.toLocaleString() })}
        </p>
      </div>

      {/* Chart */}
      <div role="img" aria-label={tpl(t.viz.chartTitles.bar, { col: series.colName })}>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart
          data={data}
          margin={{ top: 4, right: 16, left: 0, bottom: series.topValues.length > 6 ? 60 : 8 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} vertical={false} />
          <XAxis
            dataKey="name"
            tick={AXIS_TICK_STYLE}
            stroke={AXIS_STROKE}
            interval={0}
            angle={series.topValues.length > 6 ? -40 : 0}
            textAnchor={series.topValues.length > 6 ? "end" : "middle"}
            height={series.topValues.length > 6 ? 72 : 30}
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
          <Bar dataKey={countKey} radius={[4, 4, 0, 0]} maxBarSize={48}>
            {data.map((_, i) => (
              <Cell
                key={i}
                fill={CHART_COLORS[i % CHART_COLORS.length]}
                fillOpacity={0.9}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      </div>
    </div>
  );
}

function truncate(str: string, max: number): string {
  return str.length > max ? str.slice(0, max - 1) + "…" : str;
}
