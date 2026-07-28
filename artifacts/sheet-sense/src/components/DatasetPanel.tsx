import { useState, useEffect, useCallback } from "react";
import { FileSpreadsheet } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocale } from "@/i18n/context";
import { ruleBasedEngine } from "@/lib/insights";
import type { Insight } from "@/lib/insights";
import { OverviewTab }    from "@/components/tabs/OverviewTab";
import { ChartsTab }      from "@/components/tabs/ChartsTab";
import { DataPreviewTab } from "@/components/tabs/DataPreviewTab";
import type { Dataset } from "@/types";

// ─── Tab definition ───────────────────────────────────────────────────────────

type TabId = "overview" | "charts" | "preview";

// ─── Props ────────────────────────────────────────────────────────────────────

interface DatasetPanelProps {
  dataset: Dataset;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function DatasetPanel({ dataset }: DatasetPanelProps) {
  const { t } = useLocale();
  const { file } = dataset;

  // ── Tab state ──────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<TabId>("overview");

  // ── Insights state ────────────────────────────────────────────────────────
  const [insights, setInsights] = useState<Insight[]>([]);
  const [insightStatus, setInsightStatus] = useState<"idle" | "loading" | "done">("idle");

  const generateInsights = useCallback(async () => {
    if (!file.dataQuality) return;
    setInsightStatus("loading");
    try {
      const [result] = await Promise.all([
        ruleBasedEngine(file.dataQuality, {
          fileName: file.fileName,
          rowCount: file.rowCount,
          colCount: file.colCount,
        }, t),
        new Promise((r) => setTimeout(r, 500)),
      ]);
      setInsights(result);
      setInsightStatus("done");
    } catch (err) {
      console.error("Insight generation failed:", err);
      setInsightStatus("done");
    }
  }, [file, t]);

  useEffect(() => {
    generateInsights();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file.dataQuality, t]);

  // ── Tab definitions ────────────────────────────────────────────────────────
  const TABS: { id: TabId; label: string }[] = [
    { id: "overview", label: t.tabs.overview },
    { id: "charts",   label: t.tabs.charts   },
    { id: "preview",  label: t.tabs.preview  },
  ];

  return (
    <div
      key={dataset.id}
      className="flex flex-col h-full animate-in fade-in duration-300"
      data-testid={`dataset-panel-${dataset.id}`}
    >
      {/* ── Panel header ── */}
      <div className="shrink-0 px-6 pt-6 pb-0 border-b border-border">
        {/* File name row */}
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
            <FileSpreadsheet className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h2
              className="text-base font-semibold text-foreground truncate leading-snug"
              title={file.fileName}
            >
              {dataset.displayName ?? file.fileName}
            </h2>
            <p className="text-xs text-muted-foreground mt-px">
              {t.analysis.subtitle}
            </p>
          </div>
        </div>

        {/* Tab bar */}
        <nav className="flex gap-0" role="tablist" aria-label="Dataset analysis tabs">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "relative px-4 py-2.5 text-sm font-medium transition-colors duration-150",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
                activeTab === tab.id
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {tab.label}
              {activeTab === tab.id && (
                <span className="absolute bottom-0 inset-x-0 h-0.5 bg-primary rounded-t-full" />
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* ── Tab content ── */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {activeTab === "overview" && (
          <OverviewTab
            file={file}
            insights={insights}
            insightStatus={insightStatus}
            onRegenerate={generateInsights}
          />
        )}
        {activeTab === "charts" && (
          <ChartsTab chartData={file.chartData} />
        )}
        {activeTab === "preview" && (
          <DataPreviewTab file={file} />
        )}
      </div>
    </div>
  );
}
