import type { Translations } from "../types";

const en: Translations = {
  nav: {
    appName: "SheetSense",
    switchLang: "العربية",
    switchLangAria: "Switch to Arabic",
    workspace: "Workspace",
    relationships: "Relationships",
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
  datasets: {
    sidebarTitle: "Datasets",
    addDataset: "Add Dataset",
    uploading: "Uploading…",
    noDatasets: "No datasets yet",
    rows: "{n} rows",
    cols: "{n} cols",
    qualityScore: "Score {n}",
    removeDataset: "Remove dataset",
    renameDataset: "Rename dataset",
    renameInputPlaceholder: "Dataset name…",
    menuRename: "Rename",
    menuDelete: "Delete",
    openSidebar: "Open datasets panel",
    closeSidebar: "Close panel",
    activeLabel: "active",
    dropHint: "Drop a file or click to browse",
    selectPrompt: "Select a dataset from the panel",
    continueToWorkspace: "Continue to workspace",
    backToWorkspace: "Back to workspace",
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
  insights: {
    sectionTitle: "Insights & Recommendations",
    subtitle: "Automatically generated from your dataset",
    generateButton: "Generate AI Insights",
    generatingLabel: "Analyzing your dataset…",
    poweredByRules: "Rule-based analysis",
    insightCount: "{count} insights found",
    kindLabel: {
      success: "Success",
      warning: "Warning",
      info: "Info",
    },
    rules: {
      noMissingValues: {
        title: "No Missing Values Detected",
        desc: "Every cell in your dataset contains a value. Your data is complete and ready for analysis.",
      },
      minorMissing: {
        title: "Minor Missing Data",
        desc: "{pct}% of cells are empty. Consider filling these gaps for the most accurate results.",
      },
      significantMissing: {
        title: "Significant Missing Data",
        desc: "{pct}% of cells ({count} total) are blank. Review and impute or remove affected rows before analysis.",
      },
      highMissing: {
        title: "High Missing Data Rate",
        desc: "{pct}% of cells ({count} total) have no value. This level of incompleteness will significantly affect any analysis.",
      },
      noDuplicates: {
        title: "No Duplicate Rows Found",
        desc: "All rows are unique. No deduplication step is needed before proceeding.",
      },
      duplicatesFound: {
        title: "Duplicate Rows Should Be Reviewed",
        desc: "{count} rows are exact duplicates of other rows. Remove them to avoid inflated counts and skewed aggregations.",
      },
      emptyColumnsFound: {
        title: "Empty Columns Can Be Removed",
        desc: "{count} column(s) contain no data at all. Dropping them will reduce noise and file size.",
      },
      numericAvailable: {
        title: "Numeric Columns Ready for Charts",
        desc: "{count} numeric column(s) detected. These are suitable for bar charts, line graphs, scatter plots, and statistical summaries.",
      },
      textAvailable: {
        title: "Text Columns Suitable for Categorical Analysis",
        desc: "{count} text column(s) detected. Use them for grouping, filtering, pivot tables, or frequency analysis.",
      },
      mixedDataset: {
        title: "Mixed Dataset — Great for Cross-Analysis",
        desc: "Your dataset contains both numeric and text columns, making it well-suited for dimensional analysis and dashboards.",
      },
      smallDataset: {
        title: "Small Dataset",
        desc: "Only {count} data rows found. Statistical conclusions from this dataset may have limited significance — consider gathering more data.",
      },
      largeDataset: {
        title: "Large Dataset Detected",
        desc: "{count} rows found. Consider sampling a subset for exploratory analysis to keep things fast and manageable.",
      },
      readyForViz: {
        title: "Dataset Is Ready for Visualization",
        desc: "With a quality score of {score}/100, your data is in excellent shape. Proceed confidently to charts and reports.",
      },
      needsMinorCleaning: {
        title: "Minor Improvements Recommended",
        desc: "Your quality score is {score}/100 — good, but addressing the warnings above will improve analysis reliability.",
      },
      needsCleaning: {
        title: "Data Cleaning Recommended Before Analysis",
        desc: "Your quality score is {score}/100. Resolving the issues above will significantly improve the accuracy of any downstream analysis.",
      },
    },
  },
  relationships: {
    pageTitle: "Relationship Manager",
    pageSubtitle: "Discover and configure connections between your datasets",
    noDatasets: "No datasets uploaded yet",
    noDatasetsSub:
      "Go to the Workspace to upload your Excel or CSV files, then come back here to explore relationships.",
    goToWorkspace: "Go to Workspace",
    datasetA: "Dataset A",
    datasetB: "Dataset B",
    selectDataset: "Select a dataset…",
    selectColumn: "No column selected",
    columnsTitle: "Columns",
    noColumns: "Select a dataset to see its columns",
    typeNumeric: "Numeric",
    typeCategorical: "Categorical",
    typeUnknown: "Unknown",
    suggestions: {
      title: "Suggested Relationships",
      subtitle: "Auto-detected based on column names and data types",
      empty: "No matching columns detected between these two datasets",
      noneSelected: "Select two datasets above to see relationship suggestions",
      countLabel: "{n} suggestions",
      confidence: {
        high: "High",
        medium: "Medium",
        low: "Low",
      },
      createButton: "Create Relationship",
      createTooltip: "Relationship creation coming in a future update",
      reasons: {
        exactSameType: "Exact name match · Both {type}",
        exactDiffType: "Exact name match · {typeA} vs {typeB}",
        partialSameType: "Partial name match · Both {type}",
        partialDiffType: "Partial name match · {typeA} vs {typeB}",
        similarKeys: "Similar join keys · {typeA} vs {typeB}",
      },
    },
    diagram: {
      title: "Relationship Diagram",
      subtitle: "Visual map of connections between your datasets",
      placeholder:
        "Select two datasets and choose columns to visualize a potential connection",
      comingSoon: "Coming Soon",
    },
  },
  viz: {
    sectionTitle: "Data Visualizations",
    subtitle: "Auto-generated charts based on detected column types",
    noData:
      "No visualizable columns detected. Your dataset may contain only empty or unsupported columns.",
    selectColumn: "Column",
    chartTypes: {
      bar: "Bar Chart",
      pie: "Pie Chart",
      line: "Line Chart",
      histogram: "Histogram",
    },
    chartTitles: {
      bar: 'Top values in "{col}"',
      pie: 'Distribution of "{col}"',
      line: '"{col}" across rows',
      histogram: 'Value distribution of "{col}"',
    },
    labels: {
      count: "Count",
      value: "Value",
      frequency: "Frequency",
      row: "Row",
      other: "Other",
      totalRows: "{n} rows analyzed",
      uniqueValues: "Showing {shown} of {total} unique values",
      sampledPoints: "Sampled to {n} points for performance",
      statsLine: "Min {min} · Mean {mean} · Max {max}",
    },
  },
  footer: {
    text: "Local-first processing. Your data never leaves your browser.",
  },
  tabs: {
    overview: "Overview",
    insights: "Insights",
    charts: "Charts",
    preview: "Data Preview",
    topInsights: "Key Findings",
    viewAllInsights: "View all",
    noInsights: "No insights yet.",
    viewDetails: "View details",
    hideDetails: "Hide",
    searchPlaceholder: "Search rows…",
    noSearchResults: "No rows match your search.",
    sortAsc: "Sort ascending",
    sortDesc: "Sort descending",
  },
  summary: {
    title: "Summary",
    datasetHealth: "Dataset Health",
    quickSummary: "Quick Summary",
    keyMetrics: "Key Metrics",
    recommendedActions: "Recommended Actions",
    metrics: {
      rows: "Rows",
      columns: "Columns",
      missingValues: "Missing Values",
      duplicateRows: "Duplicate Rows",
      qualityScore: "Quality Score",
    },
    prose: {
      size: "This dataset contains {rows} rows and {cols} columns.",
      qualityExcellentClean:
        "The data quality is excellent with no missing values and no duplicate records.",
      qualityExcellentMissing:
        "The data quality is excellent with only {pct}% missing values and no duplicate records.",
      qualityExcellentDupes:
        "The data quality is excellent with no missing values and {count} duplicate rows.",
      qualityExcellentBoth:
        "The data quality is excellent with {pct}% missing values and {count} duplicate rows.",
      qualityGood: "The data quality is good with a score of {score}/100.",
      qualityFair:
        "The data quality is fair ({score}/100). Several issues were detected that should be addressed before analysis.",
      qualityPoor:
        "The data quality is poor ({score}/100). Significant cleaning is recommended before proceeding.",
      compositionMixed:
        "It contains {numeric} numeric and {text} text columns, supporting both statistical and categorical analysis.",
      compositionNumericOnly:
        "All {numeric} columns are numeric, making it well-suited for statistical analysis.",
      compositionTextOnly:
        "The dataset is entirely categorical with {text} text columns.",
      closingReady: "The dataset is ready for analysis and visualization.",
      closingGood:
        "Addressing the detected issues will improve the reliability of your analysis.",
      closingPoor: "Review and clean the data before drawing conclusions from it.",
    },
    actions: {
      duplicates: "Remove {count} duplicate rows to avoid skewed results.",
      missing: "Fill or remove {count} missing values ({pct}% of all cells).",
      emptyColumns:
        "Drop or inspect {count} empty columns — they contribute no data.",
      noAction: "No action required. The dataset is ready for analysis.",
    },
  },
};

export default en;
