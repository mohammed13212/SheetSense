// ─── Supported locales ────────────────────────────────────────────────────────
// To add a new language: add its code here, create src/i18n/locales/<code>.ts,
// and register it in src/i18n/context.tsx.

export type Locale = "en" | "ar";

export const RTL_LOCALES: Locale[] = ["ar"];

// ─── Translation shape ────────────────────────────────────────────────────────
// Every locale file must satisfy this interface in full.

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
  footer: {
    text: string;
  };
};
