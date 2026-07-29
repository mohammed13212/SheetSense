import { useState } from "react";
import { Link } from "wouter";
import { BarChart2 } from "lucide-react";
import { useLocale } from "@/i18n/context";
import { tpl } from "@/i18n/tpl";
import { useAuth } from "@/store/AuthContext";

export default function ForgotPassword() {
  const { t } = useLocale();
  const { resetPassword } = useAuth();

  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: authError } = await resetPassword(email);

    if (authError) {
      setError(authError.message);
      setLoading(false);
    } else {
      setSent(true);
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-background text-foreground px-4">
        <div className="w-full max-w-sm space-y-8">
          <Link href="/" className="flex items-center gap-2.5 justify-center">
            <div className="bg-primary p-2 rounded-lg text-primary-foreground shadow-sm">
              <BarChart2 className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight">{t.nav.appName}</span>
          </Link>
          <div className="rounded-2xl border border-border bg-card p-8 shadow-sm space-y-4 text-center">
            <div className="flex justify-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold">{t.auth.checkEmail}</h2>
              <p className="text-sm text-muted-foreground mt-1"
                dangerouslySetInnerHTML={{
                  __html: tpl(t.auth.resetLinkSent, { email: `<strong>${email}</strong>` })
                }}
              />
            </div>
            <Link href="/login" className="text-sm text-primary hover:underline">
              {t.auth.backToSignIn}
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
          <div className="text-center space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">{t.auth.resetPassword}</h1>
            <p className="text-sm text-muted-foreground">
              {t.auth.resetPasswordSub}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="text-sm font-medium text-foreground"
              >
                {t.auth.email}
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                autoFocus
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none ring-offset-background transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-10 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? t.auth.sending : t.auth.sendResetLink}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            {t.auth.rememberedIt}{" "}
            <Link href="/login" className="text-primary hover:underline font-medium">
              {t.nav.logIn}
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">
            {t.auth.backToApp}
          </Link>
        </p>
      </div>
    </div>
  );
}
