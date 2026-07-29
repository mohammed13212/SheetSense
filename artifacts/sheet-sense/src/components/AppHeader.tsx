import type { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { BarChart2, GitBranch, LayoutDashboard, Menu, Home, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocale } from "@/i18n/context";
import { useAuth } from "@/store/AuthContext";
import { LanguageSwitcher } from "./LanguageSwitcher";

// ─── Props ────────────────────────────────────────────────────────────────────

interface AppHeaderProps {
  /**
   * When true the header is in workspace mode:
   *   - Shows Dashboard + Workspace + Relationships nav links
   *   - Shows the mobile hamburger button (when onMenuClick is provided)
   *   - Logo fires onLogoClick instead of navigating
   * When false (default) the header is in landing mode:
   *   - Shows Log In + Sign Up CTA buttons (unauthenticated)
   *   - Shows Dashboard link (authenticated)
   */
  isInWorkspace?: boolean;
  showMenuButton?: boolean;
  onMenuClick?: () => void;
  onLogoClick?: () => void;
  /** Active project name shown in the workspace header (authenticated only). */
  projectName?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function AppHeader({
  isInWorkspace = false,
  showMenuButton,
  onMenuClick,
  onLogoClick,
  projectName,
}: AppHeaderProps) {
  const { t } = useLocale();
  const [location] = useLocation();
  const { user, signOut } = useAuth();

  return (
    <header className="h-16 shrink-0 border-b border-border bg-card sticky top-0 z-20 shadow-sm">
      <div className="h-full px-4 md:px-6 flex items-center gap-3">

        {/* Mobile hamburger — workspace only, leftmost */}
        {isInWorkspace && showMenuButton && onMenuClick && (
          <button
            onClick={onMenuClick}
            aria-label={t.datasets.openSidebar}
            className="lg:hidden p-2 -ms-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        {/* ── Left group ────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-3 shrink-0">

          {/* Logo */}
          {onLogoClick ? (
            <button
              onClick={onLogoClick}
              className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
              aria-label={t.nav.appName}
            >
              {isInWorkspace && (
                <div className="bg-primary p-2 rounded-lg text-primary-foreground shadow-sm">
                  <BarChart2 className="w-5 h-5" />
                </div>
              )}
              <span className="text-xl font-bold tracking-tight text-foreground hidden sm:inline">
                {t.nav.appName}
              </span>
            </button>
          ) : (
            <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-2.5">
              {isInWorkspace && (
                <div className="bg-primary p-2 rounded-lg text-primary-foreground shadow-sm">
                  <BarChart2 className="w-5 h-5" />
                </div>
              )}
              <span className="text-xl font-bold tracking-tight text-foreground hidden sm:inline">
                {t.nav.appName}
              </span>
            </Link>
          )}

          {/* Landing mode: auth buttons (unauthenticated) or dashboard link (authenticated) */}
          {!isInWorkspace && !user && (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-3.5 py-1.5 rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors border border-border"
              >
                {t.nav.logIn}
              </Link>
              <Link
                href="/signup"
                className="px-3.5 py-1.5 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 transition-opacity shadow-sm"
              >
                {t.nav.signUp}
              </Link>
            </div>
          )}

          {/* Workspace nav — workspace mode */}
          {isInWorkspace && (
            <nav className="ms-1 flex items-center gap-0.5" aria-label={t.nav.mainNavAria}>
              {/* Dashboard — authenticated users only */}
              {user && (
                <NavLink href="/dashboard" active={location === "/dashboard"}>
                  <Home className="w-3.5 h-3.5 shrink-0" />
                  <span className="hidden sm:inline">{t.nav.dashboard}</span>
                </NavLink>
              )}
              <NavLink href="/" active={location === "/"}>
                <LayoutDashboard className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden sm:inline">{t.nav.workspace}</span>
              </NavLink>
              <NavLink href="/relationships" active={location === "/relationships"}>
                <GitBranch className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden sm:inline">{t.nav.relationships}</span>
              </NavLink>
            </nav>
          )}

          {/* Project name badge */}
          {isInWorkspace && projectName && (
            <div className="hidden md:flex items-center gap-1.5 ms-2 px-2.5 py-1 rounded-md bg-muted/60 border border-border">
              <span className="text-xs text-muted-foreground">{t.nav.projectLabel}</span>
              <span className="text-xs font-medium text-foreground truncate max-w-[160px]">
                {projectName}
              </span>
            </div>
          )}
        </div>

        {/* ── Spacer ── */}
        <div className="flex-1" />

        {/* ── Right: language switcher + sign-out for authenticated workspace ── */}
        <LanguageSwitcher />

        {isInWorkspace && user && (
          <button
            onClick={() => signOut()}
            className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors ms-1"
          >
            <LogOut className="w-3.5 h-3.5" />
            {t.nav.signOut}
          </button>
        )}

        {/* Landing + authenticated: dashboard shortcut */}
        {!isInWorkspace && user && (
          <Link
            href="/dashboard"
            className="px-3.5 py-1.5 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 transition-opacity shadow-sm"
          >
            {t.nav.dashboard}
          </Link>
        )}
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
          : "text-muted-foreground hover:text-foreground hover:bg-muted"
      )}
    >
      {children}
    </Link>
  );
}
