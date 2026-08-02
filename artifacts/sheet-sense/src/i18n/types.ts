/** Locale codes that use right-to-left text direction. */
export const RTL_LOCALES: readonly string[] = ["ar"];
export type Locale = "en" | "ar";

export interface Translations {
  nav: {
    appName: string;
    switchLang: string;
    switchLangAria: string;
    workspace: string;
    relationships: string;
    dashboard: string;
    signOut: string;
    projectLabel: string;
    themeLight: string;
    themeDark: string;
    logIn: string;
    signUp: string;
    mainNavAria: string;
    datasetTabsAria: string;
  };

  auth: {
    loginSubtitle: string;
    email: string;
    password: string;
    forgotPassword: string;
    signingIn: string;
    signIn: string;
    noAccount: string;
    createAccount: string;
    createAccountSub: string;
    fullName: string;
    namePlaceholder: string;
    passwordPlaceholder: string;
    showPassword: string;
    hidePassword: string;
    creatingAccount: string;
    createAccountButton: string;
    alreadyHaveAccount: string;
    checkEmail: string;
    confirmationSent: string;
    backToSignIn: string;
    resetPassword: string;
    resetPasswordSub: string;
    sending: string;
    sendResetLink: string;
    rememberedIt: string;
    resetLinkSent: string;
    backToApp: string;
  };

  common: {
    loading: string;
    undo: string;
    delete: string;
    cancel: string;
    retry: string;
    undoDescription: string;
  };

  notFound: {
    title: string;
    description: string;
    backTo: string;
  };

  dashboard: {
    welcomeBack: string;
    newProject: string;
    newProjectSub: string;
    recentProjects: string;
    loadError: string;
    deleteError: string;
    projectDeleted: string;
    projectFallbackName: string;
    noProjects: string;
    noProjectsSub: string;
    deleteProject: string;
    renameProject: string;
    renameInputPlaceholder: string;
    renameError: string;
    confirmDeleteTitle: string;
    file: string;
    files: string;
    rows: string;
    /** New Project modal */
    createProject: string;
    projectNameLabel: string;
    projectNamePlaceholder: string;
    creating: string;
    createError: string;
  };

  workspace: {
    addFileTo: string;
    backToDashboard: string;
    /** Project loading states */
    loadingProject: string;
    loadingProjectSub: string;
    projectNotFound: string;
    projectNotFoundSub: string;
    openingError: string;
    uploadFirstFile: string;
    /** {n} files could not be re-loaded from storage */
    filesUnavailable: string;
    addDataset: string;
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
    rows: string;
    cols: string;
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
    deleted: string;
    datasetOptions: string;
    confirmDeleteTitle: string;
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
    showing: string;
    noData: string;
  };

  insights: {
    sectionTitle: string;
    subtitle: string;
    generateButton: string;
    generatingLabel: string;
    poweredByRules: string;
    insightCount: string;
    kindLabel: {
      success: string;
      warning: string;
      info: string;
    };
    rules: {
      minorMissing: { title: string; desc: string };
      significantMissing: { title: string; desc: string };
      highMissing: { title: string; desc: string };
      duplicatesFound: { title: string; desc: string };
      emptyColumnsFound: { title: string; desc: string };
      smallDataset: { title: string; desc: string };
      largeDataset: { title: string; desc: string };
      numericDataset: { title: string; desc: string };
      categoricalPossible: { title: string; desc: string };
      textOnlyDataset: { title: string; desc: string };
      readyForViz: { title: string; desc: string };
      readyWithIssues: { title: string; desc: string };
      needsCleaning: { title: string; desc: string };
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
    addRelationship: string;
    editRelationship: string;
    deleteRelationship: string;
    confirmDelete: string;
    cancelDelete: string;
    deleted: string;
    confirmDeleteTitle: string;
    joinLabel: string;
    currentRelationships: {
      title: string;
      subtitle: string;
      empty: string;
      emptySub: string;
    };
    suggestions: {
      title: string;
      subtitle: string;
      empty: string;
      noneSelected: string;
      allDismissed: string;
      countLabel: string;
      confidence: { high: string; medium: string; low: string };
      accept: string;
      edit: string;
      ignore: string;
      reasons: {
        exactSameType: string;
        exactDiffType: string;
        partialSameType: string;
        partialDiffType: string;
        similarKeys: string;
      };
    };
    editor: {
      titleCreate: string;
      titleEdit: string;
      datasetA: string;
      datasetB: string;
      columnA: string;
      columnB: string;
      selectDataset: string;
      selectColumn: string;
      save: string;
      cancel: string;
    };
    diagram: {
      title: string;
      subtitle: string;
      empty: string;
      emptySub: string;
      clickHint: string;
    };
    /** Toast errors for save/delete operations */
    savingError: string;
    deletingError: string;
  };

  viz: {
    sectionTitle: string;
    subtitle: string;
    noData: string;
    selectColumn: string;
    chartTypes: { bar: string; pie: string; line: string; histogram: string };
    chartTitles: { bar: string; pie: string; line: string; histogram: string };
    labels: {
      count: string;
      value: string;
      frequency: string;
      row: string;
      other: string;
      totalRows: string;
      uniqueValues: string;
      sampledPoints: string;
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
    refreshFindings: string;
    searchPlaceholder: string;
    clearSearch: string;
    noSearchResults: string;
    sortAsc: string;
    sortDesc: string;
    columnFallback: string;
  };

  summary: {
    title: string;
    datasetHealth: string;
    quickSummary: string;
    keyMetrics: string;
    recommendedActions: string;
    metrics: {
      rows: string;
      columns: string;
      missingValues: string;
      duplicateRows: string;
      qualityScore: string;
    };
    prose: {
      size: string;
      qualityExcellentClean: string;
      qualityExcellentMissing: string;
      qualityExcellentDupes: string;
      qualityExcellentBoth: string;
      qualityGood: string;
      qualityFair: string;
      qualityPoor: string;
      compositionMixed: string;
      compositionNumericOnly: string;
      compositionTextOnly: string;
      closingReady: string;
      closingGood: string;
      closingPoor: string;
    };
    actions: {
      duplicates: string;
      missing: string;
      emptyColumns: string;
      noAction: string;
    };
  };
}
