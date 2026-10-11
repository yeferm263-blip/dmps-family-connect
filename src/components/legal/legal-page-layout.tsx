import { type ReactNode } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { Shield, FileText, Cookie, AlertTriangle, Scale, ExternalLink } from "lucide-react";
import { PublicShell } from "@/components/public-shell";
import { useI18n } from "@/lib/i18n";

export interface LegalTab {
  id: string;
  path: string;
  titleEs: string;
  titleEn: string;
  shortEs: string;
  shortEn: string;
  icon: typeof Shield;
}

export const LEGAL_TABS: LegalTab[] = [
  {
    id: "independence",
    path: "/independence-disclaimer",
    titleEs: "Descargo de Independencia",
    titleEn: "Independence Disclaimer",
    shortEs: "Independencia",
    shortEn: "Independence",
    icon: Shield,
  },
  {
    id: "privacy",
    path: "/privacy-policy",
    titleEs: "Política de Privacidad",
    titleEn: "Privacy Policy",
    shortEs: "Privacidad",
    shortEn: "Privacy",
    icon: FileText,
  },
  {
    id: "cookies",
    path: "/cookie-policy",
    titleEs: "Política de Cookies y Almacenamiento",
    titleEn: "Cookie & Storage Policy",
    shortEs: "Cookies",
    shortEn: "Cookies",
    icon: Cookie,
  },
  {
    id: "terms",
    path: "/terms-of-use",
    titleEs: "Términos de Uso",
    titleEn: "Terms of Use",
    shortEs: "Términos",
    shortEn: "Terms",
    icon: Scale,
  },
  {
    id: "information",
    path: "/information-disclaimer",
    titleEs: "Descargo de Información y Horarios",
    titleEn: "Information & Schedule Disclaimer",
    shortEs: "Horarios e Info",
    shortEn: "Information",
    icon: AlertTriangle,
  },
];

interface LegalPageLayoutProps {
  currentPath: string;
  titleEs: string;
  titleEn: string;
  subtitleEs: string;
  subtitleEn: string;
  lastUpdated?: string;
  children: ReactNode;
}

export function LegalPageLayout({
  currentPath,
  titleEs,
  titleEn,
  subtitleEs,
  subtitleEn,
  lastUpdated = "Octubre 2026",
  children,
}: LegalPageLayoutProps) {
  const { lang } = useI18n();
  const isEn = lang === "en";

  return (
    <PublicShell>
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
        {/* Breadcrumb Indicator */}
        <nav
          aria-label="Breadcrumb"
          className="mb-6 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
        >
          <Link to="/" className="hover:text-primary transition-colors">
            DMPS INFO
          </Link>
          <span>/</span>
          <span>{isEn ? "Legal Center" : "Centro Legal"}</span>
          <span>/</span>
          <span className="text-primary truncate max-w-[200px] sm:max-w-none">
            {isEn ? titleEn : titleEs}
          </span>
        </nav>

        {/* Page Header */}
        <header className="border-b border-border pb-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-xs font-bold text-primary mb-3">
            <Shield className="size-3.5" aria-hidden="true" />
            <span>
              {isEn
                ? "Independent Community Resource · Transparency"
                : "Portal Comunitario Independiente · Transparencia"}
            </span>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            {isEn ? titleEn : titleEs}
          </h1>

          <p className="mt-2 text-base text-muted-foreground sm:text-lg max-w-3xl">
            {isEn ? subtitleEn : subtitleEs}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="rounded-md bg-secondary px-2.5 py-1 font-medium text-secondary-foreground">
              {isEn ? `Last updated: ${lastUpdated}` : `Última actualización: ${lastUpdated}`}
            </span>
            <span>•</span>
            <span>
              {isEn
                ? "Official district portal: "
                : "Portal oficial del distrito: "}
              <a
                href="https://www.dmschools.org"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-primary hover:underline inline-flex items-center gap-0.5"
              >
                <span>dmschools.org</span>
                <ExternalLink className="size-3" aria-hidden="true" />
              </a>
            </span>
          </div>
        </header>

        {/* Navigation Tabs for Legal Center */}
        <nav
          aria-label={isEn ? "Legal Sections" : "Secciones Legales"}
          className="mt-6 -mx-4 px-4 overflow-x-auto pb-2 scrollbar-none sm:mx-0 sm:px-0"
        >
          <div className="flex gap-2 min-w-max">
            {LEGAL_TABS.map((tab) => {
              const isActive = currentPath === tab.path;
              const Icon = tab.icon;
              return (
                <Link
                  key={tab.id}
                  to={tab.path as any}
                  className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-semibold transition-all ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:text-foreground"
                  }`}
                >
                  <Icon className="size-4 shrink-0" aria-hidden="true" />
                  <span>{isEn ? tab.shortEn : tab.shortEs}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Legal Document Content */}
        <main className="mt-8">
          <div className="surface-card rounded-3xl border border-border bg-card p-6 sm:p-10 shadow-sm leading-relaxed space-y-8 text-foreground/90">
            {children}
          </div>
        </main>

        {/* Cross-Reference Notice / Contact Helper */}
        <aside className="mt-8 rounded-2xl border border-border/80 bg-secondary/40 p-5 text-sm text-muted-foreground flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="font-bold text-foreground">
              {isEn ? "Questions or inaccuracies?" : "¿Dudas o información desactualizada?"}
            </p>
            <p className="text-xs mt-0.5">
              {isEn
                ? "Help us keep this community guide clear, honest, and helpful for local families."
                : "Ayúdanos a mantener esta guía comunitaria clara, honesta y útil para todas las familias locales."}
            </p>
          </div>
          <Link
            to="/contact"
            className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90 shrink-0"
          >
            {isEn ? "View District Directory" : "Ver Directorio del Distrito"}
          </Link>
        </aside>
      </div>
    </PublicShell>
  );
}
