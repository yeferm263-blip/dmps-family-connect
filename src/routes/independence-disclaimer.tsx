import { createFileRoute } from "@tanstack/react-router";
import { AlertCircle, ExternalLink, School, ShieldAlert, CheckCircle2 } from "lucide-react";
import { LegalPageLayout } from "@/components/legal/legal-page-layout";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/independence-disclaimer")({
  head: () => ({
    meta: [
      { title: "Descargo de Independencia — DMPS INFO" },
      {
        name: "description",
        content:
          "Declaración formal de independencia y no afiliación oficial de DMPS INFO con el distrito escolar Des Moines Public Schools (DMPS).",
      },
      { property: "og:title", content: "Descargo de Independencia — DMPS INFO" },
      {
        property: "og:description",
        content: "Portal comunitario independiente para familias escolares de Des Moines, Iowa.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://familiasdmps.app/independence-disclaimer" },
    ],
    links: [{ rel: "canonical", href: "https://familiasdmps.app/independence-disclaimer" }],
  }),
  component: IndependenceDisclaimerPage,
});

function IndependenceDisclaimerPage() {
  const { lang } = useI18n();
  const isEn = lang === "en";

  return (
    <LegalPageLayout
      currentPath="/independence-disclaimer"
      titleEs="Descargo de Independencia y No Afiliación Oficial"
      titleEn="Independence & Non-Affiliation Disclaimer"
      subtitleEs="Aviso legal sobre la naturaleza comunitaria e independiente de este portal frente al distrito escolar Des Moines Public Schools."
      subtitleEn="Notice regarding the independent community nature of this portal and its relationship with Des Moines Public Schools."
    >
      {isEn ? (
        <article className="space-y-8">
          {/* Key Callout Box */}
          <div className="rounded-2xl border-2 border-primary/30 bg-primary/5 p-5 sm:p-6 text-foreground">
            <div className="flex items-start gap-3">
              <ShieldAlert className="size-6 text-primary shrink-0 mt-0.5" aria-hidden="true" />
              <div className="space-y-2">
                <h2 className="text-base font-bold sm:text-lg text-foreground">
                  Core Independence Statement
                </h2>
                <p className="text-sm sm:text-base leading-relaxed">
                  <strong>DMPS INFO is an independent community information portal.</strong> It is
                  not officially affiliated with, endorsed by, sponsored by, or operated by the Des
                  Moines Independent Community School District (Des Moines Public Schools / DMPS),
                  its Board of Education, or its administration.
                </p>
              </div>
            </div>
          </div>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">1. Mission and Community Identity</h2>
            <p className="text-sm sm:text-base leading-relaxed text-foreground/90">
              DMPS INFO was created as a civic, volunteer-led initiative to assist Hispanic and
              multilingual families in Des Moines, Iowa, with navigating public school information,
              bell schedules, academic calendars, youth programs, and transportation guides in their
              preferred language.
            </p>
            <p className="text-sm sm:text-base leading-relaxed text-foreground/90">
              This site is not a government agency, an educational authority, or an official division
              of Des Moines Public Schools. No statement on this website constitutes official
              school district policy, guidance, or decision-making.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">
              2. Intellectual Property, Trademarks & School Names
            </h2>
            <p className="text-sm sm:text-base leading-relaxed text-foreground/90">
              The names "Des Moines Public Schools", "DMPS", and the names of individual public
              schools (such as Lincoln High School, East High School, Roosevelt High School, Hoover
              High School, North High School, Central Campus, Central Academy, and area middle and
              elementary schools), along with their mascots, colors, and logos, belong to their
              respective owners and the school district.
            </p>
            <p className="text-sm sm:text-base leading-relaxed text-foreground/90">
              Any reference on this portal to district schools, departments, or programs is made
              solely for descriptive, educational, and community identification purposes to help
              families recognize the institutions their children attend. Mention of these names
              does not imply any endorsement, partnership, or sponsorship by Des Moines Public
              Schools.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">
              3. Official District Business and Records
            </h2>
            <p className="text-sm sm:text-base leading-relaxed text-foreground/90">
              DMPS INFO does not process student enrollments, issue student IDs, maintain attendance
              records, handle grades, or manage official district communications. For all legally
              binding or official school operations, please consult official district channels:
            </p>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-border bg-secondary/50 p-4 space-y-1">
                <span className="text-xs font-bold uppercase text-primary">District Website</span>
                <p className="text-sm font-semibold text-foreground">dmschools.org</p>
                <a
                  href="https://www.dmschools.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline inline-flex items-center gap-1 font-medium"
                >
                  Visit official website <ExternalLink className="size-3" />
                </a>
              </div>

              <div className="rounded-xl border border-border bg-secondary/50 p-4 space-y-1">
                <span className="text-xs font-bold uppercase text-primary">Student Information System</span>
                <p className="text-sm font-semibold text-foreground">Infinite Campus Parent Portal</p>
                <p className="text-xs text-muted-foreground">Official attendance, grades, and registrations.</p>
              </div>

              <div className="rounded-xl border border-border bg-secondary/50 p-4 space-y-1">
                <span className="text-xs font-bold uppercase text-primary">District Central Office</span>
                <p className="text-sm font-semibold text-foreground">2100 Fleur Drive, Des Moines, IA 50321</p>
                <p className="text-xs text-muted-foreground">Phone: (515) 242-7911</p>
              </div>

              <div className="rounded-xl border border-border bg-secondary/50 p-4 space-y-1">
                <span className="text-xs font-bold uppercase text-primary">Official Sources Used</span>
                <p className="text-sm font-semibold text-foreground">Open District Announcements</p>
                <p className="text-xs text-muted-foreground">Calendars and notices released publicly by DMPS.</p>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">4. Inaccuracies and Corrections</h2>
            <p className="text-sm sm:text-base leading-relaxed text-foreground/90">
              Because school policies, schedules, and contacts change frequently, we welcome feedback
              from community members and school staff. If you notice any discrepancy or outdated
              item, please use the "Report information" button or contact us via our directory.
            </p>
          </section>
        </article>
      ) : (
        <article className="space-y-8">
          {/* Key Callout Box */}
          <div className="rounded-2xl border-2 border-primary/30 bg-primary/5 p-5 sm:p-6 text-foreground">
            <div className="flex items-start gap-3">
              <ShieldAlert className="size-6 text-primary shrink-0 mt-0.5" aria-hidden="true" />
              <div className="space-y-2">
                <h2 className="text-base font-bold sm:text-lg text-foreground">
                  Declaración Fundamental de Independencia
                </h2>
                <p className="text-sm sm:text-base leading-relaxed">
                  <strong>DMPS INFO es un portal comunitario independiente.</strong> No está afiliado
                  oficialmente a Des Moines Public Schools (DMPS), su Junta Escolar ni su
                  administración institucional. Para trámites y comunicaciones oficiales, consulta
                  siempre <a href="https://www.dmschools.org" target="_blank" rel="noopener noreferrer" className="font-bold underline text-primary">dmschools.org</a>.
                </p>
              </div>
            </div>
          </div>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">1. Misión e Identidad Comunitaria</h2>
            <p className="text-sm sm:text-base leading-relaxed text-foreground/90">
              DMPS INFO surgió como una iniciativa cívica independiente para ayudar a familias
              hispanohablantes y multilingües de Des Moines, Iowa, a acceder en su idioma a horarios
              escolares, calendarios, actividades, programas estudiantiles y rutas de transporte
              público.
            </p>
            <p className="text-sm sm:text-base leading-relaxed text-foreground/90">
              Este sitio no es una agencia estatal, no es una oficina escolar oficial ni tiene
              autoridad directiva en las escuelas de Des Moines. Ningún contenido publicado aquí
              constituye una directriz o política oficial emitida por las autoridades del distrito.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">
              2. Propiedad Intelectual, Nombres Escolares y Marcas
            </h2>
            <p className="text-sm sm:text-base leading-relaxed text-foreground/90">
              Los términos "Des Moines Public Schools", "DMPS", así como los nombres de las escuelas
              secundarias, intermedias y primarias (tales como Lincoln High School, East High School,
              Roosevelt High School, Hoover High School, North High School, Central Campus, Central
              Academy y otras), junto a sus mascotas y emblemas, pertenecen a sus respectivos
              titulares y al distrito escolar.
            </p>
            <p className="text-sm sm:text-base leading-relaxed text-foreground/90">
              Cualquier referencia en este portal a escuelas o programas del distrito se realiza
              exclusivamente con fines descriptivos, informativos y de identificación comunitaria,
              permitiendo que las familias ubiquen la escuela a la que asisten sus estudiantes. Dicha
              mención no implica respaldo, patrocinio ni vínculo corporativo por parte de Des Moines
              Public Schools.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">
              3. Gestiones Oficiales y Expedientes Estudiantiles
            </h2>
            <p className="text-sm sm:text-base leading-relaxed text-foreground/90">
              DMPS INFO no tramita matrículas, no emite credenciales, no gestiona calificaciones ni
              tiene acceso a expedientes estudiantiles. Todo trámite legal o administrativo debe
              realizarse por los canales oficiales del distrito:
            </p>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-border bg-secondary/50 p-4 space-y-1">
                <span className="text-xs font-bold uppercase text-primary">Sitio Web Oficial</span>
                <p className="text-sm font-semibold text-foreground">dmschools.org</p>
                <a
                  href="https://www.dmschools.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline inline-flex items-center gap-1 font-medium"
                >
                  Visitar sitio oficial <ExternalLink className="size-3" />
                </a>
              </div>

              <div className="rounded-xl border border-border bg-secondary/50 p-4 space-y-1">
                <span className="text-xs font-bold uppercase text-primary">Sistema Escolar Familiar</span>
                <p className="text-sm font-semibold text-foreground">Infinite Campus Parent Portal</p>
                <p className="text-xs text-muted-foreground">Calificaciones, asistencia y registros formales.</p>
              </div>

              <div className="rounded-xl border border-border bg-secondary/50 p-4 space-y-1">
                <span className="text-xs font-bold uppercase text-primary">Oficinas Centrales del Distrito</span>
                <p className="text-sm font-semibold text-foreground">2100 Fleur Drive, Des Moines, IA 50321</p>
                <p className="text-xs text-muted-foreground">Teléfono general: (515) 242-7911</p>
              </div>

              <div className="rounded-xl border border-border bg-secondary/50 p-4 space-y-1">
                <span className="text-xs font-bold uppercase text-primary">Fuentes Empleadas</span>
                <p className="text-sm font-semibold text-foreground">Avisos Públicos Abiertos</p>
                <p className="text-xs text-muted-foreground">Publicaciones y circulares emitidas públicamente por DMPS.</p>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">4. Reporte de Inconsistencias</h2>
            <p className="text-sm sm:text-base leading-relaxed text-foreground/90">
              Dado que los calendarios y las directrices escolares pueden variar, invitamos a las
              familias y al personal docente a reportar cualquier dato inexacto mediante la opción
              "Reportar información" presente en las páginas del sitio.
            </p>
          </section>
        </article>
      )}
    </LegalPageLayout>
  );
}
