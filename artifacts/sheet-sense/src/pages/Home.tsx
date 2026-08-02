/**
 * Home — the public landing page at "/".
 *
 * Authenticated users are redirected to /dashboard so they always enter
 * through their project list. Anonymous users see the landing page with
 * a local-only DropZone for an instant try-before-you-sign-up experience.
 */

import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/store/AuthContext";
import { BarChart2 } from "lucide-react";
import { useLocale } from "@/i18n/context";
import { DropZone } from "@/components/DropZone";
import { useDatasets } from "@/store/DatasetContext";
import { parseFile } from "@/lib/parseFile";
import { Link } from "wouter";

export default function Home() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();
  const { t } = useLocale();
  const { addDataset, activeDataset } = useDatasets();

  // Redirect authenticated users to their dashboard
  useEffect(() => {
    if (!loading && user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, loading, navigate]);

  // While auth is loading, render nothing (App.tsx shows a spinner)
  if (loading || user) return null;

  return (
    <div className="flex flex-col min-h-[100dvh] bg-background text-foreground">
      {/* ── Header ────────────────────────────────────────────────── */}
      <header className="h-16 border-b border-border bg-card/80 backdrop-blur sticky top-0 z-10 shadow-sm">
        <div className="h-full max-w-5xl mx-auto px-4 md:px-6 flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <div className="bg-primary p-2 rounded-lg text-primary-foreground shadow-sm">
              <BarChart2 className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              {t.nav.appName}
            </span>
          </div>
          <div className="flex-1" />
          <Link
            href="/login"
            className="px-3 py-1.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            {t.nav.logIn}
          </Link>
          <Link
            href="/signup"
            className="px-3 py-1.5 rounded-lg text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
          >
            {t.nav.signUp}
          </Link>
        </div>
      </header>

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 py-16 text-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground max-w-2xl leading-tight">
          {t.hero.heading}
        </h1>
        <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-xl">
          {t.hero.subheading}
        </p>

        <div className="mt-10 w-full max-w-2xl">
          <DropZone
            onFilesAccepted={async (files) => {
              for (const f of files) {
                try {
                  const pf = await parseFile(f);
                  addDataset(pf);
                  // Nudge unauthenticated users towards sign-up after analysis
                  navigate("/signup");
                } catch {
                  /* ignore parse errors on landing page */
                }
              }
            }}
            isLoading={false}
            error={null}
          />
        </div>

        <p className="mt-6 text-xs text-muted-foreground">
          {t.footer.privacyDesc}
        </p>
      </section>

      {/* ── Footer ────────────────────────────────────────────────── */}
      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground px-4">
        {t.footer.text}
      </footer>
    </div>
  );
}
