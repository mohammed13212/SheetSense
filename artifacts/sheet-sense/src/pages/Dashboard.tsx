import { Link } from "wouter";
import { BarChart2, Plus, FolderOpen, LogOut } from "lucide-react";
import { useLocale } from "@/i18n/context";
import { useAuth } from "@/store/AuthContext";

export default function Dashboard() {
  const { t } = useLocale();
  const { user, signOut } = useAuth();

  const displayName =
    user?.user_metadata?.display_name ||
    user?.email?.split("@")[0] ||
    "there";

  async function handleSignOut() {
    await signOut();
    // onAuthStateChange in AuthContext will set user to null,
    // ProtectedRoute will redirect to /login automatically.
  }

  return (
    <div className="min-h-[100dvh] bg-background text-foreground">
      {/* Top nav */}
      <header className="border-b border-border bg-card/60 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="bg-primary p-1.5 rounded-lg text-primary-foreground shadow-sm">
              <BarChart2 className="w-4 h-4" />
            </div>
            <span className="text-base font-bold tracking-tight">{t.nav.appName}</span>
          </Link>

          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </header>

      {/* Body */}
      <main className="max-w-5xl mx-auto px-4 py-10 space-y-10">
        {/* Welcome */}
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Welcome back</p>
          <h1 className="text-3xl font-bold tracking-tight capitalize">
            {displayName}
          </h1>
        </div>

        {/* Quick action */}
        <Link
          href="/"
          className="flex items-center gap-3 w-full rounded-xl border border-dashed border-border bg-card/40 hover:bg-card hover:border-primary/40 transition-colors p-5 group"
        >
          <div className="p-2.5 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/15 transition-colors">
            <Plus className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-semibold">New Project</p>
            <p className="text-xs text-muted-foreground">
              Upload a spreadsheet and start analyzing
            </p>
          </div>
        </Link>

        {/* Recent projects — placeholder for phase 2 */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">Recent Projects</h2>
          </div>

          {/* Empty state */}
          <div className="rounded-xl border border-border bg-card/30 p-12 flex flex-col items-center justify-center text-center space-y-3">
            <div className="p-3 rounded-full bg-muted/50">
              <FolderOpen className="w-6 h-6 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium">No projects yet</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Upload a file to create your first project.
              </p>
            </div>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline font-medium"
            >
              <Plus className="w-3.5 h-3.5" />
              Start analyzing
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
