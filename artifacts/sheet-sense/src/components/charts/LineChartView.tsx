import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
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

interface LineChartViewProps {
  series: NumericSeries;
  totalRows: number;
}

export function LineChartView({ series, totalRows }: LineChartViewProps) {
  const { t } = useLocale();
  const vl = t.viz.labels;
  const isSampled = series.linePoints.length < totalRows;

  return (
    <div className="flex flex-col gap-3">
      {/* Title + stats */}
      <div className="flex flex-col gap-0.5">
        <h4 className="text-sm font-semibold text-foreground">
          {tpl(t.viz.chartTitles.line, { col: series.colName })}
        </h4>
        <p className="text-xs text-muted-foreground">
          {tpl(vl.statsLine, {
            min: fmt(series.min),
            mean: fmt(series.mean),
            max: fmt(series.max),
          })}
          {isSampled && (
            <>
              {" "}·{" "}
              {tpl(vl.sampledPoints, {
                n: series.linePoints.length.toLocaleString(),
              })}
            </>
          )}
        </p>
      </div>

      {/* Chart */}
      <div role="img" aria-label={tpl(t.viz.chartTitles.line, { col: series.colName })}>
      <ResponsiveContainer width="100%" height={320}>
        <LineChart
          data={series.linePoints}
          margin={{ top: 4, right: 16, left: 0, bottom: 8 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} />
          <XAxis
            dataKey="i"
            tick={AXIS_TICK_STYLE}
            stroke={AXIS_STROKE}
            tickFormatter={(v) => v.toLocaleString()}
            label={{
              value: vl.row,
              position: "insideBottomRight",
              offset: -4,
              style: { fontSize: 10, fill: "#94a3b8" },
            }}
          />
          <YAxis
            tick={AXIS_TICK_STYLE}
            stroke={AXIS_STROKE}
            tickFormatter={(v) => fmt(v)}
            width={52}
          />
          <Tooltip
            content={
              <CustomTooltip
                valueFormatter={(v) =>
                  typeof v === "number" ? fmt(v) : String(v)
                }
              />
            }
          />
          {/* Mean reference line */}
          <ReferenceLine
            y={series.mean}
            stroke={CHART_COLORS[1]}
            strokeDasharray="4 4"
            strokeWidth={1.5}
          />
          <Line
            type="monotone"
            dataKey="v"
            name={series.colName}
            stroke={CHART_COLORS[0]}
            strokeWidth={1.5}
            dot={false}
            activeDot={{ r: 4, fill: CHART_COLORS[0] }}
          />
        </LineChart>
      </ResponsiveContainer>
      </div>
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
