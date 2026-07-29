import type { Translations } from "../types";

const ar: Translations = {
  nav: {
    appName: "SheetSense",
    switchLang: "English",
    switchLangAria: "التبديل إلى الإنجليزية",
    workspace: "مساحة العمل",
    relationships: "مدير العلاقات",
    dashboard: "لوحة التحكم",
    signOut: "تسجيل الخروج",
    projectLabel: "المشروع:",
    themeLight: "فاتح",
    themeDark: "داكن",
    logIn: "تسجيل الدخول",
    signUp: "إنشاء حساب",
  },
  auth: {
    loginSubtitle: "مرحباً بعودتك. سجّل دخولك إلى حسابك.",
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    forgotPassword: "نسيت كلمة المرور؟",
    signingIn: "جارٍ تسجيل الدخول…",
    signIn: "تسجيل الدخول",
    noAccount: "ليس لديك حساب؟",
    createAccount: "إنشاء حساب",
    createAccountSub: "ابدأ مجاناً. لا تحتاج إلى بطاقة ائتمانية.",
    fullName: "الاسم الكامل",
    passwordPlaceholder: "6 أحرف على الأقل",
    creatingAccount: "جارٍ إنشاء الحساب…",
    createAccountButton: "إنشاء الحساب",
    alreadyHaveAccount: "هل لديك حساب بالفعل؟",
    checkEmail: "تحقق من بريدك الإلكتروني",
    confirmationSent: "لقد أرسلنا رابط تأكيد إلى {email}. انقر عليه لتفعيل حسابك.",
    backToSignIn: "العودة إلى تسجيل الدخول",
    resetPassword: "إعادة تعيين كلمة المرور",
    resetPasswordSub: "أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة التعيين.",
    sending: "جارٍ الإرسال…",
    sendResetLink: "إرسال رابط إعادة التعيين",
    rememberedIt: "تذكّرتها؟",
    resetLinkSent: "لقد أرسلنا رابط إعادة تعيين كلمة المرور إلى {email}.",
    backToApp: "→ العودة إلى SheetSense",
  },
  common: {
    undo: "تراجع",
    delete: "حذف",
    cancel: "إلغاء",
    retry: "إعادة المحاولة",
    undoDescription: "لا يمكن التراجع عن هذا الإجراء بعد انتهاء فترة التراجع.",
  },
  notFound: {
    title: "الصفحة غير موجودة",
    description: "هذه الصفحة غير موجودة أو ربما تم نقلها.",
    backTo: "العودة إلى SheetSense",
  },
  dashboard: {
    welcomeBack: "مرحباً بعودتك",
    newProject: "مشروع جديد",
    newProjectSub: "ارفع جدولاً بيانياً وابدأ التحليل",
    recentProjects: "المشاريع الأخيرة",
    loadError: "تعذّر تحميل المشاريع. يرجى المحاولة مرة أخرى.",
    deleteError: "تعذّر حذف المشروع. يرجى المحاولة مرة أخرى.",
    projectDeleted: 'تم حذف "{name}".',
    projectFallbackName: "المشروع",
    noProjects: "لا توجد مشاريع بعد",
    noProjectsSub: "ارفع ملفاً لإنشاء أول مشروع لك.",
    deleteProject: "حذف المشروع",
    confirmDeleteTitle: "حذف المشروع؟",
    file: "ملف",
    files: "ملفات",
  },
  hero: {
    heading: "حلّل ملفات Excel و CSV في ثوانٍ.",
    subheading:
      "ارفع جدولك البياني واكتشف فوراً جودة البيانات والرؤى والمخططات والملخصات.",
  },
  dropzone: {
    title: "أفلت جدولك البياني هنا",
    titleLoading: "جارٍ قراءة الملف...",
    subtitle: "أو انقر للاستعراض. يدعم صيغ .xlsx و .xls و .csv",
    subtitleLoading: "جارٍ تحليل الصفوف والأعمدة محليًا...",
  },
  errors: {
    invalidFile: "يرجى رفع ملف .xlsx أو .xls أو .csv صالح.",
    parseError: "فشل تحليل الملف. قد يكون تالفًا أو بتنسيق غير مدعوم.",
    readError: "فشل قراءة الملف من القرص.",
  },
  analysis: {
    complete: "اكتمل التحليل",
    subtitle: "تم التحليل بنجاح محليًا في متصفحك.",
    uploadAnother: "رفع ملف آخر",
  },
  datasets: {
    sidebarTitle: "مجموعات البيانات",
    addDataset: "إضافة مجموعة بيانات",
    uploading: "جارٍ التحميل…",
    noDatasets: "لا توجد مجموعات بيانات بعد",
    rows: "{n} صف",
    cols: "{n} عمود",
    qualityScore: "الجودة {n}",
    removeDataset: "إزالة المجموعة",
    renameDataset: "إعادة تسمية المجموعة",
    renameInputPlaceholder: "اسم المجموعة…",
    menuRename: "إعادة التسمية",
    menuDelete: "حذف",
    openSidebar: "فتح لوحة مجموعات البيانات",
    closeSidebar: "إغلاق اللوحة",
    activeLabel: "نشطة",
    dropHint: "أسقط ملفاً أو انقر للاستعراض",
    selectPrompt: "اختر مجموعة بيانات من اللوحة",
    continueToWorkspace: "المتابعة إلى مساحة العمل",
    backToWorkspace: "العودة إلى مساحة العمل",
    deleted: 'تم حذف "{name}".',
    datasetOptions: "خيارات المجموعة",
    confirmDeleteTitle: "حذف المجموعة؟",
  },
  fileStats: {
    fileName: "اسم الملف",
    totalSheets: "إجمالي الأوراق",
    rows: "الصفوف (الورقة الأولى)",
    columns: "الأعمدة (الورقة الأولى)",
    numericCols: "الأعمدة الرقمية",
  },
  quality: {
    sectionTitle: "لوحة جودة البيانات",
    hoverHint: "مرّر المؤشر على أيقونة ⓘ في أي بطاقة للتفاصيل",
    overallScore: "درجة الجودة الإجمالية",
    scoreBreakdown: "تفصيل النتيجة",
    outOf: "/ 100",
    legendCritical: "0–49 حرجة",
    legendWarning: "50–79 تحذير",
    legendHealthy: "80–100 جيدة",
  },
  metrics: {
    totalCells: {
      label: "إجمالي الخلايا",
      tooltip:
        "إجمالي خلايا البيانات المحللة — الصفوف × الأعمدة مع استبعاد الرأس. يمنحك الحجم الكامل لمجموعة البيانات.",
    },
    missingValues: {
      label: "القيم المفقودة",
      tooltip:
        "الخلايا التي لا تحتوي على قيمة (فارغة أو خالية). قد تشير الأعداد الكبيرة إلى مشكلات في إدخال البيانات أو التصدير.",
    },
    missingPercent: {
      label: "نسبة المفقود",
      tooltip:
        "نسبة الخلايا الفارغة من الإجمالي. أكثر من 5% تحذير؛ أكثر من 20% حرج وقد يؤثر على التحليل.",
    },
    duplicateRows: {
      label: "الصفوف المكررة",
      tooltip:
        "الصفوف التي تتطابق فيها جميع قيم الأعمدة مع صف آخر. يمكن أن تُشوّه التجميعات والمجاميع.",
    },
    emptyColumns: {
      label: "الأعمدة الفارغة",
      tooltip:
        "الأعمدة التي تكون جميع صفوف بياناتها فارغة. لا تحمل معلومات ويمكن إزالتها.",
    },
    numericColumns: {
      label: "الأعمدة الرقمية",
      tooltip:
        "الأعمدة التي تكون ≥60% من قيمها غير الفارغة أرقامًا. جاهزة للتجميع والعمليات الحسابية.",
    },
    textColumns: {
      label: "الأعمدة النصية",
      tooltip:
        "الأعمدة التي تكون معظم قيمها نصوصًا. عادةً ما تكون فئات أو تسميات أو حقول تعريف.",
    },
  },
  status: {
    healthy: "جيد",
    warning: "تحذير",
    critical: "حرج",
  },
  scoreLabel: {
    excellent: "ممتاز",
    good: "جيد",
    fair: "مقبول",
    poor: "ضعيف",
    critical: "حرج",
  },
  preview: {
    title: "معاينة البيانات",
    showing: 'عرض أول {count} صفوف من "{sheet}"',
    noData: "لا توجد بيانات في الورقة الأولى.",
  },
  insights: {
    sectionTitle: "الرؤى والتوصيات",
    subtitle: "مُولَّدة تلقائيًا من مجموعة بياناتك",
    generateButton: "توليد رؤى بالذكاء الاصطناعي",
    generatingLabel: "جارٍ تحليل مجموعة بياناتك…",
    poweredByRules: "تحليل قائم على قواعد",
    insightCount: "{count} رؤى",
    kindLabel: {
      success: "نجاح",
      warning: "تحذير",
      info: "معلومة",
    },
    rules: {
      // Issues — emitted only when the problem is present
      minorMissing: {
        title: "بيانات مفقودة طفيفة",
        desc: "{pct}% من الخلايا فارغة. فكّر في ملء هذه الفجوات قبل التحليل.",
      },
      significantMissing: {
        title: "بيانات مفقودة بشكل ملحوظ",
        desc: "{pct}% من الخلايا ({count} قيمة) فارغة. عالج الصفوف المتأثرة أو احذفها قبل التحليل.",
      },
      highMissing: {
        title: "معدل مرتفع من البيانات المفقودة",
        desc: "{pct}% من الخلايا ({count} قيمة) مفقودة. هذا سيؤثر بشكل كبير على أي تحليل أو مخطط.",
      },
      duplicatesFound: {
        title: "تم اكتشاف صفوف مكررة",
        desc: "{count} صف مكرر. أزلها لتجنب الأرقام المبالغ فيها والتجميعات المنحرفة.",
      },
      emptyColumnsFound: {
        title: "تم اكتشاف أعمدة فارغة",
        desc: "{count} عمود لا يحتوي على بيانات. حذفها سيقلل من الضوضاء.",
      },
      // Size observations
      smallDataset: {
        title: "مجموعة بيانات صغيرة جدًا",
        desc: "{count} صف بيانات فقط. الاستنتاجات الإحصائية قد تكون محدودة الموثوقية — فكّر في جمع المزيد من البيانات.",
      },
      largeDataset: {
        title: "مجموعة بيانات كبيرة",
        desc: "تم اكتشاف {count} صف. فكّر في تصفية مجموعة فرعية مركّزة قبل بناء المخططات للحصول على أداء أفضل.",
      },
      // Practical next-step recommendations
      numericDataset: {
        title: "مجموعة بيانات رقمية — جاهزة للمخططات",
        desc: "جميع الأعمدة الـ{count} رقمية. هذه المجموعة مناسبة للمخططات الشريطية والخطية والانتشارية والملخصات الإحصائية.",
      },
      categoricalPossible: {
        title: "التحليل الفئوي ممكن",
        desc: "تحتوي مجموعتك على أعمدة رقمية ونصية. استخدم الأعمدة النصية للتجميع والتصفية لبناء مخططات فئوية.",
      },
      textOnlyDataset: {
        title: "مجموعة بيانات نصية",
        desc: "معظم الأعمدة نصية. فكّر في تحليل التكرار أو التجميع الفئوي قبل التصور.",
      },
      // Readiness verdict — exactly one fires per dataset
      readyForViz: {
        title: "جاهزة للتصور",
        desc: "مجموعة البيانات نظيفة وجاهزة. توجّه إلى تبويب المخططات لبناء لوحات المعلومات والتقارير.",
      },
      readyWithIssues: {
        title: "جاهزة جزئيًا — توجد مشكلات",
        desc: "يمكن تصور البيانات، لكن معالجة المشكلات أعلاه ستحسّن الدقة.",
      },
      needsCleaning: {
        title: "يُنصح بتنظيف البيانات",
        desc: "عالج المشكلات أعلاه قبل التحليل — فهي قد تؤثر على دقة المخططات والملخصات.",
      },
    },
  },
  relationships: {
    pageTitle: "مدير العلاقات",
    pageSubtitle: "اكتشف وقم بتكوين الروابط بين مجموعات البيانات",
    noDatasets: "لم يتم تحميل أي مجموعات بيانات بعد",
    noDatasetsSub:
      "انتقل إلى مساحة العمل لرفع ملفات Excel أو CSV، ثم عد هنا لاستكشاف العلاقات.",
    goToWorkspace: "انتقل إلى مساحة العمل",
    datasetA: "مجموعة البيانات أ",
    datasetB: "مجموعة البيانات ب",
    selectDataset: "اختر مجموعة بيانات…",
    selectColumn: "لم يتم اختيار عمود",
    columnsTitle: "الأعمدة",
    noColumns: "اختر مجموعة بيانات لرؤية أعمدتها",
    typeNumeric: "رقمي",
    typeCategorical: "فئوي",
    typeUnknown: "غير معروف",
    addRelationship: "إضافة علاقة",
    editRelationship: "تعديل العلاقة",
    deleteRelationship: "حذف",
    confirmDelete: "تأكيد الحذف؟",
    cancelDelete: "إلغاء",
    deleted: "تم حذف العلاقة.",
    confirmDeleteTitle: "حذف العلاقة؟",
    joinLabel: "ربط",
    currentRelationships: {
      title: "العلاقات الحالية",
      subtitle: "العلاقات التي قمت بتعريفها بين مجموعات البيانات",
      empty: "لا توجد علاقات محددة بعد",
      emptySub: "اقبل اقتراحاً أدناه أو أضف علاقة يدوياً",
    },
    suggestions: {
      title: "العلاقات المقترحة",
      subtitle: "مكتشفة تلقائياً بناءً على أسماء الأعمدة وأنواع البيانات",
      empty: "لم يتم اكتشاف أعمدة متطابقة بين هاتين المجموعتين",
      noneSelected: "اختر مجموعتي بيانات أعلاه لرؤية الاقتراحات",
      allDismissed: "تم قبول جميع الاقتراحات أو تجاهلها.",
      countLabel: "{n} اقتراح",
      confidence: {
        high: "عالية",
        medium: "متوسطة",
        low: "منخفضة",
      },
      accept: "قبول",
      edit: "تعديل",
      ignore: "تجاهل",
      reasons: {
        exactSameType: "تطابق تام في الاسم · كلاهما {type}",
        exactDiffType: "تطابق تام في الاسم · {typeA} مقابل {typeB}",
        partialSameType: "تطابق جزئي في الاسم · كلاهما {type}",
        partialDiffType: "تطابق جزئي في الاسم · {typeA} مقابل {typeB}",
        similarKeys: "مفاتيح ربط مشابهة · {typeA} مقابل {typeB}",
      },
    },
    editor: {
      titleCreate: "إضافة علاقة",
      titleEdit: "تعديل العلاقة",
      datasetA: "مجموعة البيانات أ",
      datasetB: "مجموعة البيانات ب",
      columnA: "عمود الربط (أ)",
      columnB: "عمود الربط (ب)",
      selectDataset: "اختر مجموعة بيانات…",
      selectColumn: "اختر عموداً…",
      save: "حفظ",
      cancel: "إلغاء",
    },
    diagram: {
      title: "مخطط العلاقات",
      subtitle: "خريطة مرئية للروابط — انقر على علاقة لإدارتها",
      empty: "لا توجد علاقات للعرض",
      emptySub: "ستظهر العلاقات المقبولة هنا كمخطط مرئي",
      clickHint: "انقر على علاقة لتعديلها أو حذفها",
    },
  },
  viz: {
    sectionTitle: "التصورات البيانية",
    subtitle: "مخططات مُولَّدة تلقائيًا بناءً على أنواع الأعمدة المكتشفة",
    noData:
      "لم يتم اكتشاف أعمدة قابلة للتصور. قد تحتوي بياناتك على أعمدة فارغة أو غير مدعومة فقط.",
    selectColumn: "العمود",
    chartTypes: {
      bar: "مخطط شريطي",
      pie: "مخطط دائري",
      line: "مخطط خطي",
      histogram: "الرسم التوزيعي",
    },
    chartTitles: {
      bar: 'أعلى القيم في "{col}"',
      pie: 'توزيع "{col}"',
      line: '"{col}" عبر الصفوف',
      histogram: 'التوزيع القيمي لـ "{col}"',
    },
    labels: {
      count: "العدد",
      value: "القيمة",
      frequency: "التكرار",
      row: "الصف",
      other: "أخرى",
      totalRows: "تم تحليل {n} صف",
      uniqueValues: "عرض {shown} من {total} قيمة فريدة",
      sampledPoints: "تم أخذ عينة {n} نقطة لتحسين الأداء",
      statsLine: "الأدنى {min} · المتوسط {mean} · الأقصى {max}",
    },
  },
  footer: {
    text: "معالجة محلية أولاً. بياناتك لا تغادر متصفحك أبدًا.",
    privacyTitle: "خصوصيتك أولًا",
    privacyDesc: "ملفاتك لا تغادر متصفحك أبدًا.",
  },
  tabs: {
    overview: "نظرة عامة",
    insights: "الرؤى",
    charts: "المخططات",
    preview: "معاينة البيانات",
    topInsights: "أبرز النتائج",
    keyStatistics: "الإحصاءات الرئيسية",
    viewAllInsights: "عرض الكل",
    noInsights: "لا توجد رؤى بعد.",
    insightsEmpty: "لا توجد مشكلات بارزة أو توصيات لهذه المجموعة.",
    viewDetails: "عرض التفاصيل",
    hideDetails: "إخفاء",
    searchPlaceholder: "البحث في الصفوف…",
    noSearchResults: "لا توجد صفوف تطابق بحثك.",
    sortAsc: "ترتيب تصاعدي",
    sortDesc: "ترتيب تنازلي",
  },
  summary: {
    title: "الملخص",
    datasetHealth: "جودة مجموعة البيانات",
    quickSummary: "ملخص سريع",
    keyMetrics: "المقاييس الرئيسية",
    recommendedActions: "الإجراءات الموصى بها",
    metrics: {
      rows: "الصفوف",
      columns: "الأعمدة",
      missingValues: "القيم المفقودة",
      duplicateRows: "الصفوف المكررة",
      qualityScore: "درجة الجودة",
    },
    prose: {
      size: "تحتوي مجموعة البيانات هذه على {rows} صف و{cols} عمود.",
      qualityExcellentClean:
        "جودة البيانات ممتازة بدون أي قيم مفقودة أو صفوف مكررة.",
      qualityExcellentMissing:
        "جودة البيانات ممتازة مع {pct}% فقط من القيم المفقودة وبدون صفوف مكررة.",
      qualityExcellentDupes:
        "جودة البيانات ممتازة بدون قيم مفقودة ومع {count} صف مكرر.",
      qualityExcellentBoth:
        "جودة البيانات ممتازة مع {pct}% من القيم المفقودة و{count} صف مكرر.",
      qualityGood: "جودة البيانات جيدة بدرجة {score}/100.",
      qualityFair:
        "جودة البيانات مقبولة ({score}/100). تم اكتشاف عدة مشكلات ينبغي معالجتها قبل التحليل.",
      qualityPoor:
        "جودة البيانات ضعيفة ({score}/100). يُنصح بإجراء تنظيف شامل قبل المتابعة.",
      compositionMixed:
        "تحتوي على {numeric} عمود رقمي و{text} عمود نصي، مما يدعم التحليل الإحصائي والفئوي.",
      compositionNumericOnly:
        "جميع الأعمدة الـ{numeric} رقمية، مما يجعلها مناسبة للتحليل الإحصائي.",
      compositionTextOnly:
        "مجموعة البيانات فئوية بالكامل مع {text} عمود نصي.",
      closingReady: "مجموعة البيانات جاهزة للتحليل والتصور.",
      closingGood:
        "معالجة المشكلات المكتشفة ستحسّن موثوقية تحليلك.",
      closingPoor:
        "راجع البيانات ونظّفها قبل استخلاص أي استنتاجات منها.",
    },
    actions: {
      duplicates: "أزِل {count} صف مكرر لتجنب النتائج المنحرفة.",
      missing: "عالج أو أزِل {count} قيمة مفقودة ({pct}% من جميع الخلايا).",
      emptyColumns:
        "احذف أو افحص {count} عمود فارغ — لا تُضيف أي بيانات.",
      noAction: "لا يلزم اتخاذ أي إجراء. مجموعة البيانات جاهزة للتحليل.",
    },
  },
};

export default ar;
