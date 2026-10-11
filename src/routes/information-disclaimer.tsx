import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, CloudSnow, Clock, Bus, CheckCircle2, PhoneCall, ExternalLink } from "lucide-react";
import { LegalPageLayout } from "@/components/legal/legal-page-layout";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/information-disclaimer")({
  head: () => ({
    meta: [
      { title: "Descargo de Horarios e Información — DMPS INFO" },
      {
        name: "description",
        content:
          "Descargo de responsabilidad sobre horarios de campanas, calendarios académicos, emergencias invernales y rutas de transporte en DMPS INFO.",
      },
      { property: "og:title", content: "Descargo de Información — DMPS INFO" },
      {
        property: "og:description",
        content: "Avisos sobre cambios imprevistos en calendarios y horarios escolares en Des Moines.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://familiasdmps.app/information-disclaimer" },
    ],
    links: [{ rel: "canonical", href: "https://familiasdmps.app/information-disclaimer" }],
  }),
  component: InformationDisclaimerPage,
});

function InformationDisclaimerPage() {
  const { lang } = useI18n();
  const isEn = lang === "en";

  return (
    <LegalPageLayout
      currentPath="/information-disclaimer"
      titleEs="Descargo de Horarios, Calendarios y Alertas Escolares"
      titleEn="Schedule, Calendar & Weather Alerts Disclaimer"
      subtitleEs="Aclaraciones sobre la naturaleza cambiante de los horarios escolares, emergencias de nieve y rutas de transporte."
      subtitleEn="Clarifications regarding changing bell schedules, winter weather alerts, and public transit information."
    >
      {isEn ? (
        <article className="space-y-8">
          <div className="rounded-2xl border-2 border-warning/30 bg-warning/10 p-5 sm:p-6 text-warning-foreground">
            <h2 className="text-base font-bold sm:text-lg mb-2 flex items-center gap-2">
              <AlertTriangle className="size-5 text-warning" />
              <span>Good-Faith Information Notice</span>
            </h2>
            <p className="text-sm sm:text-base leading-relaxed">
              Information on this website—including bell schedules, yearly academic calendars, bus
              routes, and extracurricular events—is compiled in good faith from publicly released
              school announcements. However, school schedules and district plans are subject to
              change without advance notice.
            </p>
          </div>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Clock className="size-5 text-primary" />
              <span>1. District Operational Authority & Bell Schedules</span>
            </h2>
            <p className="text-sm sm:text-base leading-relaxed text-foreground/90">
              Des Moines Public Schools exercises full operational discretion over school hours,
              teacher professional development days, assembly schedules, and testing periods.
              Individual school leadership (such as Lincoln High School or East High School) may
              institute special bell schedules (e.g., block scheduling, advisory days, early releases)
              for specific dates.
            </p>
            <p className="text-sm sm:text-base leading-relaxed text-foreground/90">
              While DMPS INFO updates schedules whenever new district bulletins are published,
              families should treat portal times as general guidance and check daily school bulletins
              for event-specific adjustments.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <CloudSnow className="size-5 text-primary" />
              <span>2. Severe Winter Weather & Emergency Cancellations</span>
            </h2>
            <p className="text-sm sm:text-base leading-relaxed text-foreground/90">
              During Iowa winters, severe snow, freezing rain, and extreme wind chill temperatures
              frequently cause:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-sm text-foreground/85">
              <li><strong>2-Hour Late Starts:</strong> Adjusted morning bus and bell times.</li>
              <li><strong>Early Dismissals:</strong> Classes ending earlier than standard schedules.</li>
              <li><strong>Full School Closures (Snow Days):</strong> Cancellation of all academic and athletic activities.</li>
            </ul>
            <p className="text-sm sm:text-base leading-relaxed text-foreground/90">
              These decisions are made by the DMPS Superintendent's office, often in the early morning
              hours (between 5:00 a.m. and 6:00 a.m.). Because DMPS INFO is managed by community
              volunteers, we cannot guarantee instantaneous reflection of breaking cancellations.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Bus className="size-5 text-primary" />
              <span>3. Public Transit (DART) & Bus Routes</span>
            </h2>
            <p className="text-sm sm:text-base leading-relaxed text-foreground/90">
              Transportation routes and bus pass regulations are managed by the Des Moines Area
              Regional Transit Authority (DART). Detours caused by city construction, road closures,
              inclement weather, or staffing limitations are under the exclusive control of DART.
              Please verify real-time bus locations through the official MyDART app or website.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">
              4. Recommended Verification Channels
            </h2>
            <p className="text-sm sm:text-base leading-relaxed text-foreground/90">
              For time-critical school matters, we strongly encourage families to rely on these
              direct district channels:
            </p>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-border bg-secondary/50 p-4 space-y-1">
                <span className="text-xs font-bold uppercase text-primary">Automated Alerts</span>
                <p className="text-sm font-semibold text-foreground">Infinite Campus Notifications</p>
                <p className="text-xs text-muted-foreground">Direct SMS texts, emails, and automated voice calls from DMPS.</p>
              </div>

              <div className="rounded-xl border border-border bg-secondary/50 p-4 space-y-1">
                <span className="text-xs font-bold uppercase text-primary">District Webpage</span>
                <p className="text-sm font-semibold text-foreground">dmschools.org Alert Banner</p>
                <p className="text-xs text-muted-foreground">Official red emergency alert banner at top of district homepage.</p>
              </div>

              <div className="rounded-xl border border-border bg-secondary/50 p-4 space-y-1">
                <span className="text-xs font-bold uppercase text-primary">Local Broadcast News</span>
                <p className="text-sm font-semibold text-foreground">Des Moines TV Stations</p>
                <p className="text-xs text-muted-foreground">KCCI (Ch. 8), WHO 13, and Local 5 News morning crawls.</p>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">5. Report Outdated Information</h2>
            <p className="text-sm sm:text-base leading-relaxed text-foreground/90">
              If a bell time has been updated or a calendar date adjusted at your school, please let
              us know using the "Report information" button located on that page. We review and
              correct community submissions promptly.
            </p>
          </section>
        </article>
      ) : (
        <article className="space-y-8">
          <div className="rounded-2xl border-2 border-warning/30 bg-warning/10 p-5 sm:p-6 text-warning-foreground">
            <h2 className="text-base font-bold sm:text-lg mb-2 flex items-center gap-2">
              <AlertTriangle className="size-5 text-warning" />
              <span>Aviso de Buena Fe sobre Horarios y Calendarios</span>
            </h2>
            <p className="text-sm sm:text-base leading-relaxed">
              La información contenida en este sitio —incluyendo horarios de campanas, calendarios del
              ciclo escolar, rutas de autobús y fechas de eventos— es recopilada de buena fe a partir
              de los anuncios públicos del distrito. Sin embargo, los horarios y las decisiones
              escolares están sujetos a cambios imprevistos por parte de las autoridades educativas.
            </p>
          </div>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Clock className="size-5 text-primary" />
              <span>1. Autoridad Operativa del Distrito y Horarios de Campanas</span>
            </h2>
            <p className="text-sm sm:text-base leading-relaxed text-foreground/90">
              Des Moines Public Schools tiene plena potestad para alterar los horarios de entrada y
              salida, días de desarrollo profesional docente, asambleas estudiantiles y períodos de
              exámenes. La dirección de cada escuela (por ejemplo, Lincoln High School o East High
              School) puede implementar horarios especiales en fechas específicas.
            </p>
            <p className="text-sm sm:text-base leading-relaxed text-foreground/90">
              Aunque DMPS INFO actualiza sus guías cuando se publican nuevas circulares, las familias
              deben utilizar los horarios aquí expuestos como una referencia orientativa y consultar
              los boletines diarios escolares para confirmar fechas clave.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <CloudSnow className="size-5 text-primary" />
              <span>2. Emergencias Climáticas y Días de Nieve</span>
            </h2>
            <p className="text-sm sm:text-base leading-relaxed text-foreground/90">
              Durante los meses de invierno en Iowa, tormentas de nieve, hielo en las calles o frío
              extremo provocan frecuentemente:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-sm text-foreground/85">
              <li><strong>Inicios Tardíos de 2 Horas (*Late Starts*):</strong> Los autobuses y las clases inician dos horas después de lo habitual.</li>
              <li><strong>Salidas Tempranas (*Early Dismissals*):</strong> Las escuelas cierran antes de la hora acostumbrada.</li>
              <li><strong>Cancelaciones Totales (*Snow Days*):</strong> Suspensión completa de clases y actividades vespertinas.</li>
            </ul>
            <p className="text-sm sm:text-base leading-relaxed text-foreground/90">
              Estas resoluciones son tomadas por la superintendencia de DMPS a tempranas horas de la
              mañana (generalmente entre las 5:00 a.m. y las 6:00 a.m.). Debido a que DMPS INFO es un
              portal gestionado por colaboradores comunitarios, no podemos asegurar que las
              cancelaciones de última hora se reflejen instantáneamente en nuestro sitio.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Bus className="size-5 text-primary" />
              <span>3. Transporte Público (DART) y Desvíos de Ruta</span>
            </h2>
            <p className="text-sm sm:text-base leading-relaxed text-foreground/90">
              Las rutas de autobús y los programas de pases para estudiantes son operados por la
              Autoridad Regional de Tránsito de Des Moines (DART). Desvíos por obras viales, cierres de
              calles por nieve o retrasos de unidades corresponden a la gestión de DART. Para rastrear
              un autobús en tiempo real, recomendamos utilizar la aplicación oficial MyDART.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">
              4. Canales Oficiales Recomendados para Casos Críticos
            </h2>
            <p className="text-sm sm:text-base leading-relaxed text-foreground/90">
              Para emergencias invernales o días de exámenes en los que la puntualidad sea
              indispensable, verifique siempre las fuentes directas del distrito:
            </p>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-border bg-secondary/50 p-4 space-y-1">
                <span className="text-xs font-bold uppercase text-primary">Alertas Automatizadas</span>
                <p className="text-sm font-semibold text-foreground">Mensajes de Infinite Campus</p>
                <p className="text-xs text-muted-foreground">Llamadas telefónicas, correos y SMS directos emitidos por DMPS.</p>
              </div>

              <div className="rounded-xl border border-border bg-secondary/50 p-4 space-y-1">
                <span className="text-xs font-bold uppercase text-primary">Portal del Distrito</span>
                <p className="text-sm font-semibold text-foreground">Aviso en dmschools.org</p>
                <p className="text-xs text-muted-foreground">Banner rojo de alerta en la parte superior de la página principal del distrito.</p>
              </div>

              <div className="rounded-xl border border-border bg-secondary/50 p-4 space-y-1">
                <span className="text-xs font-bold uppercase text-primary">Televisión y Radio Local</span>
                <p className="text-sm font-semibold text-foreground">Canales de Des Moines</p>
                <p className="text-xs text-muted-foreground">Cintillos informativos en KCCI Canal 8, WHO 13 y Local 5 News.</p>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">5. Reporte de Información Desactualizada</h2>
            <p className="text-sm sm:text-base leading-relaxed text-foreground/90">
              Si detecta un horario que ha sido modificado o un cambio en el calendario de su
              escuela, le agradecemos notificárnoslo mediante el botón "Reportar información" presente
              en la página correspondiente.
            </p>
          </section>
        </article>
      )}
    </LegalPageLayout>
  );
}
