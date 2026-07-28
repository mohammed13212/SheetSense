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
    workspace: string;
    relationships: string;
    themeLight: string;
    themeDark: string;
    logIn: string;
    signUp: string;
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
    renameDataset: string;
    renameInputPlaceholder: string;
    menuRename: string;
    menuDelete: string;
    openSidebar: string;
    closeSidebar: string;
    activeLabel: string;
    dropHint: string;
    selectPrompt: string;
    continueToWorkspace: string;
    backToWorkspace: string;
  };
  fileStats: {
    fileName: string;
    totalSheets: string;
    rows: string;
    columns: string;
    numericCols: string;
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
      // Issues — emitted only when the problem is present (actionable)
      minorMissing: InsightRule;        // {pct}
      significantMissing: InsightRule;  // {pct}, {count}
      highMissing: InsightRule;         // {pct}, {count}
      duplicatesFound: InsightRule;     // {count}
      emptyColumnsFound: InsightRule;   // {count}
      // Size observations
      smallDataset: InsightRule;        // {count}
      largeDataset: InsightRule;        // {count}
      // Practical next-step recommendations
      numericDataset: InsightRule;      // {count} — numeric-only dataset
      categoricalPossible: InsightRule; // mixed numeric + text
      textOnlyDataset: InsightRule;     // text-only dataset
      // Readiness verdict — exactly one fires per dataset
      readyForViz: InsightRule;
      readyWithIssues: InsightRule;
      needsCleaning: InsightRule;
    };
  };
  relationships: {
    pageTitle: string;
    pageSubtitle: string;
    noDatasets: string;
    noDatasetsSub: string;
    goToWorkspace: string;
    datasetA: string;
    datasetB: string;
    selectDataset: string;
    selectColumn: string;
    columnsTitle: string;
    noColumns: string;
    typeNumeric: string;
    typeCategorical: string;
    typeUnknown: string;
    suggestions: {
      title: string;
      subtitle: string;
      empty: string;
      noneSelected: string;
      /** {n} */
      countLabel: string;
      confidence: {
        high: string;
        medium: string;
        low: string;
      };
      createButton: string;
      createTooltip: string;
      reasons: {
        /** {type} */
        exactSameType: string;
        /** {typeA}, {typeB} */
        exactDiffType: string;
        /** {type} */
        partialSameType: string;
        /** {typeA}, {typeB} */
        partialDiffType: string;
        /** {typeA}, {typeB} */
        similarKeys: string;
      };
    };
    diagram: {
      title: string;
      subtitle: string;
      placeholder: string;
      comingSoon: string;
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
    privacyTitle: string;
    privacyDesc: string;
  };
  tabs: {
    overview: string;
    insights: string;
    charts: string;
    preview: string;
    topInsights: string;
    keyStatistics: string;
    viewAllInsights: string;
    noInsights: string;
    insightsEmpty: string;
    viewDetails: string;
    hideDetails: string;
    searchPlaceholder: string;
    noSearchResults: string;
    sortAsc: string;
    sortDesc: string;
  };
  summary: {
    /** Card heading shown top-right */
    title: string;
    /** Section label for the health badge row */
    datasetHealth: string;
    /** Section label above the prose paragraph */
    quickSummary: string;
    /** Section label above the five metric tiles */
    keyMetrics: string;
    /** Section label above the action list */
    recommendedActions: string;
    /** Short labels for the five metric tiles */
    metrics: {
      rows: string;
      columns: string;
      missingValues: string;
      duplicateRows: string;
      qualityScore: string;
    };
    /**
     * Prose sentence templates.
     * Placeholders: {rows} {cols} {pct} {count} {score} {numeric} {text}
     */
    prose: {
      /** {rows}, {cols} */
      size: string;
      /** no placeholders */
      qualityExcellentClean: string;
      /** {pct} */
      qualityExcellentMissing: string;
      /** {count} */
      qualityExcellentDupes: string;
      /** {pct}, {count} */
      qualityExcellentBoth: string;
      /** {score} */
      qualityGood: string;
      /** {score} */
      qualityFair: string;
      /** {score} */
      qualityPoor: string;
      /** {numeric}, {text} */
      compositionMixed: string;
      /** {numeric} */
      compositionNumericOnly: string;
      /** {text} */
      compositionTextOnly: string;
      /** no placeholders */
      closingReady: string;
      /** no placeholders */
      closingGood: string;
      /** no placeholders */
      closingPoor: string;
    };
    /** Action sentence templates */
    actions: {
      /** {count} */
      duplicates: string;
      /** {count}, {pct} */
      missing: string;
      /** {count} */
      emptyColumns: string;
      /** no placeholders */
      noAction: string;
    };
  };
};
