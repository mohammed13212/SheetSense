import { useState, type ReactNode } from "react";
import {
  CheckCircle2,
  AlertTriangle,
  Info,
  Loader2,
  Sparkles,
  RefreshCw,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocale } from "@/i18n/context";
import type { Insight, InsightKind } from "@/lib/insights";

// ─── Kind config ──────────────────────────────────────────────────────────────

type KindConfig = {
  icon: (cls: string) => ReactNode;
  badge: string;
  labelKey: "success" | "warning" | "info";
};

const KIND_CONFIG: Record<InsightKind, KindConfig> = {
  success: {
    icon: (cls) => <CheckCircle2 className={cn("w-4 h-4 text-emerald-500", cls)} />,
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    labelKey: "success",
  },
  warning: {
    icon: (cls) => <AlertTriangle className={cn("w-4 h-4 text-amber-500", cls)} />,
    badge: "bg-amber-50 text-amber-700 border-amber-200",
    labelKey: "warning",
  },
  info: {
    icon: (cls) => <Info className={cn("w-4 h-4 text-blue-500", cls)} />,
    badge: "bg-blue-50 text-blue-700 border-blue-200",
    labelKey: "info",
  },
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface InsightsTabProps {
  insights: Insight[];
  status: "idle" | "loading" | "done";
  onRegenerate: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function InsightsTab({ insights, status, onRegenerate }: InsightsTabProps) {
  const { t } = useLocale();
  const isLoading = status === "loading";

  return (
    <div className="flex flex-col gap-5 p-6">
      {/* Header row */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <p className="text-sm text-muted-foreground">
            {t.insights.subtitle}
          </p>
          {status === "done" && insights.length > 0 && (
            <CountBadges insights={insights} />
          )}
        </div>

        <button
          onClick={onRegenerate}
          disabled={isLoading}
          className={cn(
            "inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 shrink-0",
            "bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.98]",
            "disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          )}
          data-testid="btn-generate-insights"
        >
          {isLoading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
          ) : (
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
          )}
          <span>
            {isLoading ? t.insights.generatingLabel : t.insights.generateButton}
          </span>
        </button>
      </div>

      {/* Content */}
      {isLoading ? (
        <LoadingSkeleton />
      ) : insights.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-14 gap-3 text-center">
          <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          </div>
          <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
            {t.tabs.insightsEmpty}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {insights.map((insight, i) => (
            <InsightCard key={insight.id} insight={insight} index={i} />
          ))}
        </div>
      )}

      {/* Attribution */}
      {status === "done" && (
        <div className="flex items-center gap-1.5 self-end pt-1">
          <RefreshCw className="w-3 h-3 text-muted-foreground/40" />
          <span className="text-[11px] text-muted-foreground/50 font-medium">
            {t.insights.poweredByRules}
          </span>
        </div>
      )}
    </div>
  );
}

// ─── Compact insight card ─────────────────────────────────────────────────────

function InsightCard({ insight, index }: { insight: Insight; index: number }) {
  const { t } = useLocale();
  const [expanded, setExpanded] = useState(false);
  const cfg = KIND_CONFIG[insight.kind];

  return (
    <div
      className="bg-card border border-border rounded-xl overflow-hidden animate-in fade-in slide-in-from-bottom-1"
      style={{
        animationDelay: `${index * 40}ms`,
        animationFillMode: "both",
      }}
      data-testid={`insight-card-${insight.id}`}
    >
      <div className="px-4 py-3 flex items-start gap-3">
        {/* Icon */}
        <div className="mt-0.5 shrink-0">{cfg.icon("")}</div>

        {/* Body */}
        <div className="flex-1 min-w-0">
          {/* Kind badge + title */}
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span
              className={cn(
                "shrink-0 inline-flex items-center px-1.5 py-px rounded-full text-[10px] font-semibold border uppercase tracking-wide",
                cfg.badge,
              )}
            >
              {t.insights.kindLabel[cfg.labelKey]}
            </span>
            <p className="text-sm font-semibold text-foreground leading-snug">
              {insight.title}
            </p>
          </div>

          {/* Description — clamped to 2 lines unless expanded */}
          <p
            className={cn(
              "text-sm text-muted-foreground leading-relaxed",
              !expanded && "line-clamp-2",
            )}
          >
            {insight.description}
          </p>

          {/* Toggle */}
          <button
            onClick={() => setExpanded((v) => !v)}
            className="inline-flex items-center gap-1 mt-1.5 text-xs font-medium text-primary/70 hover:text-primary transition-colors"
          >
            {expanded ? (
              <>
                <ChevronUp className="w-3 h-3" />
                {t.tabs.hideDetails}
              </>
            ) : (
              <>
                <ChevronDown className="w-3 h-3" />
                {t.tabs.viewDetails}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Count badges ─────────────────────────────────────────────────────────────

function CountBadges({ insights }: { insights: Insight[] }) {
  const success = insights.filter((i) => i.kind === "success").length;
  const warning = insights.filter((i) => i.kind === "warning").length;
  const info    = insights.filter((i) => i.kind === "info").length;

  return (
    <div className="flex items-center gap-1">
      {success > 0 && (
        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] font-semibold text-emerald-700">
          <CheckCircle2 className="w-2.5 h-2.5" />{success}
        </span>
      )}
      {warning > 0 && (
        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-[10px] font-semibold text-amber-700">
          <AlertTriangle className="w-2.5 h-2.5" />{warning}
        </span>
      )}
      {info > 0 && (
        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-[10px] font-semibold text-blue-700">
          <Info className="w-2.5 h-2.5" />{info}
        </span>
      )}
    </div>
  );
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="bg-card border border-border rounded-xl px-4 py-3 flex gap-3 animate-pulse"
        >
          <div className="shrink-0 w-4 h-4 rounded-full bg-muted mt-0.5" />
          <div className="flex flex-col gap-1.5 flex-1">
            <div className="h-3 bg-muted rounded w-1/4" />
            <div className="h-4 bg-muted rounded w-3/5" />
            <div className="h-3 bg-muted rounded w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}
