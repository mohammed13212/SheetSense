import { Link } from "wouter";
import { BarChart2, UserPlus } from "lucide-react";
import { useLocale } from "@/i18n/context";

export default function Signup() {
  const { t } = useLocale();
  return (
    <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-background text-foreground px-4">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 justify-center">
          <div className="bg-primary p-2 rounded-lg text-primary-foreground shadow-sm">
            <BarChart2 className="w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-tight">{t.nav.appName}</span>
        </Link>

        {/* Card */}
        <div className="rounded-2xl border border-border bg-card p-8 shadow-sm space-y-6">
          <div className="text-center space-y-1.5">
            <div className="flex justify-center mb-3">
              <div className="p-3 rounded-full bg-primary/10 text-primary">
                <UserPlus className="w-5 h-5" />
              </div>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">{t.nav.signUp}</h1>
            <p className="text-sm text-muted-foreground">
              Authentication coming soon.
            </p>
          </div>

          {/* Placeholder form */}
          <div className="space-y-3">
            <div className="h-10 rounded-lg bg-muted/50 border border-border animate-pulse" />
            <div className="h-10 rounded-lg bg-muted/50 border border-border animate-pulse" />
            <div className="h-10 rounded-lg bg-muted/50 border border-border animate-pulse" />
            <div className="h-10 rounded-lg bg-primary/20 border border-primary/30 animate-pulse" />
          </div>

          <p className="text-center text-sm text-muted-foreground">
            {t.nav.logIn}{" "}
            <Link href="/login" className="text-primary hover:underline font-medium">
              {t.nav.logIn}
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">
            ← {t.nav.appName}
          </Link>
        </p>
      </div>
    </div>
  );
}
