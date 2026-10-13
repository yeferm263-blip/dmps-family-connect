import { createFileRoute } from "@tanstack/react-router";
import { Scale, ShieldCheck, ExternalLink, AlertCircle, FileCheck, CheckCircle2 } from "lucide-react";
import { LegalPageLayout } from "@/components/legal/legal-page-layout";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/terms-of-use")({
  head: () => ({
    meta: [
      { title: "Términos de Uso — DMPS INFO" },
      {
        name: "description",
        content:
          "Condiciones generales de uso, buena fe, enlaces a plataformas externas y descargos de responsabilidad de DMPS INFO.",
      },
      { property: "og:title", content: "Términos de Uso — DMPS INFO" },
      {
        property: "og:description",
        content: "Condiciones de uso cívico y comunitario para las familias de Des Moines, Iowa.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://dmpsinfo.lovable.app/terms-of-use" },
    ],
    links: [{ rel: "canonical", href: "https://dmpsinfo.lovable.app/terms-of-use" }],
  }),
  component: TermsOfUsePage,
});

function TermsOfUsePage() {
  const { lang } = useI18n();
  const isEn = lang === "en";

  return (
    <LegalPageLayout
      currentPath="/terms-of-use"
      titleEs="Términos de Uso del Servicio"
      titleEn="Terms of Use"
      subtitleEs="Normas de uso de buena fe, enlaces a plataformas externas y condiciones generales del portal comunitario."
      subtitleEn="Good-faith usage guidelines, third-party link policies, and general service conditions."
    >
      {isEn ? (
        <article className="space-y-8">
          <div className="rounded-2xl border-2 border-primary/20 bg-primary/5 p-5 sm:p-6 text-foreground">
            <h2 className="text-base font-bold sm:text-lg text-foreground mb-2 flex items-center gap-2">
              <Scale className="size-5 text-primary" />
              <span>Agreement Summary</span>
            </h2>
            <p className="text-sm sm:text-base leading-relaxed text-foreground/90">
              By accessing DMPS INFO, you agree to these Terms of Use. This website is a free,
              volunteer-driven community service provided to support school families in Des Moines,
              Iowa.
            </p>
          </div>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">1. Good-Faith Community Use</h2>
            <p className="text-sm sm:text-base leading-relaxed text-foreground/90">
              Users are welcome to browse, share, and utilize all informational resources for personal,
              family, and educational purposes. When interacting with the portal, you agree not to:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-sm text-foreground/85">
              <li>
                Engage in disruptive technical behavior, including denial-of-service (DDoS) attacks,
                automated vulnerability scanning, or malicious scraping that degrades website
                performance.
              </li>
              <li>
                Impersonate school district officials, educational staff, or DMPS INFO contributors.
              </li>
              <li>
                Post abusive, defamatory, or unlawful content in community comment fields.
              </li>
              <li>
                Publish sensitive personal information regarding students, teachers, or minors.
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">
              2. Third-Party Portals and External Services
            </h2>
            <p className="text-sm sm:text-base leading-relaxed text-foreground/90">
              For convenience, DMPS INFO provides links and embeds connecting to external systems:
            </p>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-border bg-secondary/40 p-4 space-y-1">
                <span className="text-xs font-bold uppercase text-primary">Academic Portal</span>
                <p className="text-sm font-semibold text-foreground">Infinite Campus</p>
                <p className="text-xs text-muted-foreground">
                  Official DMPS portal for grades, attendance, and registration records.
                </p>
              </div>

              <div className="rounded-xl border border-border bg-secondary/40 p-4 space-y-1">
                <span className="text-xs font-bold uppercase text-primary">Public Transit</span>
                <p className="text-sm font-semibold text-foreground">DART Transit Authority</p>
                <p className="text-xs text-muted-foreground">
                  Des Moines Area Regional Transit bus schedules and real-time trackers.
                </p>
              </div>

              <div className="rounded-xl border border-border bg-secondary/40 p-4 space-y-1">
                <span className="text-xs font-bold uppercase text-primary">Athletics & Activities</span>
                <p className="text-sm font-semibold text-foreground">Bound / Varsity Bound</p>
                <p className="text-xs text-muted-foreground">
                  Official Iowa high school sports schedules and ticket sales.
                </p>
              </div>
            </div>

            <p className="text-sm sm:text-base leading-relaxed text-foreground/90">
              <strong>Third-Party Disclaimer:</strong> DMPS INFO has no control over the uptime,
              availability, privacy practices, or accuracy of third-party platforms. Your use of
              external services is governed exclusively by their respective terms and privacy
              agreements.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">
              3. Service Availability and Disclaimer of Warranties
            </h2>
            <p className="text-sm sm:text-base leading-relaxed text-foreground/90">
              DMPS INFO is provided on an "as is" and "as available" basis. While we strive to maintain
              accurate, timely, and accessible information, we make no express or implied warranties
              that the service will be entirely uninterrupted, error-free, or continuously updated in
              real time.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">4. Limitation of Liability</h2>
            <p className="text-sm sm:text-base leading-relaxed text-foreground/90">
              To the extent permitted by applicable law, DMPS INFO and its community contributors
              shall not be held liable for damages, misunderstandings, or scheduling conflicts
              arising from reliance on materials published on this portal. For all critical,
              time-sensitive, academic, or disciplinary matters, families should verify information
              directly with their child's school administration.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">5. Governing Law</h2>
            <p className="text-sm sm:text-base leading-relaxed text-foreground/90">
              These Terms of Use are governed by the laws of the State of Iowa. Any dispute arising
              under these terms shall be subject to the jurisdiction of the state or federal courts
              located in Polk County, Iowa.
            </p>
          </section>
        </article>
      ) : (
        <article className="space-y-8">
          <div className="rounded-2xl border-2 border-primary/20 bg-primary/5 p-5 sm:p-6 text-foreground">
            <h2 className="text-base font-bold sm:text-lg text-foreground mb-2 flex items-center gap-2">
              <Scale className="size-5 text-primary" />
              <span>Resumen de Condiciones de Uso</span>
            </h2>
            <p className="text-sm sm:text-base leading-relaxed text-foreground/90">
              Al utilizar el portal DMPS INFO, usted acepta estos Términos de Uso. Este sitio web es
              un recurso cívico y gratuito desarrollado por voluntarios para apoyar a las familias
              escolares de Des Moines, Iowa.
            </p>
          </div>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">1. Uso de Buena Fe y Conductas Prohibidas</h2>
            <p className="text-sm sm:text-base leading-relaxed text-foreground/90">
              Toda la comunidad escolar está invitada a leer, consultar y compartir los contenidos de
              este sitio para fines personales, familiares y educativos. Al interactuar con el portal,
              usted se compromete a:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-sm text-foreground/85">
              <li>
                No ejecutar ataques informáticos, denegación de servicio (DDoS), escaneos maliciosos
                ni extracción automatizada masiva (*scraping* abusivo) que afecte el rendimiento del
                sitio.
              </li>
              <li>
                No suplantar la identidad de funcionarios del distrito escolar, profesores ni
                administradores del portal.
              </li>
              <li>
                No publicar mensajes difamatorios, agresivos o ilícitos en las secciones comunitarias
                de comentarios.
              </li>
              <li>
                No divulgar datos personales protegidos de estudiantes, docentes o menores de edad.
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">
              2. Enlaces a Plataformas y Servicios de Terceros
            </h2>
            <p className="text-sm sm:text-base leading-relaxed text-foreground/90">
              Para facilitar la gestión escolar de las familias, DMPS INFO incluye enlaces directos y
              accesos a sistemas operados por terceros:
            </p>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-border bg-secondary/40 p-4 space-y-1">
                <span className="text-xs font-bold uppercase text-primary">Expediente Escolar</span>
                <p className="text-sm font-semibold text-foreground">Infinite Campus</p>
                <p className="text-xs text-muted-foreground">
                  Portal oficial de calificaciones, asistencia y trámites de matrícula de DMPS.
                </p>
              </div>

              <div className="rounded-xl border border-border bg-secondary/40 p-4 space-y-1">
                <span className="text-xs font-bold uppercase text-primary">Transporte Público</span>
                <p className="text-sm font-semibold text-foreground">DART Transit Authority</p>
                <p className="text-xs text-muted-foreground">
                  Rutas, paradas y horarios de autobuses del área metropolitana de Des Moines.
                </p>
              </div>

              <div className="rounded-xl border border-border bg-secondary/40 p-4 space-y-1">
                <span className="text-xs font-bold uppercase text-primary">Deportes Escolares</span>
                <p className="text-sm font-semibold text-foreground">Bound / Varsity Bound</p>
                <p className="text-xs text-muted-foreground">
                  Horarios atléticos de escuelas de Iowa y boletos de entrada a actividades.
                </p>
              </div>
            </div>

            <p className="text-sm sm:text-base leading-relaxed text-foreground/90">
              <strong>Descargo sobre Servicios de Terceros:</strong> DMPS INFO no controla, administra
              ni responde por el funcionamiento, disponibilidad, seguridad ni políticas de
              privacidad de dichas plataformas externas. El uso de esos servicios se rige
              exclusivamente por los términos y contratos de sus respectivos proveedores.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">
              3. Disponibilidad y Exención de Garantías
            </h2>
            <p className="text-sm sm:text-base leading-relaxed text-foreground/90">
              DMPS INFO se proporciona "tal cual" y "según disponibilidad". Aunque nuestro equipo
              trabaja constantemente para mantener información clara y veraz, no garantizamos que el
              servicio sea ininterrumpido ni completamente libre de errores tipográficos o demoras en
              la actualización.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">4. Limitación de Responsabilidad</h2>
            <p className="text-sm sm:text-base leading-relaxed text-foreground/90">
              En la medida permitida por la legislación aplicable, DMPS INFO y sus colaboradores
              voluntarios no serán responsables por demoras, confusiones o inconvenientes derivados de
              la consulta de datos en este sitio. Para decisiones académicas, disciplinarias o de
              asistencia escolar formal, las familias deben confirmar siempre con la dirección de la
              escuela de su estudiante.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">5. Ley Aplicable y Jurisdicción</h2>
            <p className="text-sm sm:text-base leading-relaxed text-foreground/90">
              Estos Términos de Uso se rigen por las leyes del Estado de Iowa. Cualquier controversia
              relacionada con este sitio estará sujeta a la jurisdicción de los tribunales competentes
              en el Condado de Polk, Iowa.
            </p>
          </section>
        </article>
      )}
    </LegalPageLayout>
  );
}
