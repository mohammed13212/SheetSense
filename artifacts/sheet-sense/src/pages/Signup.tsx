import { useState } from "react";
import { Link, useLocation } from "wouter";
import { BarChart2 } from "lucide-react";
import { useLocale } from "@/i18n/context";
import { tpl } from "@/i18n/tpl";
import { useAuth } from "@/store/AuthContext";

export default function Signup() {
  const { t } = useLocale();
  const { signUp } = useAuth();
  const [, navigate] = useLocation();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: authError } = await signUp(email, password, name);

    if (authError) {
      setError(authError.message);
      setLoading(false);
    } else {
      // Supabase sends a confirmation email — show a success state.
      // If email confirmation is disabled in the project, the user is
      // signed in immediately and onAuthStateChange handles the redirect.
      setSuccess(true);
      setLoading(false);
      // Give the auth listener a moment to pick up the session
      setTimeout(() => navigate("/dashboard"), 500);
    }
  }

  if (success) {
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold">{t.auth.checkEmail}</h2>
              <p className="text-sm text-muted-foreground mt-1"
                dangerouslySetInnerHTML={{
                  __html: tpl(t.auth.confirmationSent, { email: `<strong>${email}</strong>` })
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
            <h1 className="text-2xl font-bold tracking-tight">{t.auth.createAccount}</h1>
            <p className="text-sm text-muted-foreground">
              {t.auth.createAccountSub}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Error */}
            {error && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}

            {/* Name */}
            <div className="space-y-1.5">
              <label
                htmlFor="name"
                className="text-sm font-medium text-foreground"
              >
                {t.auth.fullName}
              </label>
              <input
                id="name"
                type="text"
                autoComplete="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t.auth.namePlaceholder}
                className="w-full h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none ring-offset-background transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
              />
            </div>

            {/* Email */}
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
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none ring-offset-background transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="text-sm font-medium text-foreground"
              >
                {t.auth.password}
              </label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t.auth.passwordPlaceholder}
                className="w-full h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none ring-offset-background transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-10 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? t.auth.creatingAccount : t.auth.createAccountButton}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            {t.auth.alreadyHaveAccount}{" "}
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
