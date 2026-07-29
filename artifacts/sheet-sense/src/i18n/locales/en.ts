import type { Translations } from "../types";

const en: Translations = {
  nav: {
    appName: "SheetSense",
    switchLang: "العربية",
    switchLangAria: "Switch to Arabic",
    workspace: "Workspace",
    relationships: "Relationships",
    dashboard: "Dashboard",
    signOut: "Sign out",
    projectLabel: "Project:",
    themeLight: "Light",
    themeDark: "Dark",
    logIn: "Log In",
    signUp: "Sign Up",
    mainNavAria: "Main navigation",
    datasetTabsAria: "Dataset analysis tabs",
  },
  auth: {
    loginSubtitle: "Welcome back. Sign in to your account.",
    email: "Email",
    password: "Password",
    forgotPassword: "Forgot password?",
    signingIn: "Signing in…",
    signIn: "Sign In",
    noAccount: "Don't have an account?",
    createAccount: "Create account",
    createAccountSub: "Start for free. No credit card required.",
    fullName: "Full name",
    namePlaceholder: "Jane Smith",
    passwordPlaceholder: "At least 6 characters",
    showPassword: "Show password",
    hidePassword: "Hide password",
    creatingAccount: "Creating account…",
    createAccountButton: "Create Account",
    alreadyHaveAccount: "Already have an account?",
    checkEmail: "Check your email",
    confirmationSent: "We sent a confirmation link to {email}. Click it to activate your account.",
    backToSignIn: "Back to sign in",
    resetPassword: "Reset password",
    resetPasswordSub: "Enter your email and we'll send a reset link.",
    sending: "Sending…",
    sendResetLink: "Send Reset Link",
    rememberedIt: "Remembered it?",
    resetLinkSent: "We sent a password reset link to {email}.",
    backToApp: "← Back to SheetSense",
  },
  common: {
    loading: "Loading…",
    undo: "Undo",
    delete: "Delete",
    cancel: "Cancel",
    retry: "Retry",
    undoDescription: "This action cannot be undone after the undo period expires.",
  },
  notFound: {
    title: "Page not found",
    description: "This page doesn't exist or may have been moved.",
    backTo: "Back to SheetSense",
  },
  dashboard: {
    welcomeBack: "Welcome back",
    newProject: "New Project",
    newProjectSub: "Upload a spreadsheet and start analyzing",
    recentProjects: "Recent Projects",
    loadError: "Could not load projects. Please try again.",
    deleteError: "Could not delete project. Please try again.",
    projectDeleted: '"{name}" deleted.',
    projectFallbackName: "Project",
    noProjects: "No projects yet",
    noProjectsSub: "Upload a file to create your first project.",
    deleteProject: "Delete project",
    confirmDeleteTitle: "Delete Project?",
    file: "file",
    files: "files",
    rows: "{n} rows",
  },
  workspace: {
    addFileTo: 'Add a file to "{name}"',
    backToDashboard: "Dashboard",
  },
  hero: {
    heading: "Analyze Excel & CSV files in seconds.",
    subheading:
      "Upload your spreadsheet and instantly discover data quality, insights, charts, and summaries.",
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
    deleted: '"{name}" deleted.',
    datasetOptions: "Dataset options",
    confirmDeleteTitle: "Delete Dataset?",
  },
  fileStats: {
    fileName: "File Name",
    totalSheets: "Total Sheets",
    rows: "Rows (Sheet 1)",
    columns: "Columns (Sheet 1)",
    numericCols: "Numeric Columns",
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
      // Issues — emitted only when the problem is present
      minorMissing: {
        title: "Minor Missing Data",
        desc: "{pct}% of cells are empty. Consider filling these gaps before running analysis.",
      },
      significantMissing: {
        title: "Significant Missing Data",
        desc: "{pct}% of cells ({count} values) are blank. Impute or remove affected rows before analysis.",
      },
      highMissing: {
        title: "High Missing Data Rate",
        desc: "{pct}% of cells ({count} values) are missing. This will significantly affect any analysis or chart.",
      },
      duplicatesFound: {
        title: "Duplicate Rows Detected",
        desc: "{count} rows are exact duplicates. Remove them to avoid inflated counts and skewed aggregations.",
      },
      emptyColumnsFound: {
        title: "Empty Columns Detected",
        desc: "{count} column(s) contain no data. Dropping them will reduce noise.",
      },
      // Size observations
      smallDataset: {
        title: "Very Small Dataset",
        desc: "Only {count} data rows found. Statistical conclusions may have limited reliability — consider gathering more data.",
      },
      largeDataset: {
        title: "Large Dataset",
        desc: "{count} rows detected. Consider filtering to a focused subset before building charts for better performance.",
      },
      // Practical next-step recommendations
      numericDataset: {
        title: "Numeric Dataset — Charts Ready",
        desc: "All {count} columns are numeric. This dataset is well-suited for bar charts, line graphs, scatter plots, and statistical summaries.",
      },
      categoricalPossible: {
        title: "Category Analysis Possible",
        desc: "Your dataset has both numeric and text columns. Use text columns to group and filter — combine them with numeric columns to build meaningful category-based charts.",
      },
      textOnlyDataset: {
        title: "Text-Heavy Dataset",
        desc: "Most columns contain text. Consider frequency counts or category grouping before visualizing.",
      },
      // Readiness verdict — exactly one fires per dataset
      readyForViz: {
        title: "Ready for Visualization",
        desc: "This dataset is clean and ready. Head to the Charts tab to start building dashboards and reports.",
      },
      readyWithIssues: {
        title: "Mostly Ready — Issues Flagged",
        desc: "Your dataset can be visualized, but addressing the issues above will improve accuracy.",
      },
      needsCleaning: {
        title: "Data Cleaning Recommended",
        desc: "Resolve the issues above before running analysis — they may affect the accuracy of charts and summaries.",
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
    addRelationship: "Add Relationship",
    editRelationship: "Edit Relationship",
    deleteRelationship: "Delete",
    confirmDelete: "Confirm delete?",
    cancelDelete: "Cancel",
    deleted: "Relationship deleted.",
    confirmDeleteTitle: "Delete Relationship?",
    joinLabel: "JOIN",
    currentRelationships: {
      title: "Current Relationships",
      subtitle: "Relationships you have defined between datasets",
      empty: "No relationships defined yet",
      emptySub: "Accept a suggestion below or add one manually",
    },
    suggestions: {
      title: "Suggested Relationships",
      subtitle: "Auto-detected based on column names and data types",
      empty: "No matching columns detected between these two datasets",
      noneSelected: "Select two datasets above to see suggestions",
      allDismissed: "All suggestions have been accepted or dismissed.",
      countLabel: "{n} suggestions",
      confidence: {
        high: "High",
        medium: "Medium",
        low: "Low",
      },
      accept: "Accept",
      edit: "Edit",
      ignore: "Dismiss",
      reasons: {
        exactSameType: "Exact name match · Both {type}",
        exactDiffType: "Exact name match · {typeA} vs {typeB}",
        partialSameType: "Partial name match · Both {type}",
        partialDiffType: "Partial name match · {typeA} vs {typeB}",
        similarKeys: "Similar join keys · {typeA} vs {typeB}",
      },
    },
    editor: {
      titleCreate: "Add Relationship",
      titleEdit: "Edit Relationship",
      datasetA: "Dataset A",
      datasetB: "Dataset B",
      columnA: "Join Column (A)",
      columnB: "Join Column (B)",
      selectDataset: "Select a dataset…",
      selectColumn: "Select a column…",
      save: "Save",
      cancel: "Cancel",
    },
    diagram: {
      title: "Relationship Diagram",
      subtitle: "Visual map of connections — click a relationship to manage it",
      empty: "No relationships to display",
      emptySub: "Accepted relationships will appear here as a visual diagram",
      clickHint: "Click a relationship to edit or delete it",
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
    privacyTitle: "Privacy First",
    privacyDesc: "Your files never leave your browser.",
  },
  tabs: {
    overview: "Overview",
    insights: "Insights",
    charts: "Charts",
    preview: "Data Preview",
    topInsights: "Key Findings",
    keyStatistics: "Key Statistics",
    viewAllInsights: "View all",
    noInsights: "No insights yet.",
    insightsEmpty: "No outstanding issues or recommendations for this dataset.",
    viewDetails: "View details",
    hideDetails: "Hide",
    refreshFindings: "Refresh findings",
    searchPlaceholder: "Search rows…",
    clearSearch: "Clear search",
    noSearchResults: "No rows match your search.",
    sortAsc: "Sort ascending",
    sortDesc: "Sort descending",
    columnFallback: "Column {n}",
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
