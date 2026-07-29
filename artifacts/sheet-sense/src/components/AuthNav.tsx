/**
 * AuthNav — persistent top navigation for the authenticated experience.
 *
 * Shown on every authenticated page: Dashboard, Workspace, Relationship Manager.
 * Highlights the active route and provides one-click access to all sections.
 */

import { Link, useLocation } from "wouter";
import { BarChart2, LayoutDashboard, Home, GitBranch, LogOut, Menu } from "lucide-react";

import { cn } from "@/lib/utils";
import { useLocale } from "@/i18n/context";
import { useAuth } from "@/store/AuthContext";
import { LanguageSwitcher } from "./LanguageSwitcher";

interface AuthNavProps {
  /** Show the mobile hamburger button (workspace page only). */
  showMenuButton?: boolean;
  onMenuClick?: () => void;
  /** Optional project name badge shown in workspace. */
  projectName?: string;
}

export function AuthNav({ showMenuButton, onMenuClick, projectName }: AuthNavProps) {
  const { t } = useLocale();
  const [location, navigate] = useLocation();
  const { signOut } = useAuth();

  function handleSignOut() {
    signOut().then(() => navigate("/"));
  }

  return (
    <header className="h-16 shrink-0 border-b border-border bg-card sticky top-0 z-20 shadow-sm">
      <div className="h-full px-4 md:px-6 flex items-center gap-3">

        {/* Mobile hamburger — workspace only */}
        {showMenuButton && onMenuClick && (
          <button
            onClick={onMenuClick}
            aria-label={t.datasets.openSidebar}
            className="lg:hidden p-2 -ms-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2.5 shrink-0 hover:opacity-80 transition-opacity">
          <div className="bg-primary p-2 rounded-lg text-primary-foreground shadow-sm">
            <BarChart2 className="w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground hidden sm:inline">
            {t.nav.appName}
          </span>
        </Link>

        {/* Nav links */}
        <nav className="ms-2 flex items-center gap-0.5" aria-label="Main navigation">
          <NavLink href="/dashboard" active={location === "/dashboard"}>
            <Home className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">Dashboard</span>
          </NavLink>
          <NavLink href="/" active={location === "/"}>
            <LayoutDashboard className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">{t.nav.workspace}</span>
          </NavLink>
          <NavLink href="/relationships" active={location === "/relationships"}>
            <GitBranch className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">{t.nav.relationships}</span>
          </NavLink>
        </nav>

        {/* Project name badge */}
        {projectName && (
          <div className="hidden md:flex items-center gap-1.5 ms-1 px-2.5 py-1 rounded-md bg-muted/60 border border-border">
            <span className="text-xs text-muted-foreground">Project:</span>
            <span className="text-xs font-medium text-foreground truncate max-w-[160px]">
              {projectName}
            </span>
          </div>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Right: language + sign out */}
        <LanguageSwitcher />

        {/* Sign out — icon only on mobile, icon + text on sm+ */}
        <button
          onClick={handleSignOut}
          aria-label="Sign out"
          className="sm:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <LogOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleSignOut}
          className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors ms-1 px-2 py-1.5 rounded-lg hover:bg-muted"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign out
        </button>
      </div>
    </header>
  );
}

function NavLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
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
