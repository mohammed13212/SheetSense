import { Link } from "wouter";
import { BarChart2, FileQuestion } from "lucide-react";
import { useLocale } from "@/i18n/context";

export default function NotFound() {
  const { t } = useLocale();

  return (
    <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center bg-background text-foreground px-4">
      <div className="w-full max-w-sm space-y-8 text-center">

        {/* Logo */}
        <Link href="/" className="inline-flex items-center gap-2.5 justify-center hover:opacity-80 transition-opacity">
          <div className="bg-primary p-2 rounded-lg text-primary-foreground shadow-sm">
            <BarChart2 className="w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-tight">{t.nav.appName}</span>
        </Link>

        {/* Card */}
        <div className="rounded-2xl border border-border bg-card p-8 shadow-sm space-y-5">
          <div className="flex justify-center">
            <div className="p-4 rounded-full bg-muted/50">
              <FileQuestion className="w-8 h-8 text-muted-foreground" />
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">{t.notFound.title}</h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t.notFound.description}
            </p>
          </div>

          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 w-full h-10 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm"
          >
            {t.notFound.backTo}
          </Link>
        </div>

      </div>
    </div>
  );
}
