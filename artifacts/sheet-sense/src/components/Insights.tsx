import { useState, useEffect, useCallback } from "react";
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Info,
  Loader2,
  Lightbulb,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocale } from "@/i18n/context";
import type { DataQuality } from "@/types";
import type { Insight, InsightKind, InsightEngine, FileMeta } from "@/lib/insights";
import { ruleBasedEngine } from "@/lib/insights";

// ─── Kind config ──────────────────────────────────────────────────────────────

const KIND_CONFIG: Record<
  InsightKind,
  {
    borderColor: string;
    iconBg: string;
    icon: (cls: string) => React.ReactNode;
    badge: string;
    labelKey: "success" | "warning" | "info";
  }
> = {
  success: {
    borderColor: "#10b981",
    iconBg: "bg-emerald-50",
    icon: (cls) => <CheckCircle2 className={cn("w-5 h-5 text-emerald-600", cls)} />,
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    labelKey: "success",
  },
  warning: {
    borderColor: "#f59e0b",
    iconBg: "bg-amber-50",
    icon: (cls) => <AlertTriangle className={cn("w-5 h-5 text-amber-600", cls)} />,
    badge: "bg-amber-50 text-amber-700 border-amber-200",
    labelKey: "warning",
  },
  info: {
    borderColor: "#3b82f6",
    iconBg: "bg-blue-50",
    icon: (cls) => <Info className={cn("w-5 h-5 text-blue-600", cls)} />,
    badge: "bg-blue-50 text-blue-700 border-blue-200",
    labelKey: "info",
  },
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface InsightsProps {
  quality: DataQuality;
  meta: FileMeta;
  /**
   * The engine to use for generating insights.
   * Defaults to the rule-based engine.
   * Swap this prop for an AI engine when you're ready — the UI stays the same.
   */
  engine?: InsightEngine;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function Insights({ quality, meta, engine = ruleBasedEngine }: InsightsProps) {
  const { t } = useLocale();

  const [insights, setInsights] = useState<Insight[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");

  const generate = useCallback(async () => {
    setStatus("loading");
    try {
      // Minimum 700 ms so the loading state is perceptible and feels like work
      const [result] = await Promise.all([
        engine(quality, meta, t),
        new Promise((r) => setTimeout(r, 700)),
      ]);
      setInsights(result);
      setStatus("done");
    } catch (err) {
      console.error("Insight generation failed:", err);
      setStatus("done");
    }
  }, [engine, quality, meta, t]);

  // Auto-generate once on mount / whenever quality or locale changes
  useEffect(() => {
    generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quality, t]);

  const isLoading = status === "loading";

  // Counts for the header badge
  const successCount = insights.filter((i) => i.kind === "success").length;
  const warningCount = insights.filter((i) => i.kind === "warning").length;
  const infoCount = insights.filter((i) => i.kind === "info").length;

  return (
    <section className="w-full flex flex-col gap-5" data-testid="insights-section">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2.5">
            <Lightbulb className="w-5 h-5 text-primary shrink-0" />
            <h3 className="text-lg font-semibold text-foreground tracking-tight">
              {t.insights.sectionTitle}
            </h3>
            {status === "done" && insights.length > 0 && (
              <CountBadges
                success={successCount}
                warning={warningCount}
                info={infoCount}
              />
            )}
          </div>
          <p className="text-xs text-muted-foreground ps-7">
            {t.insights.subtitle}
          </p>
        </div>

        {/* Generate button */}
        <button
          onClick={generate}
          disabled={isLoading}
          className={cn(
            "inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 shrink-0 shadow-sm",
            "bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.98]",
            "disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          )}
          data-testid="btn-generate-insights"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin shrink-0" />
          ) : (
            <Sparkles className="w-4 h-4 shrink-0" />
          )}
          <span>{isLoading ? t.insights.generatingLabel : t.insights.generateButton}</span>
        </button>
      </div>

      {/* ── Content ── */}
      {isLoading ? (
        <LoadingSkeleton />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
          {insights.map((insight, i) => (
            <InsightCard key={insight.id} insight={insight} index={i} />
          ))}
        </div>
      )}

      {/* ── Footer attribution ── */}
      {status === "done" && (
        <div className="flex items-center gap-1.5 self-end">
          <RefreshCw className="w-3 h-3 text-muted-foreground/50" />
          <span className="text-[11px] text-muted-foreground/60 font-medium">
            {t.insights.poweredByRules}
          </span>
        </div>
      )}
    </section>
  );
}

// ─── Count badges ─────────────────────────────────────────────────────────────

function CountBadges({
  success,
  warning,
  info,
}: {
  success: number;
  warning: number;
  info: number;
}) {
  return (
    <div className="flex items-center gap-1.5">
      {success > 0 && (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] font-semibold text-emerald-700">
          <CheckCircle2 className="w-2.5 h-2.5" />
          {success}
        </span>
      )}
      {warning > 0 && (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-[10px] font-semibold text-amber-700">
          <AlertTriangle className="w-2.5 h-2.5" />
          {warning}
        </span>
      )}
      {info > 0 && (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-[10px] font-semibold text-blue-700">
          <Info className="w-2.5 h-2.5" />
          {info}
        </span>
      )}
    </div>
  );
}

// ─── Insight card ─────────────────────────────────────────────────────────────

interface InsightCardProps {
  insight: Insight;
  index: number;
}

function InsightCard({ insight, index }: InsightCardProps) {
  const { t } = useLocale();
  const cfg = KIND_CONFIG[insight.kind];

  return (
    <div
      className="relative bg-card border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 animate-in fade-in slide-in-from-bottom-2"
      style={{
        borderInlineStartWidth: "4px",
        borderInlineStartColor: cfg.borderColor,
        borderInlineStartStyle: "solid",
        animationDelay: `${index * 60}ms`,
        animationFillMode: "both",
      }}
      data-testid={`insight-card-${insight.id}`}
    >
      <div className="p-5 flex gap-4">
        {/* Icon */}
        <div
          className={cn(
            "shrink-0 w-9 h-9 rounded-lg flex items-center justify-center mt-0.5",
            cfg.iconBg,
          )}
        >
          {cfg.icon("")}
        </div>

        {/* Body */}
        <div className="flex flex-col gap-1.5 min-w-0 flex-1">
          {/* Kind badge + title */}
          <div className="flex items-start gap-2 flex-wrap">
            <span
              className={cn(
                "shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border uppercase tracking-wide",
                cfg.badge,
              )}
            >
              {t.insights.kindLabel[cfg.labelKey]}
            </span>
            <p className="text-sm font-semibold text-foreground leading-snug">
              {insight.title}
            </p>
          </div>

          {/* Description */}
          <p className="text-sm text-muted-foreground leading-relaxed">
            {insight.description}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="bg-card border border-border rounded-xl p-5 flex gap-4 animate-pulse"
        >
          <div className="shrink-0 w-9 h-9 rounded-lg bg-muted mt-0.5" />
          <div className="flex flex-col gap-2 flex-1">
            <div className="h-3 bg-muted rounded w-1/3" />
            <div className="h-4 bg-muted rounded w-4/5" />
            <div className="h-3 bg-muted rounded w-full" />
            <div className="h-3 bg-muted rounded w-3/4" />
          </div>
        </div>
      ))}
    </div>
  );
}
