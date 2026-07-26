import type { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { BarChart2, GitBranch, LayoutDashboard, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocale } from "@/i18n/context";
import { LanguageSwitcher } from "./LanguageSwitcher";

// ─── Props ────────────────────────────────────────────────────────────────────

interface AppHeaderProps {
  /** Render the mobile hamburger button and fire this callback when clicked.
   *  Used by the Home page to toggle the dataset sidebar drawer. */
  showMenuButton?: boolean;
  onMenuClick?: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function AppHeader({ showMenuButton, onMenuClick }: AppHeaderProps) {
  const { t } = useLocale();
  const [location] = useLocation();

  return (
    <header className="h-16 shrink-0 border-b border-border bg-card/60 backdrop-blur-sm sticky top-0 z-20">
      <div className="h-full px-4 md:px-5 flex items-center gap-2">
        {/* Mobile hamburger — only when the Home sidebar exists */}
        {showMenuButton && onMenuClick && (
          <button
            onClick={onMenuClick}
            aria-label={t.datasets.openSidebar}
            className="lg:hidden p-2 -ms-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        {/* Logo — always links to workspace root */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <div className="bg-primary p-2 rounded-lg text-primary-foreground shadow-sm">
            <BarChart2 className="w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground hidden sm:inline">
            {t.nav.appName}
          </span>
        </Link>

        {/* Primary navigation */}
        <nav className="ms-3 flex items-center gap-0.5" aria-label="Main navigation">
          <NavLink href="/" active={location === "/"}>
            <LayoutDashboard className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">{t.nav.workspace}</span>
          </NavLink>
          <NavLink href="/relationships" active={location === "/relationships"}>
            <GitBranch className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">{t.nav.relationships}</span>
          </NavLink>
        </nav>

        <div className="ms-auto">
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}

// ─── Nav link ─────────────────────────────────────────────────────────────────

function NavLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-150",
        active
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:text-foreground hover:bg-muted",
      )}
    >
      {children}
    </Link>
  );
}
