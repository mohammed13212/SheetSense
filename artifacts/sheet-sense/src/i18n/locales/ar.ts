import type { Translations } from "../types";

const ar: Translations = {
  nav: {
    appName: "SheetSense",
    switchLang: "English",
    switchLangAria: "التبديل إلى الإنجليزية",
    workspace: "مساحة العمل",
    relationships: "مدير العلاقات",
  },
  hero: {
    heading: "البيانات، بصورة مفهومة.",
    subheading:
      "أداة هادئة ومركّزة لتحليل جداولك البيانية محليًا. بدون فوضى. بدون رفع إلى الخوادم. فقط رؤى فورية.",
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
    openSidebar: "فتح لوحة مجموعات البيانات",
    closeSidebar: "إغلاق اللوحة",
    activeLabel: "نشطة",
    dropHint: "أسقط ملفاً أو انقر للاستعراض",
    selectPrompt: "اختر مجموعة بيانات من اللوحة",
    continueToWorkspace: "المتابعة إلى مساحة العمل",
    backToWorkspace: "العودة إلى مساحة العمل",
  },
  fileStats: {
    fileName: "اسم الملف",
    totalSheets: "إجمالي الأوراق",
    rows: "الصفوف (الورقة الأولى)",
    columns: "الأعمدة (الورقة الأولى)",
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
      noMissingValues: {
        title: "لا توجد قيم مفقودة",
        desc: "كل خلية في مجموعة البيانات تحتوي على قيمة. بياناتك مكتملة وجاهزة للتحليل.",
      },
      minorMissing: {
        title: "بيانات مفقودة طفيفة",
        desc: "{pct}% من الخلايا فارغة. فكّر في ملء هذه الفجوات للحصول على أدق النتائج.",
      },
      significantMissing: {
        title: "بيانات مفقودة بشكل ملحوظ",
        desc: "{pct}% من الخلايا ({count} إجمالًا) فارغة. راجع وعالج الصفوف المتأثرة قبل التحليل.",
      },
      highMissing: {
        title: "معدل مرتفع من البيانات المفقودة",
        desc: "{pct}% من الخلايا ({count} إجمالًا) لا تحتوي على قيمة. هذا المستوى من النقص سيؤثر بشكل كبير على أي تحليل.",
      },
      noDuplicates: {
        title: "لا توجد صفوف مكررة",
        desc: "جميع الصفوف فريدة. لا حاجة لخطوة إزالة التكرار قبل المتابعة.",
      },
      duplicatesFound: {
        title: "يجب مراجعة الصفوف المكررة",
        desc: "{count} صف مكرر تمامًا مع صفوف أخرى. أزلها لتجنب الأرقام المبالغ فيها والتجميعات المنحرفة.",
      },
      emptyColumnsFound: {
        title: "يمكن إزالة الأعمدة الفارغة",
        desc: "{count} عمود (أعمدة) لا تحتوي على أي بيانات. حذفها سيقلل من الضوضاء وحجم الملف.",
      },
      numericAvailable: {
        title: "الأعمدة الرقمية جاهزة للمخططات",
        desc: "تم اكتشاف {count} عمود رقمي. مناسبة للمخططات الشريطية والخطية والانتشارية والملخصات الإحصائية.",
      },
      textAvailable: {
        title: "الأعمدة النصية مناسبة للتحليل الفئوي",
        desc: "تم اكتشاف {count} عمود نصي. استخدمها للتجميع والتصفية وجداول المحاور وتحليل التكرار.",
      },
      mixedDataset: {
        title: "مجموعة بيانات مختلطة — رائعة للتحليل المتقاطع",
        desc: "تحتوي مجموعة بياناتك على أعمدة رقمية ونصية، مما يجعلها مناسبة للتحليل الأبعادي ولوحات المعلومات.",
      },
      smallDataset: {
        title: "مجموعة بيانات صغيرة",
        desc: "تم العثور على {count} صف بيانات فقط. قد تكون الاستنتاجات الإحصائية محدودة الأهمية — فكّر في جمع المزيد من البيانات.",
      },
      largeDataset: {
        title: "تم اكتشاف مجموعة بيانات كبيرة",
        desc: "تم العثور على {count} صف. فكّر في أخذ عينة فرعية للتحليل الاستكشافي للحفاظ على السرعة وسهولة الإدارة.",
      },
      readyForViz: {
        title: "مجموعة البيانات جاهزة للتصور",
        desc: "بدرجة جودة {score}/100، بياناتك في حالة ممتازة. تابع بثقة إلى المخططات والتقارير.",
      },
      needsMinorCleaning: {
        title: "تُنصح بتحسينات طفيفة",
        desc: "درجة الجودة {score}/100 — جيدة، لكن معالجة التحذيرات أعلاه ستحسّن موثوقية التحليل.",
      },
      needsCleaning: {
        title: "يُنصح بتنظيف البيانات قبل التحليل",
        desc: "درجة الجودة {score}/100. حل المشكلات المذكورة أعلاه سيحسّن بشكل كبير دقة أي تحليل لاحق.",
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
    suggestions: {
      title: "العلاقات المقترحة",
      subtitle: "مكتشفة تلقائياً بناءً على أسماء الأعمدة وأنواع البيانات",
      empty: "لم يتم اكتشاف أعمدة متطابقة بين هاتين المجموعتين",
      noneSelected: "اختر مجموعتي بيانات أعلاه لرؤية اقتراحات العلاقات",
      countLabel: "{n} اقتراح",
      confidence: {
        high: "عالية",
        medium: "متوسطة",
        low: "منخفضة",
      },
      createButton: "إنشاء علاقة",
      createTooltip: "إنشاء العلاقات سيكون متاحاً في تحديث قادم",
      reasons: {
        exactSameType: "تطابق تام في الاسم · كلاهما {type}",
        exactDiffType: "تطابق تام في الاسم · {typeA} مقابل {typeB}",
        partialSameType: "تطابق جزئي في الاسم · كلاهما {type}",
        partialDiffType: "تطابق جزئي في الاسم · {typeA} مقابل {typeB}",
        similarKeys: "مفاتيح ربط مشابهة · {typeA} مقابل {typeB}",
      },
    },
    diagram: {
      title: "مخطط العلاقات",
      subtitle: "خريطة مرئية للروابط بين مجموعات بياناتك",
      placeholder:
        "اختر مجموعتي بيانات وحدد الأعمدة لتصور الاتصال المحتمل بينهما",
      comingSoon: "قريباً",
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
  },
  tabs: {
    overview: "نظرة عامة",
    insights: "الرؤى",
    charts: "المخططات",
    preview: "معاينة البيانات",
    topInsights: "أبرز النتائج",
    viewAllInsights: "عرض الكل",
    noInsights: "لا توجد رؤى بعد.",
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
