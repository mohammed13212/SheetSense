/** Shared constants and primitives for all chart views. */

// ─── Color palette ────────────────────────────────────────────────────────────

export const CHART_COLORS = [
  "#3b82f6", // blue-500
  "#10b981", // emerald-500
  "#f59e0b", // amber-500
  "#8b5cf6", // violet-500
  "#ef4444", // red-500
  "#06b6d4", // cyan-500
  "#ec4899", // pink-500
  "#84cc16", // lime-500
  "#f97316", // orange-500
  "#14b8a6", // teal-500
];

// ─── Axis / grid theme values ─────────────────────────────────────────────────
// These approximate the CSS variables in the current theme without needing
// CSS-variable access inside Recharts (which uses inline styles).

export const AXIS_TICK_STYLE = { fill: "#64748b", fontSize: 11 } as const;
export const GRID_STROKE = "#e2e8f0";
export const AXIS_STROKE = "#cbd5e1";

// ─── Custom tooltip ───────────────────────────────────────────────────────────

interface TooltipPayloadEntry {
  name?: string;
  value?: number | string;
  color?: string;
  fill?: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
  label?: string | number;
  valueFormatter?: (v: number | string) => string;
}

export function CustomTooltip({
  active,
  payload,
  label,
  valueFormatter,
}: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const fmt = valueFormatter ?? ((v) => String(v));
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-lg text-sm max-w-[200px]">
      {label != null && label !== "" && (
        <p className="text-muted-foreground text-xs mb-1.5 font-medium truncate">
          {String(label)}
        </p>
      )}
      {payload.map((entry, i) => (
        <p
          key={i}
          className="font-semibold tabular-nums"
          style={{ color: entry.color ?? entry.fill ?? "#3b82f6" }}
        >
          {entry.name ? `${entry.name}: ` : ""}
          {typeof entry.value === "number" ? fmt(entry.value) : entry.value}
        </p>
      ))}
    </div>
  );
}
