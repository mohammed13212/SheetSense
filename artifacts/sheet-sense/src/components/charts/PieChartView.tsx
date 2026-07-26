import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { CategoricalSeries } from "@/types";
import { useLocale } from "@/i18n/context";
import { tpl } from "@/i18n/tpl";
import { CHART_COLORS, CustomTooltip } from "./shared";

// Show at most 8 slices; fold the rest into "Other"
const MAX_SLICES = 8;

interface PieChartViewProps {
  series: CategoricalSeries;
  totalRows: number;
}

export function PieChartView({ series, totalRows }: PieChartViewProps) {
  const { t } = useLocale();
  const vl = t.viz.labels;

  const top = series.topValues.slice(0, MAX_SLICES);
  const restCount = series.topValues
    .slice(MAX_SLICES)
    .reduce((s, v) => s + v.count, 0);

  const data = [
    ...top.map((v) => ({ name: v.name, value: v.count })),
    ...(restCount > 0 ? [{ name: vl.other, value: restCount }] : []),
  ];

  const total = data.reduce((s, d) => s + d.value, 0);

  const renderLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }: any) => {
    if (percent < 0.05) return null; // skip tiny slices
    const RADIAN = Math.PI / 180;
    const r = innerRadius + (outerRadius - innerRadius) * 0.55;
    const x = cx + r * Math.cos(-midAngle * RADIAN);
    const y = cy + r * Math.sin(-midAngle * RADIAN);
    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={11}
        fontWeight={600}
      >
        {(percent * 100).toFixed(0)}%
      </text>
    );
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Title */}
      <div className="flex flex-col gap-0.5">
        <h4 className="text-sm font-semibold text-foreground">
          {tpl(t.viz.chartTitles.pie, { col: series.colName })}
        </h4>
        <p className="text-xs text-muted-foreground">
          {tpl(vl.uniqueValues, {
            shown: Math.min(top.length, series.totalUnique),
            total: series.totalUnique,
          })}{" "}
          · {tpl(vl.totalRows, { n: totalRows.toLocaleString() })}
        </p>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={320}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="46%"
            outerRadius={110}
            dataKey="value"
            labelLine={false}
            label={renderLabel}
          >
            {data.map((_, i) => (
              <Cell
                key={i}
                fill={CHART_COLORS[i % CHART_COLORS.length]}
                stroke="white"
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Tooltip
            content={
              <CustomTooltip
                valueFormatter={(v) =>
                  typeof v === "number"
                    ? `${v.toLocaleString()} (${total > 0 ? ((v / total) * 100).toFixed(1) : 0}%)`
                    : String(v)
                }
              />
            }
          />
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
            formatter={(value) =>
              value.length > 24 ? value.slice(0, 23) + "…" : value
            }
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
