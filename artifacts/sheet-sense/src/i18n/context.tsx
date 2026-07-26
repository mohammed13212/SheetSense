import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type { Locale, Translations } from "./types";
import { RTL_LOCALES } from "./types";
import en from "./locales/en";
import ar from "./locales/ar";

// ─── Registry ─────────────────────────────────────────────────────────────────
// Add a new language by importing its locale file and adding it here.

const LOCALES: Record<Locale, Translations> = { en, ar };

const STORAGE_KEY = "sheetsense-locale";
const DEFAULT_LOCALE: Locale = "en";

function readStoredLocale(): Locale {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && stored in LOCALES) return stored as Locale;
  } catch {
    // localStorage unavailable (SSR / private mode)
  }
  return DEFAULT_LOCALE;
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Translations;
  dir: "ltr" | "rtl";
  isRTL: boolean;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(readStoredLocale);

  const isRTL = RTL_LOCALES.includes(locale);
  const dir = isRTL ? "rtl" : "ltr";

  // Sync document direction + language whenever locale changes
  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = locale;
  }, [locale, dir]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore
    }
  }, []);

  return (
    <LocaleContext.Provider
      value={{ locale, setLocale, t: LOCALES[locale], dir, isRTL }}
    >
      {children}
    </LocaleContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used inside <LocaleProvider>");
  return ctx;
}
