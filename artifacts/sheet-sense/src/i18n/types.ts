// ─── Supported locales ────────────────────────────────────────────────────────
// To add a new language: add its code here, create src/i18n/locales/<code>.ts,
// and register it in src/i18n/context.tsx.

export type Locale = "en" | "ar";

export const RTL_LOCALES: Locale[] = ["ar"];

// ─── Translation shape ────────────────────────────────────────────────────────
// Every locale file must satisfy this interface in full.

type InsightRule = { title: string; desc: string };

export type Translations = {
  nav: {
    appName: string;
    switchLang: string;
    switchLangAria: string;
  };
  hero: {
    heading: string;
    subheading: string;
  };
  dropzone: {
    title: string;
    titleLoading: string;
    subtitle: string;
    subtitleLoading: string;
  };
  errors: {
    invalidFile: string;
    parseError: string;
    readError: string;
  };
  analysis: {
    complete: string;
    subtitle: string;
    uploadAnother: string;
  };
  datasets: {
    sidebarTitle: string;
    addDataset: string;
    uploading: string;
    noDatasets: string;
    /** {n} */
    rows: string;
    /** {n} */
    cols: string;
    /** {n} */
    qualityScore: string;
    removeDataset: string;
    openSidebar: string;
    closeSidebar: string;
    activeLabel: string;
    dropHint: string;
    selectPrompt: string;
  };
  fileStats: {
    fileName: string;
    totalSheets: string;
    rows: string;
    columns: string;
  };
  quality: {
    sectionTitle: string;
    hoverHint: string;
    overallScore: string;
    scoreBreakdown: string;
    outOf: string;
    legendCritical: string;
    legendWarning: string;
    legendHealthy: string;
  };
  metrics: {
    totalCells: { label: string; tooltip: string };
    missingValues: { label: string; tooltip: string };
    missingPercent: { label: string; tooltip: string };
    duplicateRows: { label: string; tooltip: string };
    emptyColumns: { label: string; tooltip: string };
    numericColumns: { label: string; tooltip: string };
    textColumns: { label: string; tooltip: string };
  };
  status: {
    healthy: string;
    warning: string;
    critical: string;
  };
  scoreLabel: {
    excellent: string;
    good: string;
    fair: string;
    poor: string;
    critical: string;
  };
  preview: {
    title: string;
    /** Use {count} and {sheet} as placeholders. */
    showing: string;
    noData: string;
  };
  insights: {
    sectionTitle: string;
    subtitle: string;
    generateButton: string;
    generatingLabel: string;
    poweredByRules: string;
    /** Count badge: use {count} placeholder. */
    insightCount: string;
    kindLabel: {
      success: string;
      warning: string;
      info: string;
    };
    rules: {
      // Missing values
      noMissingValues: InsightRule;
      minorMissing: InsightRule;        // {pct}
      significantMissing: InsightRule;  // {pct}, {count}
      highMissing: InsightRule;         // {pct}, {count}
      // Duplicates
      noDuplicates: InsightRule;
      duplicatesFound: InsightRule;     // {count}
      // Empty columns
      emptyColumnsFound: InsightRule;   // {count}
      // Column types
      numericAvailable: InsightRule;    // {count}
      textAvailable: InsightRule;       // {count}
      mixedDataset: InsightRule;
      // Dataset size
      smallDataset: InsightRule;        // {count}
      largeDataset: InsightRule;        // {count}
      // Overall verdict
      readyForViz: InsightRule;         // {score}
      needsMinorCleaning: InsightRule;  // {score}
      needsCleaning: InsightRule;       // {score}
    };
  };
  viz: {
    sectionTitle: string;
    subtitle: string;
    noData: string;
    selectColumn: string;
    chartTypes: {
      bar: string;
      pie: string;
      line: string;
      histogram: string;
    };
    chartTitles: {
      bar: string;        // {col}
      pie: string;        // {col}
      line: string;       // {col}
      histogram: string;  // {col}
    };
    labels: {
      count: string;
      value: string;
      frequency: string;
      row: string;
      other: string;
      /** {n} */
      totalRows: string;
      /** {shown}, {total} */
      uniqueValues: string;
      /** {n} */
      sampledPoints: string;
      /** {min}, {mean}, {max} */
      statsLine: string;
    };
  };
  footer: {
    text: string;
  };
};
