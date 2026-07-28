import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/store/ThemeContext";
import { useLocale } from "@/i18n/context";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const { t } = useLocale();
  const isDark = theme === "dark";

  return (
    <div className="flex items-center gap-0.5 p-0.5 rounded-lg bg-muted border border-border">
      {/* Light */}
      <button
        onClick={() => setTheme("light")}
        aria-label={t.nav.themeLight}
        aria-pressed={!isDark}
        className={
          !isDark
            ? "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-card text-foreground shadow-sm border border-border transition-all"
            : "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-muted-foreground hover:text-foreground transition-all"
        }
      >
        <Sun className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">{t.nav.themeLight}</span>
      </button>

      {/* Dark */}
      <button
        onClick={() => setTheme("dark")}
        aria-label={t.nav.themeDark}
        aria-pressed={isDark}
        className={
          isDark
            ? "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-card text-foreground shadow-sm border border-border transition-all"
            : "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-muted-foreground hover:text-foreground transition-all"
        }
      >
        <Moon className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">{t.nav.themeDark}</span>
      </button>
    </div>
  );
}
