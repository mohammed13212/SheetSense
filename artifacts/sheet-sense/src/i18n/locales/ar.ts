import type { Translations } from "../types";

const ar: Translations = {
  nav: {
    appName: "SheetSense",
    switchLang: "English",
    switchLangAria: "التبديل إلى الإنجليزية",
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
    parseError:
      "فشل تحليل الملف. قد يكون تالفًا أو بتنسيق غير مدعوم.",
    readError: "فشل قراءة الملف من القرص.",
  },
  analysis: {
    complete: "اكتمل التحليل",
    subtitle: "تم التحليل بنجاح محليًا في متصفحك.",
    uploadAnother: "رفع ملف آخر",
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
  footer: {
    text: "معالجة محلية أولاً. بياناتك لا تغادر متصفحك أبدًا.",
  },
};

export default ar;
