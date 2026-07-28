import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/store/ThemeContext";
import { useLocale } from "@/i18n/context";

/**
 * Circular theme toggle fixed at the bottom-right corner of the viewport.
 * Uses a high z-index so it floats above all page content without blocking
 * interactive areas (it's small and pinned to the corner).
 */
export function FloatingThemeToggle() {
  const { theme, setTheme } = useTheme();
  const { t } = useLocale();
  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? t.nav.themeLight : t.nav.themeDark}
      title={isDark ? t.nav.themeLight : t.nav.themeDark}
      className="fixed bottom-5 end-5 z-50 w-11 h-11 rounded-full flex items-center justify-center bg-card border border-border shadow-lg text-muted-foreground hover:text-foreground hover:border-primary/40 hover:shadow-primary/10 transition-all duration-200 hover:scale-105 active:scale-95"
    >
      {isDark
        ? <Sun  className="w-4.5 h-4.5" />
        : <Moon className="w-4.5 h-4.5" />}
    </button>
  );
}
