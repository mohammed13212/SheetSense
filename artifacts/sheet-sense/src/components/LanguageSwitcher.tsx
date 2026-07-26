import { Globe } from "lucide-react";
import { useLocale } from "@/i18n/context";
import type { Locale } from "@/i18n/types";

const CYCLE_ORDER: Locale[] = ["en", "ar"];

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useLocale();

  const toggle = () => {
    const next = CYCLE_ORDER[(CYCLE_ORDER.indexOf(locale) + 1) % CYCLE_ORDER.length];
    setLocale(next);
  };

  return (
    <button
      onClick={toggle}
      aria-label={t.nav.switchLangAria}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Globe className="w-4 h-4 shrink-0" />
      <span>{t.nav.switchLang}</span>
    </button>
  );
}
