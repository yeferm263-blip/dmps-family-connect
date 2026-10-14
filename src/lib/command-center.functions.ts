/* eslint-disable @typescript-eslint/no-explicit-any */
// Intelligent Command Center: Google Gemini interprets admin commands against the
// real Lovable Cloud database. Every function requires a signed-in content manager.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type CommandIntentType =
  | "SEARCH_INFO"
  | "SEARCH_SPORTS_EVENTS"
  | "CREATE_ARTICLE"
  | "CREATE_EVENT"
  | "CREATE_ANNOUNCEMENT"
  | "MODIFY_CONTENT"
  | "AUDIT_SITE"
  | "GENERAL_INFO";

export interface ArticleActionPayload {
  title: string;
  summary: string;
  content: string;
  category_id: string;
  category_name: string;
  school_scope: "lincoln" | "east" | "all";
  status: "draft" | "published";
  slug: string;
  tags?: string[];
}

export interface EventActionPayload {
  title: string;
  description: string;
  start_date: string; // YYYY-MM-DD
  start_time: string; // HH:mm
  end_date?: string;
  end_time?: string;
  location: string;
  event_type: "sports" | "academic" | "meeting" | "community" | "general";
  school_scope: "lincoln" | "east" | "all";
  all_day?: boolean;
}

export interface AnnouncementActionPayload {
  title: string;
  message: string;
  level: "info" | "warning" | "urgent";
  priority: "high" | "normal" | "low";
  school_scope: "lincoln" | "east" | "all";
  show_in_ticker: boolean;
  show_on_home: boolean;
  expires_at?: string;
}

export interface SearchInfoPayload {
  query: string;
  answer: string;
  articles: Array<{
    id: string;
    slug: string;
    title: string;
    summary: string;
    school_id: string | null;
    category_name?: string;
    category_id?: string;
    tags?: string[];
  }>;
  contacts?: Array<{ name: string; role: string; phone: string; email?: string; languages?: string[] }>;
  resources?: Array<{ title: string; url: string; description?: string }>;
}

export interface SportsEventsPayload {
  query: string;
  summary: string;
  events: Array<{
    id: string;
    title: string;
    start_date: string;
    start_time?: string;
    location: string;
    school_id: string | null;
    event_type: string;
    is_cancelled?: boolean;
    status?: string;
  }>;
  activities: Array<{
    id: string;
    name: string;
    season: string;
    grades: string;
    official_url: string;
    school_id: string;
  }>;
}

export interface ModifyContentPayload {
  targetType: "event" | "article" | "announcement" | "batch_events";
  targetId: string;
  targetTitle: string;
  changeDescription: string;
  fieldsToUpdate: Record<string, any>;
  previousValues?: Record<string, any>;
  diff?: Array<{ field: string; label: string; from: any; to: any }>;
}

export interface AuditSitePayload {
  summary: string;
  totalArticles: number;
  draftArticles: number;
  publishedArticles: number;
  totalEvents: number;
  upcomingEvents: number;
  expiredEvents: number;
  activeAnnouncements: number;
  urgentAlerts: number;
  findings: Array<{ type: "warning" | "info" | "success" | "danger"; title: string; description: string }>;
  recommendations: string[];
}

export interface CommandParsedResult {
  intent: CommandIntentType;
  immediateExecution: boolean;
  userQuery: string;
  aiExplanation: string;
  spokenResponse: string;
  payload:
    | ArticleActionPayload
    | EventActionPayload
    | AnnouncementActionPayload
    | SearchInfoPayload
    | SportsEventsPayload
    | ModifyContentPayload
    | AuditSitePayload
    | null;
  executed: boolean;
  executionResult?: { success: boolean; id?: string; message: string };
}

export interface CommandCenterOverview {
  articles: { total: number; published: number; drafts: number; lincoln: number; east: number };
  events: {
    total: number;
    upcoming: number;
    sports: number;
    cancelled: number;
    nextEvents: Array<{
      id: string;
      title: string;
      date: string;
      location: string;
      school: string;
      is_cancelled?: boolean;
    }>;
  };
  announcements: {
    total: number;
    active: number;
    urgent: number;
    tickerCount: number;
    latestAnnouncements: Array<{
      id: string;
      title: string;
      level: string;
      created_at: string;
      show_in_ticker: boolean;
    }>;
  };
  categories: Array<{ id: string; name: string; slug: string }>;
  systemHealth: {
    status: "optimal" | "needs_attention" | "warning";
    message: string;
    lastAuditAt: string;
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type Db = any;

const SCHOOL_LABEL = (id: string | null | undefined) =>
  id === "east" ? "East High" : id === "lincoln" ? "Lincoln High" : "Distrito";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
}

function newId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function scopeToSchool(scope: string | undefined | null): string | null {
  return scope === "lincoln" || scope === "east" ? scope : null;
}

function chicagoNow() {
  return new Date().toLocaleString("es-US", {
    timeZone: "America/Chicago",
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

async function assertContentManager(supabase: Db) {
  const { data, error } = await supabase.rpc("can_manage_content");
  if (error || !data) throw new Error("No tienes permiso para usar el Centro de Mando.");
}

async function loadSnapshot(supabase: Db) {
  const [articles, categories, events, announcements, annTr, activities, contacts] = await Promise.all([
    supabase
      .from("articles")
      .select("id, slug, title, summary, status, school_id, category_id, category_ids, updated_at")
      .order("updated_at", { ascending: false })
      .limit(300),
    supabase.from("categories").select("id, name, slug").order("display_order"),
    supabase
      .from("events")
      .select("id, title, description, starts_at, start_time, location, event_type, school_id, status, is_cancelled")
      .order("starts_at", { ascending: true })
      .limit(300),
    supabase
      .from("announcements")
      .select("id, level, priority, status, school_id, show_in_ticker, show_on_home, published_at, created_at, expires_at")
      .order("created_at", { ascending: false })
      .limit(100),
    supabase.from("announcement_translations").select("announcement_id, language_code, title, message"),
    supabase
      .from("activities")
      .select("id, name, season, grades, official_url, school_id, activity_type, status")
      .limit(200),
    supabase
      .from("contacts")
      .select("id, person_name, role_title, job_title, department, phone, email, languages, school_id, is_visible")
      .limit(200),
  ]);

  const trMap = new Map<string, any>();
  for (const t of annTr.data ?? []) {
    if (!trMap.has(t.announcement_id) || t.language_code === "es") trMap.set(t.announcement_id, t);
  }

  return {
    articles: articles.data ?? [],
    categories: categories.data ?? [],
    events: (events.data ?? []).map((e: any) => ({
      ...e,
      start_date: e.starts_at ? String(e.starts_at).slice(0, 10) : "",
    })),
    announcements: (announcements.data ?? []).map((a: any) => ({
      ...a,
      title: trMap.get(a.id)?.title ?? "Aviso",
      message: trMap.get(a.id)?.message ?? "",
    })),
    activities: activities.data ?? [],
    contacts: contacts.data ?? [],
  };
}

type Snapshot = Awaited<ReturnType<typeof loadSnapshot>>;

function buildAudit(s: Snapshot): AuditSitePayload {
  const today = new Date().toISOString().slice(0, 10);
  const published = s.articles.filter((a: any) => a.status === "published");
  const drafts = s.articles.filter((a: any) => a.status === "draft");
  const upcoming = s.events.filter((e: any) => e.start_date >= today);
  const expired = s.events.filter((e: any) => e.start_date && e.start_date < today);
  const activeAnn = s.announcements.filter((a: any) => a.status === "published");
  const urgent = activeAnn.filter((a: any) => a.level === "urgent");
  const noSummary = published.filter((a: any) => !a.summary || String(a.summary).trim().length < 10);
  const stale = published.filter(
    (a: any) => a.updated_at && Date.now() - new Date(a.updated_at).getTime() > 1000 * 60 * 60 * 24 * 180,
  );

  const findings: AuditSitePayload["findings"] = [];
  if (drafts.length) findings.push({ type: "info", title: `${drafts.length} artículos en borrador`, description: "Revísalos y publícalos si ya están listos." });
  if (noSummary.length) findings.push({ type: "warning", title: `${noSummary.length} artículos sin resumen`, description: noSummary.slice(0, 5).map((a: any) => a.title).join(" · ") });
  if (stale.length) findings.push({ type: "warning", title: `${stale.length} artículos sin actualizar en 6+ meses`, description: stale.slice(0, 5).map((a: any) => a.title).join(" · ") });
  if (!upcoming.length) findings.push({ type: "danger", title: "No hay eventos próximos", description: "El calendario público se verá vacío." });
  if (urgent.length) findings.push({ type: "danger", title: `${urgent.length} alertas urgentes activas`, description: "Confirma que sigan vigentes." });
  if (!findings.length) findings.push({ type: "success", title: "Todo en orden", description: "No se detectaron problemas." });

  const recommendations: string[] = [];
  if (noSummary.length) recommendations.push("Agrega resúmenes cortos a los artículos sin descripción.");
  if (stale.length) recommendations.push("Verifica la información de los artículos antiguos.");
  if (upcoming.length < 3) recommendations.push("Programa más eventos próximos en el calendario.");
  if (expired.length > 20) recommendations.push("Archiva eventos pasados para mantener el calendario limpio.");

  return {
    summary: `${published.length} artículos publicados, ${upcoming.length} eventos próximos y ${activeAnn.length} avisos activos.`,
    totalArticles: s.articles.length,
    draftArticles: drafts.length,
    publishedArticles: published.length,
    totalEvents: s.events.length,
    upcomingEvents: upcoming.length,
    expiredEvents: expired.length,
    activeAnnouncements: activeAnn.length,
    urgentAlerts: urgent.length,
    findings,
    recommendations,
  };
}

// ---------------------------------------------------------------------------
// Gemini
// ---------------------------------------------------------------------------

const GEMINI_MODELS = ["gemini-3.8-flash", "gemini-3.1-flash-lite"];

async function askGemini(system: string, user: string): Promise<any> {
  const key = process.env["GEMINI_API_KEY"];
  if (!key) throw new Error("Falta la clave de Gemini (GEMINI_API_KEY).");

  let lastErr = "";
  for (let attempt = 0; attempt < 4; attempt++) {
    const model = GEMINI_MODELS[attempt % GEMINI_MODELS.length];
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": key },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: system }] },
          contents: [{ role: "user", parts: [{ text: user }] }],
          generationConfig: { responseMimeType: "application/json", temperature: 0.3 },
        }),
      },
    );
    if (res.ok) {
      const json: any = await res.json();
      const text = json?.candidates?.[0]?.content?.parts?.map((p: any) => p.text ?? "").join("") ?? "";
      try {
        return JSON.parse(text.replace(/^```json\s*|```$/g, ""));
      } catch {
        throw new Error("Gemini devolvió una respuesta que no se pudo interpretar. Intenta de nuevo.");
      }
    }
    lastErr = `${res.status}: ${(await res.text()).slice(0, 200)}`;
    if (res.status === 404) continue;
    if (res.status === 429 || res.status >= 500) {
      await new Promise((r) => setTimeout(r, 800 * (attempt + 1) + Math.random() * 400));
      continue;
    }
    break;
  }
  if (lastErr.startsWith("429")) throw new Error("Gemini alcanzó su límite gratuito por minuto. Espera un momento e intenta otra vez.");
  throw new Error(`Gemini no respondió correctamente (${lastErr}).`);
}

function compactContext(s: Snapshot, schoolScope?: string) {
  const today = new Date().toISOString().slice(0, 10);
  return {
    escuela_seleccionada: schoolScope || "all",
    categorias: s.categories.map((c: any) => ({ id: c.id, nombre: c.name })),
    articulos: s.articles.map((a: any) => ({
      id: a.id,
      titulo: a.title,
      resumen: String(a.summary ?? "").slice(0, 160),
      estado: a.status,
      escuela: a.school_id,
      categoria: a.category_id,
    })),
    eventos: s.events
      .filter((e: any) => !e.start_date || e.start_date >= today)
      .slice(0, 80)
      .map((e: any) => ({
        id: e.id,
        titulo: e.title,
        fecha: e.start_date,
        hora: e.start_time,
        lugar: e.location,
        tipo: e.event_type,
        escuela: e.school_id,
        cancelado: Boolean(e.is_cancelled),
        estado: e.status,
      })),
    avisos: s.announcements.slice(0, 30).map((a: any) => ({
      id: a.id,
      titulo: a.title,
      nivel: a.level,
      estado: a.status,
      en_marquesina: a.show_in_ticker,
    })),
    deportes_actividades: s.activities.map((a: any) => ({
      id: a.id,
      nombre: a.name,
      temporada: a.season,
      escuela: a.school_id,
    })),
    contactos: s.contacts
      .filter((c: any) => c.is_visible !== false)
      .slice(0, 80)
      .map((c: any) => ({
        nombre: c.person_name || c.department,
        cargo: c.job_title || c.role_title,
        telefono: c.phone,
        email: c.email,
        escuela: c.school_id,
      })),
  };
}

const SYSTEM_PROMPT = `Eres el asistente del Centro de Mando de "DMPS Family Info", un sitio para familias de Des Moines Public Schools (Lincoln High y East High). Hablas español claro y amable.
Recibirás la orden del administrador y una instantánea REAL de la base de datos. Nunca inventes registros: para buscar o modificar usa solo IDs que existan en la instantánea.
Devuelve SOLO un JSON con esta forma:
{
 "intent": "SEARCH_INFO" | "SEARCH_SPORTS_EVENTS" | "CREATE_ARTICLE" | "CREATE_EVENT" | "CREATE_ANNOUNCEMENT" | "MODIFY_CONTENT" | "AUDIT_SITE" | "GENERAL_INFO",
 "immediateExecution": boolean,   // true SOLO si el admin pidió explícitamente publicar/aplicar ya, sin confirmar
 "aiExplanation": string,          // 1-3 frases explicando qué entendiste y qué propones
 "spokenResponse": string,         // respuesta breve y natural para leer en voz alta (máx. 2 frases)
 "payload": object | null
}
Payload según intent:
- SEARCH_INFO: {"answer": string, "article_ids": string[], "include_contacts": boolean}
- SEARCH_SPORTS_EVENTS: {"summary": string, "event_ids": string[], "activity_ids": string[]}
- CREATE_ARTICLE: {"title","summary","content" (HTML bien estructurado con <h2>,<p>,<ul>, en español, completo y útil),"category_id" (de la lista),"school_scope":"lincoln"|"east"|"all","status":"draft"|"published","tags":string[]}
- CREATE_EVENT: {"title","description","start_date":"YYYY-MM-DD","start_time":"HH:mm","location","event_type":"sports"|"academic"|"meeting"|"community"|"general","school_scope","all_day":boolean}
- CREATE_ANNOUNCEMENT: {"title","message","level":"info"|"warning"|"urgent","priority":"high"|"normal"|"low","school_scope","show_in_ticker":boolean,"show_on_home":boolean}
- MODIFY_CONTENT: {"targetType":"event"|"article"|"announcement","targetId": id existente,"changeDescription": string,"fieldsToUpdate": object}
   Campos permitidos: evento → title, description, location, start_date, start_time, is_cancelled, status, is_featured; artículo → title, summary, status, is_featured, category_id, school_id; aviso → status, level, show_in_ticker, show_on_home. status ∈ draft|published|archived.
- AUDIT_SITE: {} (el sistema calcula la auditoría)
- GENERAL_INFO: null
Las fechas relativas ("este viernes", "mañana") se calculan a partir de la fecha actual indicada. Si falta información para crear algo, usa valores razonables y dilo en aiExplanation. Si la orden es ambigua sobre qué registro modificar, usa GENERAL_INFO y pide aclaración.`;

const ALLOWED_FIELDS: Record<string, string[]> = {
  event: ["title", "description", "location", "start_date", "start_time", "is_cancelled", "status", "is_featured"],
  article: ["title", "summary", "status", "is_featured", "category_id", "school_id"],
  announcement: ["status", "level", "show_in_ticker", "show_on_home"],
};

const FIELD_LABELS: Record<string, string> = {
  title: "Título",
  description: "Descripción",
  location: "Lugar",
  start_date: "Fecha",
  start_time: "Hora",
  is_cancelled: "Cancelado",
  status: "Estado",
  is_featured: "Destacado",
  summary: "Resumen",
  category_id: "Categoría",
  school_id: "Escuela",
  level: "Nivel",
  show_in_ticker: "Marquesina",
  show_on_home: "Portada",
};

function buildResult(raw: any, s: Snapshot, query: string, schoolScope?: string): CommandParsedResult {
  const intent: CommandIntentType = [
    "SEARCH_INFO",
    "SEARCH_SPORTS_EVENTS",
    "CREATE_ARTICLE",
    "CREATE_EVENT",
    "CREATE_ANNOUNCEMENT",
    "MODIFY_CONTENT",
    "AUDIT_SITE",
    "GENERAL_INFO",
  ].includes(raw?.intent)
    ? raw.intent
    : "GENERAL_INFO";
  const p = raw?.payload ?? {};
  const base = {
    intent,
    immediateExecution: Boolean(raw?.immediateExecution),
    userQuery: query,
    aiExplanation: String(raw?.aiExplanation ?? ""),
    spokenResponse: String(raw?.spokenResponse ?? raw?.aiExplanation ?? "Listo."),
    executed: false,
  };
  const defScope = (p.school_scope ?? schoolScope ?? "all") as "lincoln" | "east" | "all";
  const catName = (id: string) => s.categories.find((c: any) => c.id === id)?.name;

  switch (intent) {
    case "SEARCH_INFO": {
      const ids: string[] = Array.isArray(p.article_ids) ? p.article_ids : [];
      const articles = ids
        .map((id) => s.articles.find((a: any) => a.id === id))
        .filter(Boolean)
        .map((a: any) => ({
          id: a.id,
          slug: a.slug,
          title: a.title ?? "",
          summary: a.summary ?? "",
          school_id: a.school_id,
          category_id: a.category_id,
          category_name: catName(a.category_id),
        }));
      const contacts = p.include_contacts
        ? s.contacts
            .filter((c: any) => c.is_visible !== false && c.phone)
            .slice(0, 4)
            .map((c: any) => ({
              name: c.person_name || c.department || "Contacto",
              role: c.job_title || c.role_title || "",
              phone: c.phone,
              email: c.email ?? undefined,
              languages: c.languages ?? undefined,
            }))
        : [];
      return { ...base, payload: { query, answer: String(p.answer ?? base.aiExplanation), articles, contacts } };
    }
    case "SEARCH_SPORTS_EVENTS": {
      const evIds: string[] = Array.isArray(p.event_ids) ? p.event_ids : [];
      const acIds: string[] = Array.isArray(p.activity_ids) ? p.activity_ids : [];
      return {
        ...base,
        payload: {
          query,
          summary: String(p.summary ?? base.aiExplanation),
          events: evIds
            .map((id) => s.events.find((e: any) => e.id === id))
            .filter(Boolean)
            .map((e: any) => ({
              id: e.id,
              title: e.title ?? "Evento",
              start_date: e.start_date,
              start_time: e.start_time ?? undefined,
              location: e.location ?? "",
              school_id: e.school_id,
              event_type: e.event_type ?? "general",
              is_cancelled: Boolean(e.is_cancelled),
              status: e.status,
            })),
          activities: acIds
            .map((id) => s.activities.find((a: any) => a.id === id))
            .filter(Boolean)
            .map((a: any) => ({
              id: a.id,
              name: a.name,
              season: a.season ?? "",
              grades: a.grades ?? "",
              official_url: a.official_url ?? "",
              school_id: a.school_id ?? "",
            })),
        },
      };
    }
    case "CREATE_ARTICLE": {
      const catId = s.categories.some((c: any) => c.id === p.category_id)
        ? p.category_id
        : (s.categories[0]?.id ?? "");
      const title = String(p.title ?? "Nuevo artículo");
      return {
        ...base,
        payload: {
          title,
          summary: String(p.summary ?? ""),
          content: String(p.content ?? ""),
          category_id: catId,
          category_name: catName(catId) ?? "",
          school_scope: defScope,
          status: p.status === "published" ? "published" : "draft",
          slug: slugify(title),
          tags: Array.isArray(p.tags) ? p.tags : [],
        },
      };
    }
    case "CREATE_EVENT":
      return {
        ...base,
        payload: {
          title: String(p.title ?? "Nuevo evento"),
          description: String(p.description ?? ""),
          start_date: String(p.start_date ?? new Date().toISOString().slice(0, 10)),
          start_time: String(p.start_time ?? "18:00"),
          location: String(p.location ?? ""),
          event_type: ["sports", "academic", "meeting", "community", "general"].includes(p.event_type)
            ? p.event_type
            : "general",
          school_scope: defScope,
          all_day: Boolean(p.all_day),
        },
      };
    case "CREATE_ANNOUNCEMENT":
      return {
        ...base,
        payload: {
          title: String(p.title ?? "Aviso"),
          message: String(p.message ?? ""),
          level: ["info", "warning", "urgent"].includes(p.level) ? p.level : "info",
          priority: ["high", "normal", "low"].includes(p.priority) ? p.priority : "normal",
          school_scope: defScope,
          show_in_ticker: p.show_in_ticker ?? true,
          show_on_home: p.show_on_home ?? true,
        },
      };
    case "MODIFY_CONTENT": {
      const type = p.targetType as "event" | "article" | "announcement";
      const list = type === "event" ? s.events : type === "article" ? s.articles : type === "announcement" ? s.announcements : [];
      const target: any = list.find((r: any) => r.id === p.targetId);
      if (!target) {
        return {
          ...base,
          intent: "GENERAL_INFO",
          payload: null,
          aiExplanation: "No encontré el registro que quieres modificar. ¿Puedes decirme el título exacto?",
          spokenResponse: "No encontré ese registro. ¿Me dices el título exacto?",
        };
      }
      const fields: Record<string, any> = {};
      const diff: ModifyContentPayload["diff"] = [];
      for (const [k, v] of Object.entries(p.fieldsToUpdate ?? {})) {
        if (!ALLOWED_FIELDS[type]?.includes(k)) continue;
        fields[k] = v;
        diff.push({ field: k, label: FIELD_LABELS[k] ?? k, from: target[k] ?? null, to: v });
      }
      return {
        ...base,
        payload: {
          targetType: type,
          targetId: target.id,
          targetTitle: target.title ?? target.id,
          changeDescription: String(p.changeDescription ?? "Actualización"),
          fieldsToUpdate: fields,
          previousValues: Object.fromEntries(diff.map((d) => [d.field, d.from])),
          diff,
        },
      };
    }
    case "AUDIT_SITE":
      return { ...base, payload: buildAudit(s) };
    default:
      return { ...base, intent: "GENERAL_INFO", payload: null };
  }
}

// ---------------------------------------------------------------------------
// Server functions
// ---------------------------------------------------------------------------

export const getCommandCenterOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<CommandCenterOverview> => {
    const supabase = context.supabase as Db;
    await assertContentManager(supabase);
    const s = await loadSnapshot(supabase);
    const today = new Date().toISOString().slice(0, 10);
    const upcoming = s.events.filter((e: any) => e.start_date >= today);
    const cancelled = s.events.filter((e: any) => e.is_cancelled);
    const active = s.announcements.filter((a: any) => a.status === "published");

    return {
      articles: {
        total: s.articles.length,
        published: s.articles.filter((a: any) => a.status === "published").length,
        drafts: s.articles.filter((a: any) => a.status === "draft").length,
        lincoln: s.articles.filter((a: any) => a.school_id === "lincoln").length,
        east: s.articles.filter((a: any) => a.school_id === "east").length,
      },
      events: {
        total: s.events.length,
        upcoming: upcoming.length,
        sports: s.events.filter((e: any) => e.event_type === "sports").length,
        cancelled: cancelled.length,
        nextEvents: upcoming.slice(0, 5).map((e: any) => ({
          id: e.id,
          title: e.title || "Evento escolar",
          date: `${e.start_date} ${e.start_time || ""}`.trim(),
          location: e.location || "",
          school: SCHOOL_LABEL(e.school_id),
          is_cancelled: Boolean(e.is_cancelled),
        })),
      },
      announcements: {
        total: s.announcements.length,
        active: active.length,
        urgent: active.filter((a: any) => a.level === "urgent").length,
        tickerCount: active.filter((a: any) => a.show_in_ticker).length,
        latestAnnouncements: s.announcements.slice(0, 4).map((a: any) => ({
          id: a.id,
          title: a.title,
          level: a.level || "info",
          created_at: a.published_at || a.created_at || new Date().toISOString(),
          show_in_ticker: Boolean(a.show_in_ticker),
        })),
      },
      categories: s.categories.map((c: any) => ({ id: c.id, name: c.name, slug: c.slug })),
      systemHealth: {
        status: cancelled.length > 0 ? "needs_attention" : "optimal",
        message: `${s.articles.length} artículos, ${s.events.length} eventos (${cancelled.length} cancelados) y ${s.announcements.length} avisos en la base de datos.`,
        lastAuditAt: new Date().toLocaleTimeString("es-US", {
          timeZone: "America/Chicago",
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    };
  });

export const processCommandIntent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ query: z.string().min(1).max(1000), schoolScope: z.string().optional() }).parse(d),
  )
  .handler(async ({ data, context }): Promise<CommandParsedResult> => {
    const supabase = context.supabase as Db;
    await assertContentManager(supabase);
    const query = data.query.trim();
    const s = await loadSnapshot(supabase);

    let raw: any;
    try {
      raw = await askGemini(
        SYSTEM_PROMPT,
        `Fecha y hora actual (Des Moines, Iowa): ${chicagoNow()} — ISO ${new Date().toISOString()}\n\nORDEN DEL ADMINISTRADOR:\n${query}\n\nINSTANTÁNEA DE LA BASE DE DATOS:\n${JSON.stringify(compactContext(s, data.schoolScope))}`,
      );
    } catch (err) {
      const msg = (err as Error).message;
      return {
        intent: "GENERAL_INFO",
        immediateExecution: false,
        userQuery: query,
        aiExplanation: msg,
        spokenResponse: "No pude procesar la orden en este momento.",
        payload: null,
        executed: false,
      };
    }

    const result = buildResult(raw, s, query, data.schoolScope);

    const executable = ["CREATE_ARTICLE", "CREATE_EVENT", "CREATE_ANNOUNCEMENT", "MODIFY_CONTENT"];
    if (result.immediateExecution && executable.includes(result.intent) && result.payload) {
      try {
        const exec = await runAction(supabase, result.intent, result.payload);
        result.executed = exec.success;
        result.executionResult = exec;
      } catch (err) {
        result.executionResult = { success: false, message: (err as Error).message };
      }
    }
    return result;
  });

export const executeCommandAction = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        intent: z.enum(["CREATE_ARTICLE", "CREATE_EVENT", "CREATE_ANNOUNCEMENT", "MODIFY_CONTENT"]),
        payload: z.any(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as Db;
    await assertContentManager(supabase);
    try {
      const res = await runAction(supabase, data.intent, data.payload);
      const title = data.payload?.title ?? data.payload?.targetTitle ?? "";
      const spoken: Record<string, string> = {
        CREATE_ARTICLE: `Listo. El artículo "${title}" quedó guardado.`,
        CREATE_EVENT: `Listo. El evento "${title}" ya está en el calendario.`,
        CREATE_ANNOUNCEMENT: `Listo. El aviso "${title}" está activo.`,
        MODIFY_CONTENT: `Listo. Se actualizó "${title}".`,
      };
      return { ...res, spokenResponse: res.success ? spoken[data.intent] : res.message };
    } catch (err) {
      const message = (err as Error).message;
      return { success: false, message, spokenResponse: "No se pudo guardar el cambio." };
    }
  });

// ---------------------------------------------------------------------------
// Real database writes (RLS applies as the signed-in admin)
// ---------------------------------------------------------------------------

async function runAction(
  supabase: Db,
  intent: string,
  payload: any,
): Promise<{ success: boolean; id?: string; message: string }> {
  const now = new Date().toISOString();

  if (intent === "CREATE_ARTICLE") {
    const p = payload as ArticleActionPayload;
    const id = newId("art");
    const html = p.content || `<p>${p.summary}</p>`;
    const blocks = [{ type: "paragraph", text: html }];
    const { error } = await supabase.from("articles").insert({
      id,
      slug: `${p.slug || slugify(p.title)}-${id.slice(-5)}`,
      title: p.title,
      summary: p.summary,
      content: JSON.stringify({ blocks }),
      category_id: p.category_id || null,
      category_ids: p.category_id ? [p.category_id] : [],
      school_id: scopeToSchool(p.school_scope),
      status: p.status === "published" ? "published" : "draft",
      published_at: p.status === "published" ? now : null,
    });
    if (error) throw new Error(`No se pudo guardar el artículo: ${error.message}`);
    await supabase.from("article_translations").insert({
      id: `${id}_es`,
      article_id: id,
      language_code: "es",
      title: p.title,
      summary: p.summary,
      content_blocks: blocks,
    });
    return { success: true, id, message: `Artículo "${p.title}" guardado (${p.status === "published" ? "publicado" : "borrador"}).` };
  }

  if (intent === "CREATE_EVENT") {
    const p = payload as EventActionPayload;
    const id = newId("ev");
    const time = /^\d{2}:\d{2}$/.test(p.start_time) ? p.start_time : "18:00";
    const { error } = await supabase.from("events").insert({
      id,
      title: p.title,
      description: p.description,
      starts_at: `${p.start_date}T${time}:00-05:00`,
      start_time: time,
      location: p.location,
      event_type: p.event_type,
      school_id: scopeToSchool(p.school_scope),
      all_day: Boolean(p.all_day),
      status: "published",
      is_featured: p.event_type === "sports",
    });
    if (error) throw new Error(`No se pudo guardar el evento: ${error.message}`);
    return { success: true, id, message: `Evento "${p.title}" programado para ${p.start_date} ${time}.` };
  }

  if (intent === "CREATE_ANNOUNCEMENT") {
    const p = payload as AnnouncementActionPayload;
    const id = newId("ann");
    const { error } = await supabase.from("announcements").insert({
      id,
      level: p.level,
      priority: p.priority,
      school_id: scopeToSchool(p.school_scope),
      status: "published",
      show_in_ticker: p.show_in_ticker,
      show_on_home: p.show_on_home,
      published_at: now,
      expires_at: p.expires_at ?? null,
    });
    if (error) throw new Error(`No se pudo guardar el aviso: ${error.message}`);
    const { error: trErr } = await supabase.from("announcement_translations").insert({
      id: `${id}_es`,
      announcement_id: id,
      language_code: "es",
      title: p.title,
      message: p.message,
    });
    if (trErr) throw new Error(`El aviso se creó pero sin texto: ${trErr.message}`);
    return { success: true, id, message: `Aviso "${p.title}" activado.` };
  }

  if (intent === "MODIFY_CONTENT") {
    const p = payload as ModifyContentPayload;
    const allowed = ALLOWED_FIELDS[p.targetType] ?? [];
    const update: Record<string, any> = {};
    for (const [k, v] of Object.entries(p.fieldsToUpdate ?? {})) if (allowed.includes(k)) update[k] = v;
    if (!Object.keys(update).length) return { success: false, message: "No hay cambios válidos para aplicar." };

    const table = p.targetType === "event" ? "events" : p.targetType === "article" ? "articles" : "announcements";
    if (p.targetType === "event" && (update.start_date || update.start_time)) {
      const { data: cur } = await supabase.from("events").select("starts_at, start_time").eq("id", p.targetId).maybeSingle();
      const date = update.start_date ?? String(cur?.starts_at ?? "").slice(0, 10);
      const time = update.start_time ?? cur?.start_time ?? "18:00";
      update.starts_at = `${date}T${time}:00-05:00`;
      update.start_time = time;
      delete update.start_date;
    }
    if (p.targetType === "article" && update.status === "published") update.published_at = new Date().toISOString();
    update.updated_at = new Date().toISOString();

    const { data: rows, error } = await supabase.from(table).update(update).eq("id", p.targetId).select("id");
    if (error) throw new Error(`No se pudo aplicar el cambio: ${error.message}`);
    if (!rows?.length) return { success: false, message: "No se encontró el registro o no tienes permiso para cambiarlo." };
    return { success: true, id: p.targetId, message: `Cambio aplicado: ${p.changeDescription}` };
  }

  return { success: false, message: "Acción no reconocida." };
}
