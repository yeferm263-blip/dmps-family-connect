import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck, Eye, Database, Globe, AlertTriangle, Lock, Search } from "lucide-react";
import { LegalPageLayout } from "@/components/legal/legal-page-layout";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/privacy-policy")({
  head: () => ({
    meta: [
      { title: "Política de Privacidad y Transparencia — DMPS INFO" },
      {
        name: "description",
        content:
          "Prácticas reales de privacidad, analítica seudónima, almacenamiento local y tratamiento de datos en el portal comunitario DMPS INFO.",
      },
      { property: "og:title", content: "Política de Privacidad — DMPS INFO" },
      {
        property: "og:description",
        content: "Transparencia técnica y privacidad para familias escolares de Des Moines.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://dmpsinfo.lovable.app/privacy-policy" },
    ],
    links: [{ rel: "canonical", href: "https://dmpsinfo.lovable.app/privacy-policy" }],
  }),
  component: PrivacyPolicyPage,
});

function PrivacyPolicyPage() {
  const { lang } = useI18n();
  const isEn = lang === "en";

  return (
    <LegalPageLayout
      currentPath="/privacy-policy"
      titleEs="Política de Privacidad y Transparencia Técnica"
      titleEn="Privacy & Technical Transparency Policy"
      subtitleEs="Explicación detallada de cómo funciona el portal, qué datos técnicos se procesan y cuáles son nuestros límites de recopilación."
      subtitleEn="Detailed breakdown of portal operations, technical data processing, and our collection limits."
    >
      {isEn ? (
        <article className="space-y-8">
          {/* Key Summary Box */}
          <div className="rounded-2xl border-2 border-primary/20 bg-primary/5 p-5 sm:p-6 text-foreground">
            <h2 className="text-base font-bold sm:text-lg text-foreground mb-2 flex items-center gap-2">
              <ShieldCheck className="size-5 text-primary" />
              <span>Core Privacy Highlights</span>
            </h2>
            <ul className="grid gap-2 sm:grid-cols-2 text-sm text-foreground/90">
              <li className="flex items-start gap-2">
                <span className="font-bold text-primary">•</span>
                <span><strong>No general user accounts:</strong> Families browse freely without creating a login.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-primary">•</span>
                <span><strong>No commercial data sales:</strong> We do not sell or rent data to advertising brokers.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-primary">•</span>
                <span><strong>Pseudonymous internal analytics:</strong> Activity is tracked using browser-generated IDs.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-primary">•</span>
                <span><strong>Third-party players:</strong> Embedded audio (Spotify) and video (YouTube) run external code.</span>
              </li>
            </ul>
          </div>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">1. Access Without User Accounts</h2>
            <p className="text-sm sm:text-base leading-relaxed text-foreground/90">
              To read bell schedules, calendars, articles, transit resources, or school directories,
              visitors are never asked to register, sign in, or provide identification. User
              authentication on DMPS INFO is restricted strictly to verified community editors and
              administrators via the private staff portal.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">
              2. Technical Telemetry & Pseudonymous Analytics
            </h2>
            <p className="text-sm sm:text-base leading-relaxed text-foreground/90">
              To understand how our community uses the portal and verify that critical resources
              (such as snow delay notices) are reachable, DMPS INFO operates an internal analytics
              subsystem built on Supabase. We do not use commercial trackers like Google Analytics
              or Facebook Pixel.
            </p>

            <div className="rounded-2xl border border-border bg-secondary/30 p-4 sm:p-5 space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-primary">
                Technical Data Processed by the Analytics Subsystem:
              </h3>
              <ul className="space-y-2 text-sm text-foreground/85">
                <li className="flex items-start gap-2">
                  <Database className="size-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <strong>Pseudonymous Device Identifier:</strong> A randomly generated UUID
                    (<code>dmps_analytics_anonymous_id</code>) stored in your browser's local
                    storage. This allows the system to recognize returning visits without identifying
                    the person behind the device.
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <Database className="size-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <strong>Session Identifier:</strong> A temporary UUID
                    (<code>dmps_analytics_session_id</code>) stored in session storage that resets
                    after 30 minutes of inactivity.
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <Eye className="size-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <strong>Page Views & Navigation:</strong> The URLs requested, page titles, active
                    school filter (e.g., Lincoln High School), interface language, and generalized
                    device category (mobile, tablet, desktop, operating system, and browser family).
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <Globe className="size-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <strong>Real-Time Presence Heartbeats:</strong> While a page tab remains visible,
                    an automated pulse is sent every 15–45 seconds to maintain an aggregate count of
                    active online readers.
                  </div>
                </li>
              </ul>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">
              3. Search Queries & Sanitization Limits
            </h2>
            <p className="text-sm sm:text-base leading-relaxed text-foreground/90">
              When you use our search box, query terms are processed to show relevant school articles.
              Our system includes an automated filter that replaces text matching email address
              patterns and 10-digit telephone patterns with <code>[redacted-email]</code> and{" "}
              <code>[redacted-phone]</code>.
            </p>
            <div className="rounded-xl border border-warning/40 bg-warning/10 p-4 text-xs sm:text-sm text-warning-foreground space-y-1">
              <div className="flex items-center gap-2 font-bold">
                <AlertTriangle className="size-4 shrink-0 text-warning" />
                <span>Important Transparency Notice Regarding Search:</span>
              </div>
              <p>
                The automated sanitization filter cannot detect or redact names, student numbers, or
                unformatted sensitive details. Search queries are recorded alongside your session
                identifier. Please avoid typing personal names or confidential records into the search
                field.
              </p>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">
              4. Voluntary Submissions: Reports and Podcast Comments
            </h2>
            <div className="space-y-3 text-sm sm:text-base leading-relaxed text-foreground/90">
              <p>
                <strong>Information Reports (ReportInfoDialog):</strong> If you notify us of a broken
                link, wrong date, or translation error, your message, the current page URL, and an{" "}
                <strong>optional contact email</strong> (if you choose to provide one) are stored in
                our database (<code>update_requests</code>). Access to these reports is restricted to
                authorized staff.
              </p>
              <p>
                <strong>Public Podcast Comments:</strong> When you leave a comment on our podcast
                episodes, the author name you input (or "Oyente de la comunidad" if blank) and your
                comment text are saved to the public database and become visible to all community
                visitors. Do not submit student records, phone numbers, or private details in public
                comments.
              </p>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">
              5. Third-Party Integrations & Infrastructure Logging
            </h2>
            <p className="text-sm sm:text-base leading-relaxed text-foreground/90">
              While our application code does not store user IP addresses in analytics tables,
              interacting with modern internet services involves network data exchange:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-sm text-foreground/85">
              <li>
                <strong>Server & Cloud Hosting Logs:</strong> Standard web servers, content delivery
                networks (CDNs), and cloud providers inherently process your device's IP address and
                HTTP headers during network transmission for routing, DDoS protection, and security.
              </li>
              <li>
                <strong>Spotify IFrame Player API:</strong> On podcast pages, our app loads the
                official Spotify script (<code>open.spotify.com/embed/iframe-api/v1</code>). Spotify
                processes user connections and sets cookies according to its own privacy policy.
              </li>
              <li>
                <strong>Embedded Videos:</strong> Articles containing video embeds (e.g., YouTube or
                Vimeo) load content directly from those providers, who may process viewer network
                data and apply cookies.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">
              6. Alignment with Children's Privacy (COPPA) & Iowa Standards
            </h2>
            <p className="text-sm sm:text-base leading-relaxed text-foreground/90">
              DMPS INFO is an informational resource intended for parents, guardians, educators, and
              community members. We do not knowingly solicit personal contact information from
              children under the age of 13. We voluntarily adhere to data minimization principles
              reflected in the Children's Online Privacy Protection Act (COPPA) and the consumer
              privacy framework of Iowa Code Chapter 715D by prohibiting the commercial sale of
              personal information and refusing targeted cross-site ad tracking.
            </p>
          </section>
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">7. Advertising (Google AdSense)</h2>
            <p className="text-sm sm:text-base leading-relaxed text-foreground/90">
              This site may display ads served by Google AdSense. Third-party vendors, including
              Google, use cookies to serve ads based on a user&apos;s prior visits to this website or
              other websites. Google&apos;s use of advertising cookies enables it and its partners to
              serve ads based on visits to this and other sites. You may opt out of personalized
              advertising by visiting{" "}
              <a className="text-primary underline" href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer">Google Ads Settings</a>{" "}
              or{" "}
              <a className="text-primary underline" href="https://www.aboutads.info" target="_blank" rel="noopener noreferrer">www.aboutads.info</a>.
              Learn more at{" "}
              <a className="text-primary underline" href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer">How Google uses data</a>.
            </p>
          </section>
        </article>
      ) : (
        <article className="space-y-8">
          {/* Key Summary Box */}
          <div className="rounded-2xl border-2 border-primary/20 bg-primary/5 p-5 sm:p-6 text-foreground">
            <h2 className="text-base font-bold sm:text-lg text-foreground mb-2 flex items-center gap-2">
              <ShieldCheck className="size-5 text-primary" />
              <span>Puntos Clave de Privacidad y Transparencia</span>
            </h2>
            <ul className="grid gap-2 sm:grid-cols-2 text-sm text-foreground/90">
              <li className="flex items-start gap-2">
                <span className="font-bold text-primary">•</span>
                <span><strong>Sin cuentas obligatorias:</strong> Las familias navegan sin registrarse ni crear contraseñas.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-primary">•</span>
                <span><strong>No vendemos datos:</strong> No comercializamos información con corredores de publicidad.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-primary">•</span>
                <span><strong>Analítica seudónima propia:</strong> Usamos identificadores técnicos generados en el navegador.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-primary">•</span>
                <span><strong>Reproductores externos:</strong> Spotify y reproductores de video ejecutan código de sus proveedores.</span>
              </li>
            </ul>
          </div>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">1. Acceso Libre Sin Cuentas de Usuario</h2>
            <p className="text-sm sm:text-base leading-relaxed text-foreground/90">
              Para consultar calendarios, horarios de campanas, artículos, programas de graduación y
              rutas de transporte, las familias **nunca necesitan registrarse ni iniciar sesión**. El
              acceso con contraseña en DMPS INFO está restringido exclusivamente a editores y
              administradores autorizados del portal mediante el panel interno.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">
              2. Telemetría Técnica y Analítica Seudónima
            </h2>
            <p className="text-sm sm:text-base leading-relaxed text-foreground/90">
              Para saber qué contenidos son más requeridos por la comunidad (por ejemplo, si los
              avisos de retraso por nieve están siendo leídos), DMPS INFO opera un subsistema de
              analítica interno alojado en Supabase. No utilizamos plataformas publicitarias como
              Google Analytics ni píxeles de Meta/Facebook.
            </p>

            <div className="rounded-2xl border border-border bg-secondary/30 p-4 sm:p-5 space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-primary">
                Datos Técnicos Registrados por el Subsistema de Analítica:
              </h3>
              <ul className="space-y-2 text-sm text-foreground/85">
                <li className="flex items-start gap-2">
                  <Database className="size-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <strong>Identificador Seudónimo de Dispositivo:</strong> Un código UUID
                    (<code>dmps_analytics_anonymous_id</code>) generado de forma aleatoria y guardado
                    en el almacenamiento local de su navegador. Permite medir visitas recurrentes sin
                    conocer la identidad de la persona.
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <Database className="size-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <strong>Identificador de Sesión:</strong> Un UUID temporal
                    (<code>dmps_analytics_session_id</code>) en el almacenamiento de sesión que
                    expira automáticamente tras 30 minutos de inactividad.
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <Eye className="size-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <strong>Visitas e Interacciones:</strong> Páginas visitadas, títulos, escuela
                    seleccionada como filtro (ej. Lincoln High School), idioma de lectura, tipo de
                    dispositivo (móvil, tableta o computadora), sistema operativo y navegador.
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <Globe className="size-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <strong>Pulsos de Presencia en Tiempo Real:</strong> Mientras la pestaña del portal
                    permanece visible, se emite un pulso cada 15 a 45 segundos para mantener un conteo
                    agregado de lectores en línea.
                  </div>
                </li>
              </ul>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">
              3. Búsquedas y Límites del Filtro de Sanitización
            </h2>
            <p className="text-sm sm:text-base leading-relaxed text-foreground/90">
              Cuando utiliza la barra de búsqueda, el sistema procesa los términos introducidos.
              Contamos con un filtro automatizado que sustituye patrones coincidentes con correos
              electrónicos y números de teléfono estadounidenses por <code>[redacted-email]</code> y{" "}
              <code>[redacted-phone]</code>.
            </p>
            <div className="rounded-xl border border-warning/40 bg-warning/10 p-4 text-xs sm:text-sm text-warning-foreground space-y-1">
              <div className="flex items-center gap-2 font-bold">
                <AlertTriangle className="size-4 shrink-0 text-warning" />
                <span>Advertencia Importante sobre las Búsquedas:</span>
              </div>
              <p>
                Este filtro automatizado no puede identificar ni censurar nombres de personas, números
                de matrícula estudiantil ni información privada escrita en texto libre. Además, los
                términos buscados quedan asociados a su identificador de sesión. Le pedimos no escribir
                nombres de menores ni datos privados en la barra de búsqueda.
              </p>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">
              4. Formularios Voluntarios: Reportes y Comentarios
            </h2>
            <div className="space-y-3 text-sm sm:text-base leading-relaxed text-foreground/90">
              <p>
                <strong>Reporte de Inconsistencias (ReportInfoDialog):</strong> Si nos alerta sobre un
                enlace roto, fecha desactualizada o error de traducción, su mensaje, la URL de la
                página y un <strong>correo electrónico opcional</strong> (si decide facilitarlo para
                recibir seguimiento) se guardan en la tabla <code>update_requests</code>. El acceso a
                estos reportes está reservado al equipo administrativo.
              </p>
              <p>
                <strong>Comentarios Públicos en Podcasts:</strong> Si deja un comentario en un episodio
                de podcast, el nombre de autor que elija y el texto de su mensaje se almacenan en la
                base de datos y **serán visibles para cualquier visitante del sitio web**. Por favor, no
                comparta datos personales confidenciales de estudiantes en los comentarios públicos.
              </p>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">
              5. Integraciones de Terceros y Registros de Servidor
            </h2>
            <p className="text-sm sm:text-base leading-relaxed text-foreground/90">
              Aunque el código de nuestra aplicación no guarda las direcciones IP en las tablas de
              analítica, toda conexión por Internet requiere comunicación a nivel de red:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-sm text-foreground/85">
              <li>
                <strong>Registros del Servidor y Nube:</strong> Los servidores web, balanceadores de
                carga y proveedores de nube (GCP, Cloudflare) procesan de forma técnica la dirección
                IP del dispositivo para rutear la conexión y proteger contra ataques informáticos.
              </li>
              <li>
                <strong>Reproductor de Spotify:</strong> En las páginas de podcast, se carga el script
                oficial de Spotify (<code>open.spotify.com/embed/iframe-api/v1</code>). Spotify
                procesa las solicitudes y administra sus propias cookies según su política de
                privacidad.
              </li>
              <li>
                <strong>Videos Incrustados:</strong> Los artículos con videos incrustados (YouTube,
                Vimeo) cargan contenidos desde los servidores de dichos proveedores, quienes pueden
                procesar la IP del usuario y registrar datos de reproducción.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">
              6. Protección de Menores (COPPA) y Estándares de Iowa
            </h2>
            <p className="text-sm sm:text-base leading-relaxed text-foreground/90">
              DMPS INFO está concebido como una herramienta de apoyo para padres, tutores, docentes y
              estudiantes. No recopilamos intencionadamente datos de contacto de menores de 13 años.
              Adoptamos voluntariamente los principios de minimización de datos reconocidos en la ley
              COPPA y en la Ley de Protección de Datos del Consumidor de Iowa (Iowa Code Cap. 715D),
              garantizando que ningún dato se comercialice con terceros ni se venda a corredores de
              datos. Los anuncios de Google, si están activos, se rigen por la sección 7.
            </p>
          </section>
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">7. Publicidad (Google AdSense)</h2>
            <p className="text-sm sm:text-base leading-relaxed text-foreground/90">
              Este sitio puede mostrar anuncios de Google AdSense. Proveedores externos, incluido
              Google, utilizan cookies para mostrar anuncios basados en las visitas anteriores del
              usuario a este u otros sitios web. Las cookies de publicidad permiten a Google y a sus
              socios mostrar anuncios según dichas visitas. Puede inhabilitar la publicidad
              personalizada en la{" "}
              <a className="text-primary underline" href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer">Configuración de anuncios de Google</a>{" "}
              o en{" "}
              <a className="text-primary underline" href="https://www.aboutads.info" target="_blank" rel="noopener noreferrer">www.aboutads.info</a>.
              Más información en{" "}
              <a className="text-primary underline" href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer">Cómo usa Google los datos</a>.
            </p>
          </section>
        </article>
      )}
    </LegalPageLayout>
  );
}
