/**
 * AuthNav — persistent top navigation for the authenticated experience.
 *
 * Shown on every authenticated page: Dashboard, Project Workspace, Relationships.
 * The workspace and relationships links are project-aware — they point to
 * /projects/:id and /projects/:id/relationships when a project is active.
 */

import { Link, useLocation } from "wouter";
import { BarChart2, LayoutDashboard, Home, GitBranch, LogOut, Menu } from "lucide-react";

import { cn } from "@/lib/utils";
import { useLocale } from "@/i18n/context";
import { useAuth } from "@/store/AuthContext";
import { useProject } from "@/store/ProjectContext";
import { LanguageSwitcher } from "./LanguageSwitcher";

interface AuthNavProps {
  /** Show the mobile hamburger button (workspace page only). */
  showMenuButton?: boolean;
  onMenuClick?: () => void;
}

export function AuthNav({ showMenuButton, onMenuClick }: AuthNavProps) {
  const { t } = useLocale();
  const [location, navigate] = useLocation();
  const { signOut } = useAuth();
  const { activeProject } = useProject();

  function handleSignOut() {
    signOut().then(() => navigate("/"));
  }

  // Build project-aware links
  const workspaceHref = activeProject ? `/projects/${activeProject.id}` : null;
  const relationshipsHref = activeProject
    ? `/projects/${activeProject.id}/relationships`
    : null;

  const isWorkspace =
    location.startsWith("/projects/") && !location.endsWith("/relationships");
  const isRelationships = location.endsWith("/relationships");

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
        <Link
          href="/dashboard"
          className="flex items-center gap-2.5 shrink-0 hover:opacity-80 transition-opacity"
        >
          <div className="bg-primary p-2 rounded-lg text-primary-foreground shadow-sm">
            <BarChart2 className="w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground hidden sm:inline">
            {t.nav.appName}
          </span>
        </Link>

        {/* Nav links */}
        <nav className="ms-2 flex items-center gap-0.5" aria-label={t.nav.mainNavAria}>
          <NavLink href="/dashboard" active={location === "/dashboard"}>
            <Home className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">{t.nav.dashboard}</span>
          </NavLink>

          {workspaceHref && (
            <NavLink href={workspaceHref} active={isWorkspace}>
              <LayoutDashboard className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">{t.nav.workspace}</span>
            </NavLink>
          )}

          {relationshipsHref && (
            <NavLink href={relationshipsHref} active={isRelationships}>
              <GitBranch className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">{t.nav.relationships}</span>
            </NavLink>
          )}
        </nav>

        {/* Project name badge */}
        {activeProject && (
          <div className="hidden md:flex items-center gap-1.5 ms-1 px-2.5 py-1 rounded-md bg-muted/60 border border-border">
            <span className="text-xs text-muted-foreground">{t.nav.projectLabel}</span>
            <span className="text-xs font-medium text-foreground truncate max-w-[160px]">
              {activeProject.name}
            </span>
          </div>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Right: language + sign out */}
        <LanguageSwitcher />

        {/* Sign out — icon only on mobile */}
        <button
          onClick={handleSignOut}
          aria-label={t.nav.signOut}
          className="sm:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <LogOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleSignOut}
          aria-label={t.nav.signOut}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>{t.nav.signOut}</span>
        </button>
      </div>
    </header>
  );
}

// ─── NavLink helper ───────────────────────────────────────────────────────────

interface NavLinkProps {
  href: string;
  active: boolean;
  children: React.ReactNode;
}

function NavLink({ href, active, children }: NavLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
        active
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:text-foreground hover:bg-muted",
      )}
      aria-current={active ? "page" : undefined}
    >
      {children}
    </Link>
  );
}
