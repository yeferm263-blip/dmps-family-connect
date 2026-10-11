import { createFileRoute } from "@tanstack/react-router";
import { Cookie, Database, HardDrive, Info, Layers, RefreshCw, Trash2 } from "lucide-react";
import { LegalPageLayout } from "@/components/legal/legal-page-layout";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/cookie-policy")({
  head: () => ({
    meta: [
      { title: "Política de Cookies y Almacenamiento Local — DMPS INFO" },
      {
        name: "description",
        content:
          "Inventario técnico de cookies, almacenamiento local (localStorage) y de sesión (sessionStorage) utilizados en DMPS INFO.",
      },
      { property: "og:title", content: "Política de Cookies — DMPS INFO" },
      {
        property: "og:description",
        content: "Transparencia sobre el almacenamiento en el navegador para familias escolares.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://familiasdmps.app/cookie-policy" },
    ],
    links: [{ rel: "canonical", href: "https://familiasdmps.app/cookie-policy" }],
  }),
  component: CookiePolicyPage,
});

function CookiePolicyPage() {
  const { lang } = useI18n();
  const isEn = lang === "en";

  return (
    <LegalPageLayout
      currentPath="/cookie-policy"
      titleEs="Política de Cookies y Almacenamiento en el Navegador"
      titleEn="Cookie & Browser Storage Policy"
      subtitleEs="Inventario detallado de las cookies, almacenamiento local y de sesión que utiliza este sitio web para su funcionamiento."
      subtitleEn="Detailed inventory of cookies, localStorage, and sessionStorage utilized across this portal."
    >
      {isEn ? (
        <article className="space-y-8">
          <div className="rounded-2xl border-2 border-primary/20 bg-primary/5 p-5 sm:p-6 text-foreground">
            <h2 className="text-base font-bold sm:text-lg text-foreground mb-2 flex items-center gap-2">
              <Cookie className="size-5 text-primary" />
              <span>Storage Technology Overview</span>
            </h2>
            <p className="text-sm sm:text-base leading-relaxed text-foreground/90">
              DMPS INFO does not deploy third-party advertising cookies or cross-site tracking
              beacons. However, our interface relies on standard browser storage features (Cookies,{" "}
              <code>localStorage</code>, and <code>sessionStorage</code>) for functional operation,
              user preferences, and internal performance metrics.
            </p>
          </div>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">1. First-Party Cookies</h2>
            <p className="text-sm sm:text-base leading-relaxed text-foreground/90">
              Our application sets one direct first-party cookie:
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm border-collapse">
                <thead>
                  <tr className="border-b border-border bg-secondary/50 text-foreground font-bold">
                    <th className="p-3">Cookie Name</th>
                    <th className="p-3">Domain</th>
                    <th className="p-3">Purpose</th>
                    <th className="p-3">Lifespan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  <tr>
                    <td className="p-3 font-mono font-bold text-primary">sidebar_state</td>
                    <td className="p-3 text-muted-foreground">familiasdmps.app</td>
                    <td className="p-3">
                      Remembers whether the desktop side navigation panel is expanded or collapsed.
                    </td>
                    <td className="p-3 whitespace-nowrap">7 days</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">
              2. Local Storage (localStorage) Inventory
            </h2>
            <p className="text-sm sm:text-base leading-relaxed text-foreground/90">
              <code>localStorage</code> keeps data on your device even after you close the browser.
              The following keys are stored:
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm border-collapse">
                <thead>
                  <tr className="border-b border-border bg-secondary/50 text-foreground font-bold">
                    <th className="p-3">Key Name</th>
                    <th className="p-3">Classification</th>
                    <th className="p-3">Purpose</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 text-foreground/90">
                  <tr>
                    <td className="p-3 font-mono font-semibold text-primary">
                      dmps_analytics_anonymous_id
                    </td>
                    <td className="p-3 text-xs uppercase font-bold text-muted-foreground">
                      Internal Analytics
                    </td>
                    <td className="p-3">
                      A random pseudonymous UUID to measure repeat readership trends without personal
                      identifiers.
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono font-semibold text-primary">
                      dmps_lang_v2 / dmps_lang
                    </td>
                    <td className="p-3 text-xs uppercase font-bold text-muted-foreground">
                      User Preference
                    </td>
                    <td className="p-3">
                      Saves your selected language (Spanish or English) so you don't have to choose
                      it on every visit.
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono font-semibold text-primary">dmps_theme</td>
                    <td className="p-3 text-xs uppercase font-bold text-muted-foreground">
                      User Preference
                    </td>
                    <td className="p-3">
                      Stores whether you prefer Light mode, Dark mode, or your operating system's
                      default theme.
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono font-semibold text-primary">
                      dmps_selected_school / _v2
                    </td>
                    <td className="p-3 text-xs uppercase font-bold text-muted-foreground">
                      User Preference
                    </td>
                    <td className="p-3">
                      Remembers your preferred school filter (e.g., Lincoln High School or East High
                      School).
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono font-semibold text-primary">
                      dmps_onboarding_*
                    </td>
                    <td className="p-3 text-xs uppercase font-bold text-muted-foreground">
                      Functional
                    </td>
                    <td className="p-3">
                      Tracks tutorial progress and records completion so you are not interrupted on
                      subsequent visits.
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono font-semibold text-primary">
                      dmps_podcast_resume_positions
                    </td>
                    <td className="p-3 text-xs uppercase font-bold text-muted-foreground">
                      Functional
                    </td>
                    <td className="p-3">
                      Stores playback timestamps (in seconds) to resume podcast audio where you left
                      off.
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono font-semibold text-primary">
                      dmps_art_tr_v3_* / dmps_dom_tr_*
                    </td>
                    <td className="p-3 text-xs uppercase font-bold text-muted-foreground">
                      Functional Cache
                    </td>
                    <td className="p-3">
                      Caches bilingual translated article paragraphs to speed up page loading.
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono font-semibold text-primary">
                      sb-*-auth-token
                    </td>
                    <td className="p-3 text-xs uppercase font-bold text-muted-foreground">
                      Staff Security
                    </td>
                    <td className="p-3">
                      Stores authorization credentials only when verified staff members sign into
                      the administrative area.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">
              3. Session Storage (sessionStorage) Inventory
            </h2>
            <p className="text-sm sm:text-base leading-relaxed text-foreground/90">
              <code>sessionStorage</code> items exist only until you close the browser tab or window:
            </p>

            <ul className="list-disc pl-5 space-y-2 text-sm text-foreground/85">
              <li>
                <strong>dmps_analytics_session_id & dmps_analytics_session_last_active:</strong>{" "}
                Temporarily tracks current browsing session duration (resets after 30 minutes of
                inactivity).
              </li>
              <li>
                <strong>dmps_analytics_pwa_launch_recorded:</strong> Avoids counting duplicate launch
                events when running as a mobile progressive web app.
              </li>
              <li>
                <strong>floating_announcement_seen_*:</strong> Remembers if you dismissed a pop-up
                bulletin during your current visit so it doesn't pop up again repeatedly.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">
              4. Third-Party Embedded Media Cookies
            </h2>
            <p className="text-sm sm:text-base leading-relaxed text-foreground/90">
              When playing podcast episodes via the integrated Spotify player or viewing articles
              with embedded videos:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-sm text-foreground/85">
              <li>
                <strong>Spotify:</strong> Operates inside an <code>iframe</code> hosted at{" "}
                <code>open.spotify.com</code> and may set essential or analytics cookies under
                Spotify's privacy policies.
              </li>
              <li>
                <strong>Video Providers (YouTube, Vimeo):</strong> May place their own cookies to
                track playback metrics, volume preferences, and bandwidth quality.
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">
              5. How to Clear Browser Data
            </h2>
            <p className="text-sm sm:text-base leading-relaxed text-foreground/90">
              You can wipe all stored cookies and local data at any time through your browser
              settings:
            </p>
            <ol className="list-decimal pl-5 space-y-1.5 text-sm text-foreground/85">
              <li>Open your browser settings (Chrome, Safari, Firefox, or Edge).</li>
              <li>Navigate to <strong>Privacy and Security &gt; Clear Browsing Data</strong>.</li>
              <li>Check <strong>"Cookies and other site data"</strong> and confirm.</li>
            </ol>
            <div className="rounded-xl border border-border bg-secondary/30 p-4 text-xs text-muted-foreground flex items-start gap-2">
              <Info className="size-4 shrink-0 text-primary mt-0.5" />
              <span>
                <strong>Note:</strong> Clearing your device's browser storage resets your selected
                language, favorite school, and theme back to default settings. It does not alter or
                delete telemetry records that were already received by the server.
              </span>
            </div>
          </section>
        </article>
      ) : (
        <article className="space-y-8">
          <div className="rounded-2xl border-2 border-primary/20 bg-primary/5 p-5 sm:p-6 text-foreground">
            <h2 className="text-base font-bold sm:text-lg text-foreground mb-2 flex items-center gap-2">
              <Cookie className="size-5 text-primary" />
              <span>Resumen de Tecnologías de Almacenamiento</span>
            </h2>
            <p className="text-sm sm:text-base leading-relaxed text-foreground/90">
              DMPS INFO no utiliza cookies de redes publicitarias comerciales ni rastreadores entre
              sitios web. Sin embargo, para que el portal recuerde su idioma, su escuela de
              preferencia y sus podcasts, empleamos herramientas estándar de almacenamiento en el
              navegador: Cookies, <code>localStorage</code> y <code>sessionStorage</code>.
            </p>
          </div>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">1. Cookies Propias</h2>
            <p className="text-sm sm:text-base leading-relaxed text-foreground/90">
              Nuestra aplicación emite una cookie técnica directa:
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm border-collapse">
                <thead>
                  <tr className="border-b border-border bg-secondary/50 text-foreground font-bold">
                    <th className="p-3">Nombre</th>
                    <th className="p-3">Dominio</th>
                    <th className="p-3">Función</th>
                    <th className="p-3">Duración</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  <tr>
                    <td className="p-3 font-mono font-bold text-primary">sidebar_state</td>
                    <td className="p-3 text-muted-foreground">familiasdmps.app</td>
                    <td className="p-3">
                      Recuerda si el panel lateral de navegación está abierto o plegado en la pantalla.
                    </td>
                    <td className="p-3 whitespace-nowrap">7 días</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">
              2. Inventario de Almacenamiento Local (localStorage)
            </h2>
            <p className="text-sm sm:text-base leading-relaxed text-foreground/90">
              <code>localStorage</code> mantiene los datos en su dispositivo incluso al cerrar el
              navegador. Estas son las claves utilizadas:
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm border-collapse">
                <thead>
                  <tr className="border-b border-border bg-secondary/50 text-foreground font-bold">
                    <th className="p-3">Clave</th>
                    <th className="p-3">Categoría</th>
                    <th className="p-3">Propósito</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 text-foreground/90">
                  <tr>
                    <td className="p-3 font-mono font-semibold text-primary">
                      dmps_analytics_anonymous_id
                    </td>
                    <td className="p-3 text-xs uppercase font-bold text-muted-foreground">
                      Analítica Interna
                    </td>
                    <td className="p-3">
                      UUID seudónimo para estimar el número de visitas recurrentes en el portal sin
                      usar nombres ni datos personales.
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono font-semibold text-primary">
                      dmps_lang_v2 / dmps_lang
                    </td>
                    <td className="p-3 text-xs uppercase font-bold text-muted-foreground">
                      Preferencia
                    </td>
                    <td className="p-3">
                      Guarda el idioma elegido (Español o Inglés) para no tener que seleccionarlo en
                      cada página.
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono font-semibold text-primary">dmps_theme</td>
                    <td className="p-3 text-xs uppercase font-bold text-muted-foreground">
                      Preferencia
                    </td>
                    <td className="p-3">
                      Almacena si prefiere el modo claro, modo oscuro o el tema predeterminado de su
                      sistema.
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono font-semibold text-primary">
                      dmps_selected_school / _v2
                    </td>
                    <td className="p-3 text-xs uppercase font-bold text-muted-foreground">
                      Preferencia
                    </td>
                    <td className="p-3">
                      Recuerda su escuela favorita para filtrar avisos y calendarios (ej. Lincoln High
                      School).
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono font-semibold text-primary">
                      dmps_onboarding_*
                    </td>
                    <td className="p-3 text-xs uppercase font-bold text-muted-foreground">
                      Funcional
                    </td>
                    <td className="p-3">
                      Guarda el estado del tutorial interactivo para no mostrarlo de nuevo si ya fue
                      completado.
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono font-semibold text-primary">
                      dmps_podcast_resume_positions
                    </td>
                    <td className="p-3 text-xs uppercase font-bold text-muted-foreground">
                      Funcional
                    </td>
                    <td className="p-3">
                      Guarda los segundos de reproducción para que pueda continuar escuchando un
                      episodio de podcast donde lo dejó.
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono font-semibold text-primary">
                      dmps_art_tr_v3_* / dmps_dom_tr_*
                    </td>
                    <td className="p-3 text-xs uppercase font-bold text-muted-foreground">
                      Caché Funcional
                    </td>
                    <td className="p-3">
                      Guarda en memoria del navegador los párrafos traducidos para que los artículos
                      carguen de forma instantánea.
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono font-semibold text-primary">
                      sb-*-auth-token
                    </td>
                    <td className="p-3 text-xs uppercase font-bold text-muted-foreground">
                      Seguridad Administrativa
                    </td>
                    <td className="p-3">
                      Credenciales de sesión empleadas únicamente cuando el personal autorizado
                      inicia sesión en el panel editorial.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">
              3. Almacenamiento de Sesión (sessionStorage)
            </h2>
            <p className="text-sm sm:text-base leading-relaxed text-foreground/90">
              Los datos en <code>sessionStorage</code> se borran de forma automática al cerrar la
              pestaña o ventana del navegador:
            </p>

            <ul className="list-disc pl-5 space-y-2 text-sm text-foreground/85">
              <li>
                <strong>dmps_analytics_session_id y dmps_analytics_session_last_active:</strong>{" "}
                Miden la duración de su visita activa (se reinician tras 30 minutos sin actividad).
              </li>
              <li>
                <strong>dmps_analytics_pwa_launch_recorded:</strong> Evita registrar múltiples
                aperturas duplicadas cuando el sitio se abre como aplicación móvil instalada.
              </li>
              <li>
                <strong>floating_announcement_seen_*:</strong> Recuerda si ya cerró un anuncio
                urgente flotante para no incomodarlo mostrándolo de nuevo en la misma sesión.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">
              4. Contenido Incrustado y Terceros (Spotify / Videos)
            </h2>
            <p className="text-sm sm:text-base leading-relaxed text-foreground/90">
              Al reproducir podcasts o videos en artículos:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-sm text-foreground/85">
              <li>
                <strong>Spotify:</strong> Se ejecuta en un <code>iframe</code> oficial de{" "}
                <code>open.spotify.com</code>, el cual puede emitir cookies de su propia plataforma
                para gestionar audio y analítica.
              </li>
              <li>
                <strong>Reproductores de Video (YouTube/Vimeo):</strong> Pueden emitir cookies
                técnicas para ajustar la resolución del video y recordar controles de volumen.
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">
              5. Cómo Eliminar los Datos Almacenados
            </h2>
            <p className="text-sm sm:text-base leading-relaxed text-foreground/90">
              Usted puede borrar en cualquier momento las cookies y los datos almacenados en su
              dispositivo:
            </p>
            <ol className="list-decimal pl-5 space-y-1.5 text-sm text-foreground/85">
              <li>Abra la configuración de su navegador (Chrome, Safari, Firefox o Edge).</li>
              <li>Vaya a <strong>Privacidad y seguridad &gt; Borrar datos de navegación</strong>.</li>
              <li>Seleccione <strong>"Cookies y otros datos de sitios"</strong> y confirme.</li>
            </ol>
            <div className="rounded-xl border border-border bg-secondary/30 p-4 text-xs text-muted-foreground flex items-start gap-2">
              <Info className="size-4 shrink-0 text-primary mt-0.5" />
              <span>
                <strong>Aclaración:</strong> Al limpiar los datos locales, su navegador restablecerá
                el idioma, la escuela y el tema visual a los valores predeterminados. Borrar estos
                datos locales no elimina los registros de telemetría que ya hayan sido transmitidos
                al servidor.
              </span>
            </div>
          </section>
        </article>
      )}
    </LegalPageLayout>
  );
}
