import { FileSpreadsheet } from "lucide-react";
import { useLocale } from "@/i18n/context";
import { FileStats } from "@/components/FileStats";
import { DataQuality } from "@/components/DataQuality";
import { Insights } from "@/components/Insights";
import { Visualizations } from "@/components/Visualizations";
import { PreviewTable } from "@/components/PreviewTable";
import type { Dataset } from "@/types";

// ─── Props ────────────────────────────────────────────────────────────────────

interface DatasetPanelProps {
  dataset: Dataset;
}

// ─── Component ────────────────────────────────────────────────────────────────
//
// Renders the full analysis view for a single dataset.
// This component is intentionally kept thin — it just maps `Dataset → UI`.
// Future features (relationship controls, dataset comparison, export) can be
// added here without touching the sidebar or store.

export function DatasetPanel({ dataset }: DatasetPanelProps) {
  const { t } = useLocale();
  const { file } = dataset;

  return (
    <div
      key={dataset.id} // force remount when dataset changes so Insights auto-regenerates
      className="max-w-5xl mx-auto w-full px-4 md:px-6 py-8 space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-300"
      data-testid={`dataset-panel-${dataset.id}`}
    >
      {/* Dataset header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
          <FileSpreadsheet className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <h2
            className="text-xl font-bold tracking-tight text-foreground truncate"
            title={file.fileName}
          >
            {file.fileName}
          </h2>
          <p className="text-sm text-muted-foreground">{t.analysis.subtitle}</p>
        </div>
      </div>

      {/* Analysis sections */}
      <FileStats file={file} />

      <DataQuality quality={file.dataQuality} />

      {file.dataQuality && (
        <Insights
          quality={file.dataQuality}
          meta={{
            fileName: file.fileName,
            rowCount: file.rowCount,
            colCount: file.colCount,
          }}
        />
      )}

      <Visualizations chartData={file.chartData} />

      <PreviewTable file={file} />
    </div>
  );
}
