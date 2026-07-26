import type { Translations } from "../types";

const en: Translations = {
  nav: {
    appName: "SheetSense",
    switchLang: "العربية",
    switchLangAria: "Switch to Arabic",
  },
  hero: {
    heading: "Data, made legible.",
    subheading:
      "A quiet, focused tool for analyzing your spreadsheets locally. No clutter. No uploads to servers. Just instant insights.",
  },
  dropzone: {
    title: "Drop your spreadsheet here",
    titleLoading: "Reading file...",
    subtitle: "Or click to browse. Supports .xlsx, .xls and .csv formats.",
    subtitleLoading: "Parsing rows and columns locally...",
  },
  errors: {
    invalidFile: "Please upload a valid .xlsx, .xls, or .csv file.",
    parseError:
      "Failed to parse the file. It might be corrupted or an unsupported format.",
    readError: "Failed to read the file from disk.",
  },
  analysis: {
    complete: "Analysis Complete",
    subtitle: "Successfully parsed locally in your browser.",
    uploadAnother: "Upload another file",
  },
  fileStats: {
    fileName: "File Name",
    totalSheets: "Total Sheets",
    rows: "Rows (Sheet 1)",
    columns: "Columns (Sheet 1)",
  },
  quality: {
    sectionTitle: "Data Quality Dashboard",
    hoverHint: "Hover the ⓘ icon on any card for details",
    overallScore: "Overall Quality Score",
    scoreBreakdown: "Score breakdown",
    outOf: "/ 100",
    legendCritical: "0–49 Critical",
    legendWarning: "50–79 Warning",
    legendHealthy: "80–100 Healthy",
  },
  metrics: {
    totalCells: {
      label: "Total Cells",
      tooltip:
        "Total data cells analyzed — rows × columns, header excluded. Gives you the full scope of the dataset.",
    },
    missingValues: {
      label: "Missing Values",
      tooltip:
        "Cells with no value (null, empty, or blank). High counts may indicate data entry issues or export problems.",
    },
    missingPercent: {
      label: "Missing %",
      tooltip:
        "Percentage of all cells that are blank. Above 5% is a warning; above 20% is critical and may significantly affect analysis.",
    },
    duplicateRows: {
      label: "Duplicate Rows",
      tooltip:
        "Rows where every column value is identical to another row. Duplicates can skew aggregations and totals.",
    },
    emptyColumns: {
      label: "Empty Columns",
      tooltip:
        "Columns where every data row is blank. These carry no information and are likely safe to remove.",
    },
    numericColumns: {
      label: "Numeric Cols",
      tooltip:
        "Columns where ≥60% of non-empty values are numbers. Numeric columns are ready for aggregation and math operations.",
    },
    textColumns: {
      label: "Text Cols",
      tooltip:
        "Columns where most values are text strings. These are typically category, label, or identifier fields.",
    },
  },
  status: {
    healthy: "Healthy",
    warning: "Warning",
    critical: "Critical",
  },
  scoreLabel: {
    excellent: "Excellent",
    good: "Good",
    fair: "Fair",
    poor: "Poor",
    critical: "Critical",
  },
  preview: {
    title: "Data Preview",
    showing: 'Showing first {count} rows of "{sheet}"',
    noData: "No data found in the first sheet.",
  },
  footer: {
    text: "Local-first processing. Your data never leaves your browser.",
  },
};

export default en;
