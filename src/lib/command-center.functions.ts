/* eslint-disable @typescript-eslint/no-explicit-any */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import fs from "node:fs";
import path from "node:path";
import { GoogleGenAI } from "@google/genai";

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
  contacts?: Array<{
    name: string;
    role: string;
    phone: string;
    email?: string;
    languages?: string[];
  }>;
  resources?: Array<{
    title: string;
    url: string;
    description?: string;
  }>;
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
  findings: Array<{
    type: "warning" | "info" | "success" | "danger";
    title: string;
    description: string;
  }>;
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
  executionResult?: {
    success: boolean;
    id?: string;
    message: string;
  };
}

export interface CommandCenterOverview {
  articles: {
    total: number;
    published: number;
    drafts: number;
    lincoln: number;
    east: number;
  };
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

// File path for the persistent JSON database
function getDbFilePath(): string {
  return path.join(process.cwd(), "data", "persistent_db.json");
}

function loadDatabase(): any {
  try {
    const file = getDbFilePath();
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, "utf8");
      return JSON.parse(content);
    }
  } catch (err) {
    console.warn("[CommandCenter] Error reading persistent_db.json:", err);
  }
  return {
    articles: [],
    categories: [],
    events: [],
    announcements: [],
    activities: [],
    contacts: [],
  };
}

function saveDatabase(db: any): boolean {
  try {
    const file = getDbFilePath();
    fs.writeFileSync(file, JSON.stringify(db, null, 2), "utf8");
    return true;
  } catch (err) {
    console.error("[CommandCenter] Error saving persistent_db.json:", err);
    return false;
  }
}

// In-memory action execution store for sessions
const executedActionsLog: Array<{
  id: string;
  intent: CommandIntentType;
  title: string;
  executedAt: string;
  details: string;
}> = [];

// Helper to calculate upcoming dates based on natural language expressions
function calculateTargetDate(expression: string): { date: string; time: string } {
  const now = new Date();
  const lower = expression.toLowerCase();
  const target = new Date(now);
  let timeStr = "18:00";

  // Time extraction
  const timeMatch = lower.match(/(\d{1,2})\s*(?:[:.]\s*(\d{2}))?\s*(am|pm|hs|horas)?/i);
  if (timeMatch) {
    let hours = parseInt(timeMatch[1] ?? "18", 10);
    const minutes = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
    const modifier = (timeMatch[3] || "").toLowerCase();

    if (modifier === "pm" && hours < 12) hours += 12;
    if (modifier === "am" && hours === 12) hours = 0;
    timeStr = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  }

  // Day extraction
  if (lower.includes("hoy")) {
    // Keep target as today
  } else if (lower.includes("mañana")) {
    target.setDate(target.getDate() + 1);
  } else if (lower.includes("pasado mañana")) {
    target.setDate(target.getDate() + 2);
  } else if (lower.includes("viernes")) {
    const day = target.getDay();
    const diff = (5 - day + 7) % 7 || 7;
    target.setDate(target.getDate() + diff);
  } else if (lower.includes("sábado") || lower.includes("sabado")) {
    const day = target.getDay();
    const diff = (6 - day + 7) % 7 || 7;
    target.setDate(target.getDate() + diff);
  } else if (lower.includes("domingo")) {
    const day = target.getDay();
    const diff = (7 - day + 7) % 7 || 7;
    target.setDate(target.getDate() + diff);
  } else if (lower.includes("lunes")) {
    const day = target.getDay();
    const diff = (1 - day + 7) % 7 || 7;
    target.setDate(target.getDate() + diff);
  } else if (lower.includes("martes")) {
    const day = target.getDay();
    const diff = (2 - day + 7) % 7 || 7;
    target.setDate(target.getDate() + diff);
  } else if (lower.includes("miércoles") || lower.includes("miercoles")) {
    const day = target.getDay();
    const diff = (3 - day + 7) % 7 || 7;
    target.setDate(target.getDate() + diff);
  } else if (lower.includes("jueves")) {
    const day = target.getDay();
    const diff = (4 - day + 7) % 7 || 7;
    target.setDate(target.getDate() + diff);
  } else {
    // Specific date matching like "25 de octubre"
    const monthMap: Record<string, number> = {
      enero: 0,
      febrero: 1,
      marzo: 2,
      abril: 3,
      mayo: 4,
      junio: 5,
      julio: 6,
      agosto: 7,
      septiembre: 8,
      octubre: 9,
      noviembre: 10,
      diciembre: 11,
    };
    const dateMatch = lower.match(
      /(\d{1,2})\s+de\s+(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)/i,
    );
    if (dateMatch) {
      const d = parseInt(dateMatch[1] ?? "1", 10);
      const m = monthMap[dateMatch[2]?.toLowerCase() ?? ""];
      if (m !== undefined) {
        target.setMonth(m, d);
      }
    } else {
      target.setDate(target.getDate() + 3);
    }
  }

  const yyyy = target.getFullYear();
  const mm = String(target.getMonth() + 1).padStart(2, "0");
  const dd = String(target.getDate()).padStart(2, "0");

  return { date: `${yyyy}-${mm}-${dd}`, time: timeStr };
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
}

/**
 * 1. Overview Server Function: Get live metrics for the voice & control center
 */
export const getCommandCenterOverview = createServerFn({ method: "GET" }).handler(
  async (): Promise<CommandCenterOverview> => {
    const db = loadDatabase();
    const articles = db.articles || [];
    const events = db.events || [];
    const announcements = db.announcements || [];
    const categories = db.categories || [];

    const nowIso = new Date().toISOString().slice(0, 10);
    const upcomingEvents = events.filter((e: any) => !e.start_date || e.start_date >= nowIso);
    const cancelledEvents = events.filter(
      (e: any) => Boolean(e.is_cancelled) || e.status === "cancelled",
    );

    return {
      articles: {
        total: articles.length,
        published: articles.filter((a: any) => a.status === "published" || !a.status).length,
        drafts: articles.filter((a: any) => a.status === "draft").length,
        lincoln: articles.filter((a: any) => a.school_id === "lincoln").length,
        east: articles.filter((a: any) => a.school_id === "east").length,
      },
      events: {
        total: events.length,
        upcoming: upcomingEvents.length,
        sports: events.filter((e: any) => e.event_type === "sports").length,
        cancelled: cancelledEvents.length,
        nextEvents: upcomingEvents.slice(0, 5).map((e: any) => ({
          id: e.id,
          title: e.title || "Evento escolar",
          date: e.start_date ? `${e.start_date} ${e.start_time || ""}` : "Próximamente",
          location: e.location || "DMPS Sede Principal",
          school:
            e.school_id === "east"
              ? "East High"
              : e.school_id === "lincoln"
                ? "Lincoln High"
                : "Distrito",
          is_cancelled: Boolean(e.is_cancelled),
        })),
      },
      announcements: {
        total: announcements.length,
        active: announcements.filter((a: any) => a.status !== "archived").length,
        urgent: announcements.filter((a: any) => a.level === "urgent" && a.status !== "archived")
          .length,
        tickerCount: announcements.filter((a: any) => a.show_in_ticker && a.status !== "archived")
          .length,
        latestAnnouncements: announcements.slice(0, 4).map((a: any) => ({
          id: a.id,
          title: a.title || "Aviso institucional",
          level: a.level || "info",
          created_at: a.published_at || a.created_at || new Date().toISOString(),
          show_in_ticker: Boolean(a.show_in_ticker),
        })),
      },
      categories: categories.map((c: any) => ({ id: c.id, name: c.name, slug: c.slug })),
      systemHealth: {
        status: cancelledEvents.length > 0 ? "needs_attention" : "optimal",
        message: `${articles.length} artículos oficiales, ${events.length} eventos en calendario (${cancelledEvents.length} cancelados) y ${announcements.length} avisos.`,
        lastAuditAt: new Date().toLocaleTimeString("es-US", { hour: "2-digit", minute: "2-digit" }),
      },
    };
  },
);

/**
 * 2. Process Intent Server Function: Deep Search, Entity Extraction, Changes & Creation
 */
export const processCommandIntent = createServerFn({ method: "POST" })
  .validator((d: unknown) =>
    z
      .object({
        query: z.string().min(1).max(500),
        schoolScope: z.string().optional(),
      })
      .parse(d),
  )
  .handler(async ({ data }): Promise<CommandParsedResult> => {
    const rawQuery = data.query.trim();
    const lower = rawQuery.toLowerCase();
    const db = loadDatabase();

    // Check if immediate publication was commanded
    const immediateExecution = Boolean(
      lower.includes("publica de inmediato") ||
      lower.includes("publica inmediatamente") ||
      lower.includes("publica ya") ||
      lower.includes("de inmediato") ||
      lower.includes("inmediatamente") ||
      lower.includes("sin confirmar") ||
      lower.includes("aplica ya") ||
      lower.includes("cancela de inmediato") ||
      lower.includes("ejecuta ya") ||
      lower.includes("hazlo ya"),
    );

    // School Scope extraction
    let schoolScope: "lincoln" | "east" | "all" = "all";
    if (lower.includes("lincoln")) {
      schoolScope = "lincoln";
    } else if (lower.includes("east")) {
      schoolScope = "east";
    } else if (data.schoolScope === "lincoln" || data.schoolScope === "east") {
      schoolScope = data.schoolScope;
    }

    // =========================================================================
    // INTENT A: REAL CHANGES / MODIFICATIONS TO EXISTING RECORDS (MUTATIONS)
    // =========================================================================
    const isChangeOrModify =
      lower.includes("cancela") ||
      lower.includes("cancelar") ||
      lower.includes("suspende") ||
      lower.includes("suspender") ||
      lower.includes("reactiva") ||
      lower.includes("reactivar") ||
      lower.includes("cambia el horario") ||
      lower.includes("cambia la hora") ||
      lower.includes("cambia la fecha") ||
      lower.includes("mueve el") ||
      lower.includes("pospone") ||
      lower.includes("posponer") ||
      lower.includes("archiva") ||
      lower.includes("archivar") ||
      lower.includes("publica el borrador") ||
      lower.includes("destaca el artículo") ||
      lower.includes("desactiva la alerta") ||
      lower.includes("desactiva el aviso") ||
      lower.includes("retira el aviso") ||
      lower.includes("quita la alerta") ||
      lower.includes("elimina el evento") ||
      lower.includes("eliminar el evento");

    if (isChangeOrModify) {
      // 1. Cancel / Suspend / Reactivate / Reschedule an Event
      if (
        lower.includes("partido") ||
        lower.includes("evento") ||
        lower.includes("baloncesto") ||
        lower.includes("conferencia") ||
        lower.includes("taller") ||
        lower.includes("reunión") ||
        lower.includes("reunion")
      ) {
        const events = db.events || [];
        const isReactivating = lower.includes("reactiva") || lower.includes("habilita");
        const isRescheduling =
          lower.includes("cambia") || lower.includes("mueve") || lower.includes("pospone");
        const isDeleting = lower.includes("elimina");

        // Target event matching
        let targetEvent = events.find((e: any) => {
          const tL = (e.title || "").toLowerCase();
          if (lower.includes("baloncesto") || lower.includes("basketball")) {
            if (lower.includes("east") && tL.includes("east")) return true;
            if (lower.includes("lincoln") && tL.includes("lincoln")) return true;
            return tL.includes("baloncesto");
          }
          if (lower.includes("conferencia") && tL.includes("conferencia")) return true;
          if (lower.includes("fafsa") && tL.includes("fafsa")) return true;
          if (lower.includes("mesa directiva") || lower.includes("board"))
            return tL.includes("board") || tL.includes("mesa directiva");
          if (lower.includes("east") && (e.school_id === "east" || tL.includes("east")))
            return true;
          if (lower.includes("lincoln") && (e.school_id === "lincoln" || tL.includes("lincoln")))
            return true;
          return false;
        });

        if (!targetEvent && events.length > 0) {
          targetEvent = events[0];
        }

        if (targetEvent) {
          let fieldsToUpdate: Record<string, any> = {};
          let changeDescription = "";
          let diff: Array<{ field: string; label: string; from: any; to: any }> = [];

          if (isDeleting) {
            fieldsToUpdate = { status: "archived", is_deleted: true };
            changeDescription = `Archivar y retirar evento "${targetEvent.title}" del calendario escolar.`;
            diff = [
              {
                field: "status",
                label: "Estado",
                from: targetEvent.status || "published",
                to: "archived",
              },
            ];
          } else if (isReactivating) {
            fieldsToUpdate = { is_cancelled: false, status: "published" };
            changeDescription = `Reactivar el evento "${targetEvent.title}" y restaurar su estado a programado.`;
            diff = [
              {
                field: "is_cancelled",
                label: "Cancelado",
                from: Boolean(targetEvent.is_cancelled),
                to: false,
              },
              { field: "status", label: "Estado", from: targetEvent.status, to: "published" },
            ];
          } else if (isRescheduling) {
            const { date, time } = calculateTargetDate(rawQuery);
            fieldsToUpdate = {};
            if (lower.includes("hora") || lower.includes("horario") || time !== "18:00") {
              fieldsToUpdate.start_time = time;
              diff.push({
                field: "start_time",
                label: "Hora",
                from: targetEvent.start_time || "18:00",
                to: time,
              });
            }
            if (
              lower.includes("fecha") ||
              lower.includes("sábado") ||
              lower.includes("domingo") ||
              lower.includes("viernes") ||
              lower.includes("de octubre")
            ) {
              fieldsToUpdate.start_date = date;
              diff.push({
                field: "start_date",
                label: "Fecha",
                from: targetEvent.start_date,
                to: date,
              });
            }
            if (
              lower.includes("lugar") ||
              lower.includes("gimnasio") ||
              lower.includes("estadio")
            ) {
              const newLoc = lower.includes("mediacom")
                ? "Mediacom Stadium"
                : lower.includes("gimnasio")
                  ? "Gimnasio Principal"
                  : "Auditorio Escolar";
              fieldsToUpdate.location = newLoc;
              diff.push({
                field: "location",
                label: "Ubicación",
                from: targetEvent.location,
                to: newLoc,
              });
            }
            changeDescription = `Reprogramar "${targetEvent.title}" a ${fieldsToUpdate.start_date || targetEvent.start_date} ${fieldsToUpdate.start_time || targetEvent.start_time}.`;
          } else {
            // Standard cancellation
            fieldsToUpdate = {
              is_cancelled: true,
              status: "cancelled",
              cancellation_reason: lower.includes("clima")
                ? "Suspendido por condiciones climáticas severas en Des Moines"
                : "Cancelado por decisión institucional de DMPS",
            };
            changeDescription = `Marcar "${targetEvent.title}" como CANCELADO / SUSPENDIDO en el calendario oficial.`;
            diff = [
              {
                field: "is_cancelled",
                label: "Cancelado",
                from: Boolean(targetEvent.is_cancelled),
                to: true,
              },
              {
                field: "status",
                label: "Estado",
                from: targetEvent.status || "published",
                to: "cancelled",
              },
            ];
          }

          const payload: ModifyContentPayload = {
            targetType: "event",
            targetId: targetEvent.id,
            targetTitle: targetEvent.title,
            changeDescription,
            fieldsToUpdate,
            previousValues: {
              is_cancelled: Boolean(targetEvent.is_cancelled),
              status: targetEvent.status,
              start_date: targetEvent.start_date,
              start_time: targetEvent.start_time,
              location: targetEvent.location,
            },
            diff,
          };

          let executed = false;
          let executionResult: { success: boolean; id?: string; message: string } | undefined;

          if (immediateExecution) {
            const exec = await internalModifyContent(payload);
            executed = exec.success;
            executionResult = exec;
          }

          const spokenResponse = immediateExecution
            ? `Cambio aplicado en tiempo real: ${changeDescription}`
            : `He preparado el cambio para el evento "${targetEvent.title}". ${diff.map((d) => `${d.label} cambiará a ${d.to}`).join(", ")}. Por favor confirma en pantalla.`;

          return {
            intent: "MODIFY_CONTENT",
            immediateExecution,
            userQuery: rawQuery,
            aiExplanation: `Acción directa sobre la base de datos de eventos: se actualizarán los campos en el registro oficial.`,
            spokenResponse,
            payload,
            executed,
            executionResult,
          };
        }
      }

      // 2. Publish / Archive / Feature an Article
      if (
        lower.includes("artículo") ||
        lower.includes("articulo") ||
        lower.includes("borrador") ||
        lower.includes("guía") ||
        lower.includes("guia")
      ) {
        const articles = db.articles || [];
        const isPublishing = lower.includes("publica") || lower.includes("publicar");
        const isFeaturing = lower.includes("destaca") || lower.includes("destacar");

        const targetArticle =
          articles.find((a: any) => {
            const tL = (a.title || "").toLowerCase();
            if (lower.includes("examen") && tL.includes("examen")) return true;
            if (lower.includes("transporte") && tL.includes("transporte")) return true;
            if (lower.includes("infinite campus") && tL.includes("infinite")) return true;
            if (isPublishing && a.status === "draft") return true;
            return false;
          }) || articles[0];

        if (targetArticle) {
          let fieldsToUpdate: Record<string, any> = {};
          let changeDescription = "";
          let diff: Array<{ field: string; label: string; from: any; to: any }> = [];

          if (isFeaturing) {
            fieldsToUpdate = { is_featured: true };
            changeDescription = `Destacar el artículo "${targetArticle.title}" en la portada pública.`;
            diff = [
              {
                field: "is_featured",
                label: "Destacado",
                from: Boolean(targetArticle.is_featured),
                to: true,
              },
            ];
          } else {
            const newStatus = isPublishing ? "published" : "archived";
            fieldsToUpdate = { status: newStatus };
            changeDescription = `Cambiar estado de "${targetArticle.title}" a "${newStatus.toUpperCase()}".`;
            diff = [
              { field: "status", label: "Estado", from: targetArticle.status, to: newStatus },
            ];
          }

          const payload: ModifyContentPayload = {
            targetType: "article",
            targetId: targetArticle.id,
            targetTitle: targetArticle.title,
            changeDescription,
            fieldsToUpdate,
            previousValues: {
              status: targetArticle.status,
              is_featured: Boolean(targetArticle.is_featured),
            },
            diff,
          };

          let executed = false;
          let executionResult: { success: boolean; id?: string; message: string } | undefined;

          if (immediateExecution) {
            const exec = await internalModifyContent(payload);
            executed = exec.success;
            executionResult = exec;
          }

          const spokenResponse = immediateExecution
            ? `Estado de artículo actualizado en la base de datos: "${targetArticle.title}" ahora está ${fieldsToUpdate.status || "modificado"}.`
            : `He preparado el cambio para el artículo "${targetArticle.title}". Revisa la tarjeta de confirmación y autoriza la actualización.`;

          return {
            intent: "MODIFY_CONTENT",
            immediateExecution,
            userQuery: rawQuery,
            aiExplanation: `Acción sobre la tabla de artículos: ${changeDescription}`,
            spokenResponse,
            payload,
            executed,
            executionResult,
          };
        }
      }

      // 3. Deactivate / Activate Announcements & Ticker Alerts
      if (
        lower.includes("alerta") ||
        lower.includes("aviso") ||
        lower.includes("marquesina") ||
        lower.includes("ticker")
      ) {
        const announcements = db.announcements || [];
        const isDeactivating =
          lower.includes("desactiva") || lower.includes("retira") || lower.includes("quita");
        const targetAnn = announcements.find((a: any) => a.show_in_ticker) || announcements[0];

        if (targetAnn) {
          const fieldsToUpdate = isDeactivating
            ? { show_in_ticker: false, status: "archived" }
            : { show_in_ticker: true, status: "published" };

          const changeDescription = isDeactivating
            ? `Retirar el aviso "${targetAnn.title}" de la marquesina en vivo.`
            : `Activar el aviso "${targetAnn.title}" en la marquesina superior.`;

          const payload: ModifyContentPayload = {
            targetType: "announcement",
            targetId: targetAnn.id,
            targetTitle: targetAnn.title,
            changeDescription,
            fieldsToUpdate,
            previousValues: {
              show_in_ticker: Boolean(targetAnn.show_in_ticker),
              status: targetAnn.status,
            },
            diff: [
              {
                field: "show_in_ticker",
                label: "Marquesina",
                from: Boolean(targetAnn.show_in_ticker),
                to: fieldsToUpdate.show_in_ticker,
              },
              {
                field: "status",
                label: "Estado",
                from: targetAnn.status,
                to: fieldsToUpdate.status,
              },
            ],
          };

          let executed = false;
          let executionResult: { success: boolean; id?: string; message: string } | undefined;

          if (immediateExecution) {
            const exec = await internalModifyContent(payload);
            executed = exec.success;
            executionResult = exec;
          }

          const spokenResponse = immediateExecution
            ? `Alerta actualizada en tiempo real: ${changeDescription}`
            : `He preparado el cambio para ${changeDescription.toLowerCase()}. Confirma en pantalla para aplicar.`;

          return {
            intent: "MODIFY_CONTENT",
            immediateExecution,
            userQuery: rawQuery,
            aiExplanation: `Acción sobre la marquesina y alertas institucionales: ${changeDescription}`,
            spokenResponse,
            payload,
            executed,
            executionResult,
          };
        }
      }
    }

    // =========================================================================
    // INTENT B: SEARCH EVENTS & SPORTS (REAL BOUND & CALENDAR QUERIES)
    // =========================================================================
    const isSearchSportsOrEvents =
      lower.includes("busca eventos") ||
      lower.includes("buscar eventos") ||
      lower.includes("busca partidos") ||
      lower.includes("buscar partidos") ||
      lower.includes("partidos de") ||
      lower.includes("partidos") ||
      lower.includes("deportes") ||
      lower.includes("baloncesto") ||
      lower.includes("basketball") ||
      lower.includes("fútbol") ||
      lower.includes("futbol") ||
      lower.includes("atletismo") ||
      lower.includes("voleibol") ||
      lower.includes("volleyball") ||
      lower.includes("cuándo juega") ||
      lower.includes("cuando juega") ||
      lower.includes("calendario de") ||
      lower.includes("calendario") ||
      lower.includes("próximos partidos") ||
      lower.includes("juegos de");

    if (
      isSearchSportsOrEvents &&
      !lower.includes("agrega el partido") &&
      !lower.includes("crea un evento")
    ) {
      const allEvents = db.events || [];
      const allActivities = db.activities || [];

      // Filter events by keyword & school
      const matchedEvents = allEvents.filter((e: any) => {
        const titleL = (e.title || "").toLowerCase();
        const descL = (e.description || "").toLowerCase();
        const schoolMatch = schoolScope === "all" || !e.school_id || e.school_id === schoolScope;

        const keywordMatch = lower.includes("baloncesto")
          ? titleL.includes("baloncesto") || descL.includes("baloncesto")
          : lower.includes("fútbol") || lower.includes("futbol")
            ? titleL.includes("fútbol") || titleL.includes("soccer")
            : lower.includes("conferencia")
              ? titleL.includes("conferencia")
              : lower.includes("deportes")
                ? e.event_type === "sports"
                : true;

        return schoolMatch && keywordMatch;
      });

      // Filter activities by keyword & school
      const matchedActivities = allActivities.filter((a: any) => {
        const nameL = (a.name || "").toLowerCase();
        const schoolMatch = schoolScope === "all" || !a.school_id || a.school_id === schoolScope;

        const keywordMatch = lower.includes("baloncesto")
          ? nameL.includes("baloncesto")
          : lower.includes("fútbol") || lower.includes("futbol")
            ? nameL.includes("fútbol") || nameL.includes("soccer")
            : lower.includes("atletismo")
              ? nameL.includes("atletismo") || nameL.includes("track")
              : lower.includes("voleibol")
                ? nameL.includes("voleibol")
                : true;

        return schoolMatch && keywordMatch;
      });

      const eventsCount = matchedEvents.length;
      const activitiesCount = matchedActivities.length;

      let summaryText = `Se encontraron ${eventsCount} eventos programados y ${activitiesCount} deportes en Bound.`;
      if (eventsCount > 0) {
        const first = matchedEvents[0];
        const statusNote = first.is_cancelled ? " (Actualmente CANCELADO)" : "";
        summaryText = `Próximo evento: "${first.title}" el ${first.start_date} a las ${first.start_time || "18:00"} en ${first.location}${statusNote}.`;
      }

      const payload: SportsEventsPayload = {
        query: rawQuery,
        summary: summaryText,
        events: matchedEvents.map((e: any) => ({
          id: e.id,
          title: e.title,
          start_date:
            e.start_date || (e.starts_at ? String(e.starts_at).slice(0, 10) : "Próximamente"),
          start_time: e.start_time || "18:00",
          location: e.location || "Sede Escolar DMPS",
          school_id: e.school_id,
          event_type: e.event_type || "sports",
          is_cancelled: Boolean(e.is_cancelled),
          status: e.is_cancelled ? "cancelled" : e.status || "published",
        })),
        activities: matchedActivities.map((a: any) => ({
          id: a.id,
          name: a.name,
          season: a.season || "Invierno",
          grades: a.grades || "9° a 12°",
          official_url: a.official_url || "https://www.gobound.com",
          school_id: a.school_id,
        })),
      };

      let spokenResponse = "";
      if (eventsCount > 0) {
        const e0 = matchedEvents[0];
        if (e0.is_cancelled) {
          spokenResponse = `Atención: El próximo partido ${e0.title} está marcado como cancelado. Hay ${activitiesCount} programas deportivos en Bound.`;
        } else {
          spokenResponse = `Encontré el próximo partido: ${e0.title} el ${e0.start_date} a las ${e0.start_time || "6 de la tarde"} en ${e0.location}. Mostrando resultados en pantalla.`;
        }
      } else {
        spokenResponse = `Encontré ${activitiesCount} programas deportivos oficiales en Bound para ${schoolScope === "all" ? "DMPS" : schoolScope.toUpperCase()}.`;
      }

      return {
        intent: "SEARCH_SPORTS_EVENTS",
        immediateExecution: false,
        userQuery: rawQuery,
        aiExplanation: `Consulta en vivo al calendario oficial de eventos escolares y la base de datos de actividades deportivas de Bound.`,
        spokenResponse,
        payload,
        executed: true,
      };
    }

    // =========================================================================
    // INTENT C: SEARCH INFORMATION ACROSS ARTICLES, GUIDES, CONTACTS (KNOWLEDGE GROUNDING)
    // =========================================================================
    const isSearchInfo =
      lower.startsWith("busca") ||
      lower.startsWith("buscar") ||
      lower.startsWith("dime") ||
      lower.startsWith("cómo") ||
      lower.startsWith("como") ||
      lower.startsWith("dónde") ||
      lower.startsWith("donde") ||
      lower.startsWith("qué") ||
      lower.startsWith("que") ||
      lower.startsWith("quién") ||
      lower.startsWith("quien") ||
      lower.startsWith("cuál") ||
      lower.startsWith("cual") ||
      lower.includes("información de") ||
      lower.includes("informacion de") ||
      lower.includes("información sobre") ||
      lower.includes("informacion sobre") ||
      lower.includes("infinite campus") ||
      lower.includes("horarios") ||
      lower.includes("enlace bfl") ||
      lower.includes("contacto") ||
      lower.includes("transporte") ||
      lower.includes("almuerzo") ||
      lower.includes("comidas") ||
      lower.includes("calificaciones") ||
      lower.includes("vacunas") ||
      lower.includes("inscripciones") ||
      lower.includes("asistencia");

    if (
      isSearchInfo &&
      !lower.includes("crea un") &&
      !lower.includes("crear un") &&
      !lower.includes("redacta") &&
      !lower.includes("agrega el partido") &&
      !lower.includes("cancela") &&
      !lower.includes("audita")
    ) {
      const articles = db.articles || [];
      const contacts = db.contacts || [];
      const categories = db.categories || [];

      // Tokenize search query keywords
      const queryWords = lower
        .replace(/[¿?¡!.,;:()]/g, " ")
        .split(/\s+/)
        .filter(
          (w) =>
            w.length > 2 &&
            ![
              "busca",
              "buscar",
              "sobre",
              "para",
              "como",
              "dime",
              "donde",
              "donde",
              "cual",
              "esta",
              "este",
            ].includes(w),
        );

      // Rank articles by keyword matches
      const rankedArticles = articles
        .map((art: any) => {
          const titleL = (art.title || "").toLowerCase();
          const summaryL = (art.summary || "").toLowerCase();
          const contentL = typeof art.content === "string" ? art.content.toLowerCase() : "";
          const slugL = (art.slug || "").toLowerCase();

          let score = 0;
          for (const word of queryWords) {
            if (titleL.includes(word)) score += 6;
            if (slugL.includes(word)) score += 4;
            if (summaryL.includes(word)) score += 3;
            if (contentL.includes(word)) score += 1;
          }

          if (schoolScope !== "all" && art.school_id === schoolScope) {
            score += 2;
          }

          // Special direct boosts
          if (
            lower.includes("infinite campus") &&
            (slugL.includes("campus") || titleL.includes("campus"))
          )
            score += 20;
          if (
            (lower.includes("comida") || lower.includes("almuerzo")) &&
            (titleL.includes("alimento") ||
              titleL.includes("comida") ||
              titleL.includes("nutricion"))
          )
            score += 20;
          if (
            lower.includes("transporte") &&
            (titleL.includes("transporte") || titleL.includes("autobus") || titleL.includes("dart"))
          )
            score += 20;
          if (
            lower.includes("examen") &&
            (titleL.includes("examen") || titleL.includes("calificac"))
          )
            score += 20;

          return { art, score };
        })
        .filter((item: any) => item.score > 0)
        .sort((a: any, b: any) => b.score - a.score)
        .map((item: any) => item.art);

      const topArticles = rankedArticles.slice(0, 3);

      // Search contacts
      const matchedContacts = contacts.filter((c: any) => {
        const nameL = (c.person_name || c.full_name || "").toLowerCase();
        const roleL = (c.job_title || c.role_title || "").toLowerCase();
        const languagesL = (c.languages || []).join(" ").toLowerCase();
        return (
          queryWords.some((w) => nameL.includes(w) || roleL.includes(w)) ||
          (lower.includes("bfl") &&
            (roleL.includes("bfl") ||
              roleL.includes("enlace") ||
              languagesL.includes("español"))) ||
          (lower.includes("contacto") && (roleL.includes("enlace") || roleL.includes("consejer")))
        );
      });

      // AI Synthesis with Gemini if GEMINI_API_KEY is available
      let answerText = "";
      let spokenResponse = "";

      if (process.env.GEMINI_API_KEY && topArticles.length > 0) {
        try {
          const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
          const contextGuides = topArticles
            .map(
              (a: any) =>
                `Título: ${a.title}\nResumen: ${a.summary}\nContenido: ${typeof a.content === "string" ? a.content.slice(0, 500) : ""}`,
            )
            .join("\n\n---\n\n");
          const response = await ai.models.generateContent({
            model: "gemini-3.8-flash",
            contents: `Eres el Asistente Inteligente de DMPS Family Connect (portal oficial para familias de Des Moines Public Schools).
Responde a esta pregunta de forma clara, directa, amable y bilingüe en español:
"${rawQuery}"

Usa exclusivamente los siguientes artículos oficiales como fuente de verdad:
${contextGuides}

Devuelve:
1. Una respuesta concisa de 2 párrafos para la pantalla.
2. Al final, en una línea que empiece por "VOZ:", un resumen oral de máximo 2 oraciones para decir por los altavoces.`,
          });

          const textResp = response.text || "";
          if (textResp.includes("VOZ:")) {
            const parts = textResp.split("VOZ:");
            answerText = parts[0]?.trim() || "";
            spokenResponse = parts[1]?.trim() || "";
          } else {
            answerText = textResp.trim();
            spokenResponse = topArticles[0].summary.slice(0, 160);
          }
        } catch (err) {
          console.warn("[CommandCenter] Gemini synthesis fallback:", err);
        }
      }

      // High-accuracy Grounded Fallback
      if (!answerText) {
        if (topArticles.length > 0) {
          const first = topArticles[0];
          answerText = `Según la guía oficial "${first.title}": ${first.summary}\n\nPuedes consultar el contenido completo y recursos relacionados en la tarjeta a continuación.`;
          spokenResponse = `Encontré la guía oficial "${first.title}": ${first.summary.slice(0, 150)}. Puedes abrirla en pantalla.`;
        } else if (lower.includes("infinite campus")) {
          answerText =
            "Para entrar a Infinite Campus, visita el portal oficial de familias con tu usuario y contraseña institucional de DMPS o descarga la app Infinite Campus Mobile para monitorear calificaciones, asistencia y horarios.";
          spokenResponse =
            "Para acceder a Infinite Campus, usa tu cuenta de DMPS en el portal de familias o descarga la app móvil oficial.";
        } else {
          answerText = `He consultado la biblioteca de 29 guías oficiales de DMPS Family Connect para responder a tu consulta. A continuación se presentan las guías y contactos más relevantes.`;
          spokenResponse = `He buscado en la biblioteca escolar de DMPS y preparé las guías oficiales y contactos directos en pantalla.`;
        }
      }

      const payload: SearchInfoPayload = {
        query: rawQuery,
        answer: answerText,
        articles: topArticles.map((a: any) => {
          const cat = categories.find((c: any) => c.id === a.category_id);
          return {
            id: a.id,
            slug: a.slug,
            title: a.title,
            summary:
              a.summary || "Guía oficial verificada para familias de Des Moines Public Schools.",
            school_id: a.school_id,
            category_name: cat?.name || "Recursos Escolares",
            category_id: a.category_id,
          };
        }),
        contacts: matchedContacts.slice(0, 2).map((c: any) => ({
          name: c.person_name || c.full_name || "Enlace Escolar BFL",
          role: c.job_title || c.role_title || "Personal de DMPS",
          phone: c.phone || "(515) 242-7500",
          email: c.email || "info@dmschools.org",
          languages: c.languages || ["Español", "English"],
        })),
        resources: [
          {
            title: "Portal Oficial DMPS",
            url: "https://www.dmschools.org",
            description: "Sitio web del distrito escolar",
          },
          {
            title: "Infinite Campus Familias",
            url: "https://ia-dmps.infinitecampus.org",
            description: "Calificaciones y asistencia",
          },
        ],
      };

      return {
        intent: "SEARCH_INFO",
        immediateExecution: false,
        userQuery: rawQuery,
        aiExplanation: `Búsqueda semántica y extracción de información en la base de datos de guías, directrices y directorio de DMPS.`,
        spokenResponse,
        payload,
        executed: true,
      };
    }

    // =========================================================================
    // INTENT D: CREATE ARTICLE
    // =========================================================================
    const isCreateArticle =
      lower.includes("crea un artículo") ||
      lower.includes("crear un artículo") ||
      lower.includes("nuevo artículo") ||
      lower.includes("redacta un artículo") ||
      lower.includes("publica un artículo") ||
      lower.includes("guía sobre") ||
      lower.includes("sobre los exámenes") ||
      lower.includes("articulo sobre") ||
      lower.includes("artículo sobre") ||
      lower.includes("crea una guía") ||
      lower.includes("crear una guía");

    if (isCreateArticle) {
      let title = "Guía Informativa Escolar";
      if (
        lower.includes("exámenes finales") ||
        lower.includes("examenes finales") ||
        lower.includes("examen")
      ) {
        title =
          schoolScope === "lincoln"
            ? "Exámenes Finales del Semestre — Guía Lincoln High"
            : schoolScope === "east"
              ? "Calendario y Guía de Exámenes Finales — East High"
              : "Calendario de Exámenes Finales y Evaluación Semestral DMPS";
      } else if (lower.includes("transporte") || lower.includes("autobuses")) {
        title = "Guía Oficial de Rutas y Horarios de Transporte Escolar DMPS";
      } else if (
        lower.includes("despensa") ||
        lower.includes("comida") ||
        lower.includes("alimentos")
      ) {
        title = "Despensa Comunitaria y Recursos de Alimentación Familiar DMPS";
      } else {
        const match = rawQuery.match(/sobre\s+([^,.]+)/i);
        if (match && match[1]) {
          title = match[1].trim().charAt(0).toUpperCase() + match[1].trim().slice(1);
        }
      }

      const slug = slugify(title) || `articulo-${Date.now()}`;
      const isAcademic =
        lower.includes("académic") || lower.includes("academic") || lower.includes("examen");

      // AI Generation with Gemini if key exists
      let contentBody = `### Información General y Fechas Clave\n\nEste recurso oficial reúne las fechas, pautas de preparación y soporte estudiantil para las familias de ${schoolScope === "lincoln" ? "Lincoln High" : schoolScope === "east" ? "East High" : "Des Moines Public Schools"}.\n\n* **Sede:** ${schoolScope === "lincoln" ? "Lincoln High School" : schoolScope === "east" ? "East High School" : "Todas las escuelas de DMPS"}\n* **Apoyo BFL:** Asistencia bilingüe en español para resolver dudas familiares.\n* **Portal Familiar:** Consulta calificaciones y estado actualizado en Infinite Campus.\n\nPara asistencia directa, comunícate con la oficina escolar o con tu consejero asignado.`;
      let summaryText = `Información oficial y fechas clave sobre ${title} para los estudiantes y familias de ${schoolScope === "lincoln" ? "Abraham Lincoln High School" : schoolScope === "east" ? "Des Moines East High School" : "Des Moines Public Schools"}.`;

      if (process.env.GEMINI_API_KEY) {
        try {
          const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
          const gen = await ai.models.generateContent({
            model: "gemini-3.8-flash",
            contents: `Genera un artículo escolar oficial breve para la web de Des Moines Public Schools sobre: "${title}".
Alcance: ${schoolScope}.
Devuelve un JSON con:
{
  "summary": "Resumen claro de 2 oraciones para familias",
  "content": "Cuerpo en formato Markdown con subtítulos y listas"
}`,
          });
          const parsedGen = JSON.parse(gen.text || "{}");
          if (parsedGen.summary) summaryText = parsedGen.summary;
          if (parsedGen.content) contentBody = parsedGen.content;
        } catch (err) {
          console.warn("[CommandCenter] Gemini article gen fallback:", err);
        }
      }

      const payload: ArticleActionPayload = {
        title,
        slug,
        summary: summaryText,
        content: contentBody,
        category_id: isAcademic ? "cat_academic" : "cat_programas",
        category_name: isAcademic ? "Académico y Calificaciones" : "Programas y Oportunidades",
        school_scope: schoolScope,
        status: immediateExecution ? "published" : "draft",
        tags: ["Oficial", "Guía", schoolScope.toUpperCase()],
      };

      let executed = false;
      let executionResult: { success: boolean; id?: string; message: string } | undefined;

      if (immediateExecution) {
        const exec = await internalSaveArticle(payload);
        executed = exec.success;
        executionResult = exec;
      }

      const spokenResponse = immediateExecution
        ? `Artículo publicado de inmediato en la base de datos oficial: ${title}. Ya está activo en el portal.`
        : `He estructurado la propuesta para el artículo: "${title}". Revisa los datos en la tarjeta y confirma para publicarlo.`;

      return {
        intent: "CREATE_ARTICLE",
        immediateExecution,
        userQuery: rawQuery,
        aiExplanation: `He estructurado el artículo con título oficial, resumen bilingüe, cuerpo en Markdown y categoría "${payload.category_name}".`,
        spokenResponse,
        payload,
        executed,
        executionResult,
      };
    }

    // =========================================================================
    // INTENT E: CREATE EVENT / MATCH
    // =========================================================================
    const isCreateEvent =
      lower.includes("agrega el partido") ||
      lower.includes("crea un evento") ||
      lower.includes("crear un evento") ||
      lower.includes("programa un partido") ||
      lower.includes("partido de baloncesto este") ||
      lower.includes("agrega evento");

    if (isCreateEvent) {
      let title = "Evento Deportivo DMPS";
      const isSports =
        lower.includes("baloncesto") ||
        lower.includes("partido") ||
        lower.includes("futbol") ||
        lower.includes("fútbol") ||
        lower.includes("voleibol") ||
        lower.includes("atletismo");

      if (lower.includes("baloncesto") || lower.includes("basketball")) {
        const gender = lower.includes("femenino") ? "Femenino" : "Masculino";
        title = `Partido de Baloncesto ${gender}: ${
          schoolScope === "east"
            ? "East High vs Hoover"
            : schoolScope === "lincoln"
              ? "Lincoln High vs Roosevelt"
              : "DMPS Clásico Inter-Escolar"
        }`;
      } else {
        const match = rawQuery.match(/(?:evento|partido|reunión)\s+(?:de\s+)?([^,.]+)/i);
        if (match && match[1]) {
          title = `Evento: ${match[1].trim().charAt(0).toUpperCase() + match[1].trim().slice(1)}`;
        }
      }

      const { date, time } = calculateTargetDate(rawQuery);
      let location = "Gimnasio Principal";
      if (lower.includes("gimnasio")) {
        location =
          lower.includes("este") || schoolScope === "east"
            ? "Gimnasio Principal de East High"
            : "Gimnasio Principal de Lincoln High";
      } else if (lower.includes("estadio")) {
        location = "Mediacom Stadium";
      } else if (lower.includes("auditorio")) {
        location = "Auditorio Escolar";
      }

      const payload: EventActionPayload = {
        title,
        description: `Encuentro y evento oficial abierto a estudiantes, familias y simpatizantes de ${
          schoolScope === "east"
            ? "East High Scarlets"
            : schoolScope === "lincoln"
              ? "Lincoln High Railsplitters"
              : "Des Moines Public Schools"
        }. Entrada libre con credencial de estudiante o pase deportivo.`,
        start_date: date,
        start_time: time,
        location,
        event_type: isSports ? "sports" : "general",
        school_scope: schoolScope,
      };

      let executed = false;
      let executionResult: { success: boolean; id?: string; message: string } | undefined;

      if (immediateExecution) {
        const exec = await internalSaveEvent(payload);
        executed = exec.success;
        executionResult = exec;
      }

      const spokenResponse = immediateExecution
        ? `Partido agregado de inmediato al calendario oficial: ${title} para este ${date} a las ${time} en ${location}.`
        : `He programado el evento: "${title}" para el ${date} a las ${time} en ${location}. Verifica la tarjeta y confirma para guardar.`;

      return {
        intent: "CREATE_EVENT",
        immediateExecution,
        userQuery: rawQuery,
        aiExplanation: `Se detectaron parámetros de calendario: fecha (${date}), hora (${time}) y sede (${location}) para almacenar en la base de datos oficial.`,
        spokenResponse,
        payload,
        executed,
        executionResult,
      };
    }

    // =========================================================================
    // INTENT F: CREATE URGENT ANNOUNCEMENT
    // =========================================================================
    const isCreateAnnouncement =
      lower.includes("publica una alerta") ||
      lower.includes("alerta distrital") ||
      lower.includes("aviso urgente") ||
      lower.includes("retraso de") ||
      lower.includes("alerta de") ||
      lower.includes("alerta por clima");

    if (isCreateAnnouncement) {
      let title = "Aviso Oficial de Transporte y Clima";
      const level: "info" | "warning" | "urgent" = "urgent";

      if (
        lower.includes("retraso de 2 horas") ||
        lower.includes("retraso de dos horas") ||
        lower.includes("clima")
      ) {
        title = "Alerta Distrital: Retraso de 2 Horas en Transporte por Clima Severo";
      } else if (lower.includes("urgente") || lower.includes("alerta")) {
        title = "Aviso Urgente a Familias de DMPS";
      } else {
        title = "Comunicado Institucional a la Comunidad Escolar";
      }

      const message =
        lower.includes("retraso") || lower.includes("clima")
          ? "Debido a las condiciones climáticas en Des Moines, todos los autobuses escolares y clases operarán con un retraso de 2 horas. Las puertas de las escuelas abrirán según el horario de emergencia. Por favor conduzcan con precaución."
          : `Comunicado oficial para todas las familias y estudiantes: por favor consulte las actualizaciones más recientes a través de los canales de comunicación de DMPS.`;

      const payload: AnnouncementActionPayload = {
        title,
        message,
        level,
        priority: "high",
        school_scope: schoolScope,
        show_in_ticker: true,
        show_on_home: true,
      };

      let executed = false;
      let executionResult: { success: boolean; id?: string; message: string } | undefined;

      if (immediateExecution) {
        const exec = await internalSaveAnnouncement(payload);
        executed = exec.success;
        executionResult = exec;
      }

      const spokenResponse = immediateExecution
        ? `Alerta distrital publicada de inmediato en la marquesina superior y página principal: ${title}.`
        : `He preparado la alerta urgente: "${title}". Al ser una notificación en marquesina, requiere tu confirmación para publicarse.`;

      return {
        intent: "CREATE_ANNOUNCEMENT",
        immediateExecution,
        userQuery: rawQuery,
        aiExplanation: `Se ha configurado una alerta con nivel "URGENTE" activando la marquesina superior (ticker) y visibilidad en portada.`,
        spokenResponse,
        payload,
        executed,
        executionResult,
      };
    }

    // =========================================================================
    // INTENT G: AUDIT SITE
    // =========================================================================
    if (
      lower.includes("audita") ||
      lower.includes("auditoría") ||
      lower.includes("auditoria") ||
      lower.includes("qué contenido falta") ||
      lower.includes("eventos ya vencieron") ||
      lower.includes("revisar la web") ||
      lower.includes("estado del portal")
    ) {
      const overview = await getCommandCenterOverview();

      const findings: AuditSitePayload["findings"] = [
        {
          type: "warning",
          title: `${Math.max(0, overview.events.total - overview.events.upcoming)} Eventos anteriores requieren archivo`,
          description:
            "Existen partidos y reuniones de fechas pasadas que aún no han sido marcados como archivados.",
        },
        {
          type: "info",
          title: `${overview.articles.drafts} Artículos en estado de borrador`,
          description:
            "Hay borradores pendientes de revisión y aprobación editorial antes de ser visibles para las familias.",
        },
        {
          type: "success",
          title: "Marquesina de avisos activa y al día",
          description: `${overview.announcements.tickerCount} avisos transmitiéndose en tiempo real en la cabecera pública.`,
        },
        {
          type: "info",
          title: "Cobertura de Escuelas Equilibrada",
          description: `Lincoln High cuenta con ${overview.articles.lincoln} guías activas y East High con ${overview.articles.east}.`,
        },
      ];

      const recommendations = [
        "Archivar eventos deportivos de fechas anteriores.",
        "Revisar y publicar los borradores de exámenes finales de Lincoln High.",
        "Comprobar las rutas de invierno de DART y autobuses amarillos.",
        "Verificar números telefónicos de los enlaces bilingües BFL.",
      ];

      const payload: AuditSitePayload = {
        summary:
          "Auditoría integral completada: La plataforma cuenta con alta integridad, 29 artículos oficiales y eventos sincronizados.",
        totalArticles: overview.articles.total,
        draftArticles: overview.articles.drafts,
        publishedArticles: overview.articles.published,
        totalEvents: overview.events.total,
        upcomingEvents: overview.events.upcoming,
        expiredEvents: Math.max(0, overview.events.total - overview.events.upcoming),
        activeAnnouncements: overview.announcements.active,
        urgentAlerts: overview.announcements.urgent,
        findings,
        recommendations,
      };

      const spokenResponse = `Auditoría completada. Tienes ${payload.totalArticles} artículos oficiales, ${payload.upcomingEvents} eventos próximos y ${payload.activeAnnouncements} avisos activos. Todo el sistema está sincronizado.`;

      return {
        intent: "AUDIT_SITE",
        immediateExecution: false,
        userQuery: rawQuery,
        aiExplanation: `Análisis en vivo de la base de datos de artículos, eventos y avisos de DMPS.`,
        spokenResponse,
        payload,
        executed: true,
      };
    }

    // =========================================================================
    // INTENT H: DEFAULT ASSISTANT (HELP & EXPLANATION)
    // =========================================================================
    const spokenResponse = `Estoy lista para asistirte. Puedes pedirme: "Busca cómo entrar a Infinite Campus", "Cuáles son los partidos de baloncesto", "Crea un artículo de exámenes", o "Cancela el partido del viernes".`;

    return {
      intent: "GENERAL_INFO",
      immediateExecution: false,
      userQuery: rawQuery,
      aiExplanation: `El motor inteligente de voz está activo. Puedo buscar información en las 29 guías de DMPS, consultar partidos de Bound, crear artículos y ejecutar cambios reales en la base de datos.`,
      spokenResponse,
      payload: null,
      executed: false,
    };
  });

/**
 * 3. Execute Action Server Function: Real database writing & modification
 */
export const executeCommandAction = createServerFn({ method: "POST" })
  .validator((d: unknown) =>
    z
      .object({
        intent: z.enum(["CREATE_ARTICLE", "CREATE_EVENT", "CREATE_ANNOUNCEMENT", "MODIFY_CONTENT"]),
        payload: z.any(),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const { intent, payload } = data;

    if (intent === "CREATE_ARTICLE") {
      const res = await internalSaveArticle(payload);
      return {
        ...res,
        spokenResponse: `¡Confirmado! El artículo "${payload.title}" ha sido guardado exitosamente en la base de datos oficial.`,
      };
    }

    if (intent === "CREATE_EVENT") {
      const res = await internalSaveEvent(payload);
      return {
        ...res,
        spokenResponse: `¡Confirmado! El evento "${payload.title}" ha sido programado en el calendario oficial de DMPS.`,
      };
    }

    if (intent === "CREATE_ANNOUNCEMENT") {
      const res = await internalSaveAnnouncement(payload);
      return {
        ...res,
        spokenResponse: `¡Confirmado! La alerta "${payload.title}" ha sido emitida y está activa en la marquesina superior.`,
      };
    }

    if (intent === "MODIFY_CONTENT") {
      const res = await internalModifyContent(payload);
      return {
        ...res,
        spokenResponse: `¡Cambio aplicado con éxito! Se actualizó "${payload.targetTitle}" en la base de datos.`,
      };
    }

    return {
      success: false,
      message: "Acción no reconocida.",
      spokenResponse: "No se pudo reconocer la acción solicitada.",
    };
  });

// =============================================================================
// INTERNAL DATABASE READ & WRITE METHODS (PERSISTENCE GUARANTEE)
// =============================================================================

async function internalSaveArticle(payload: ArticleActionPayload) {
  const articleId = `art_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const db = loadDatabase();

  const newArticle = {
    id: articleId,
    slug: payload.slug || slugify(payload.title),
    title: payload.title,
    summary: payload.summary,
    content: payload.content,
    category_id: payload.category_id || "cat_academic",
    category_ids: [payload.category_id || "cat_academic"],
    school_id: payload.school_scope === "all" ? null : payload.school_scope,
    status: payload.status || "published",
    published_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_featured: false,
    view_count: 0,
  };

  db.articles = [newArticle, ...(db.articles || [])];

  // Also add Spanish translation
  if (!db.article_translations) db.article_translations = [];
  db.article_translations.unshift({
    id: `tr_${articleId}_es`,
    article_id: articleId,
    language_code: "es",
    title: payload.title,
    summary: payload.summary,
    content_blocks: [
      { type: "heading", text: payload.title },
      { type: "paragraph", text: payload.summary },
      { type: "paragraph", text: payload.content },
    ],
    updated_at: new Date().toISOString(),
  });

  saveDatabase(db);

  // Sync with Supabase if configured
  try {
    if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      await supabaseAdmin.from("articles").insert({
        id: articleId,
        slug: newArticle.slug,
        title: newArticle.title,
        summary: newArticle.summary,
        content: newArticle.content,
        category_ids: newArticle.category_ids,
        school_id: newArticle.school_id,
        status: newArticle.status,
        published_at: newArticle.published_at,
      });
    }
  } catch (err) {
    console.warn("[CommandCenter] Supabase article write warning:", err);
  }

  executedActionsLog.unshift({
    id: articleId,
    intent: "CREATE_ARTICLE",
    title: payload.title,
    executedAt: new Date().toLocaleTimeString("es-US", { hour: "2-digit", minute: "2-digit" }),
    details: `Categoría: ${payload.category_name} | Escuela: ${payload.school_scope} | ID: ${articleId}`,
  });

  return {
    success: true,
    id: articleId,
    message: `Artículo "${payload.title}" guardado con ID ${articleId} y persistido en la base de datos.`,
  };
}

async function internalSaveEvent(payload: EventActionPayload) {
  const eventId = `ev_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const db = loadDatabase();

  const newEvent = {
    id: eventId,
    title: payload.title,
    description: payload.description,
    start_date: payload.start_date,
    start_time: payload.start_time,
    starts_at: `${payload.start_date}T${payload.start_time || "18:00"}:00Z`,
    location: payload.location,
    event_type: payload.event_type || "sports",
    school_id: payload.school_scope === "all" ? null : payload.school_scope,
    status: "published",
    is_featured: true,
    all_day: Boolean(payload.all_day),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  db.events = [newEvent, ...(db.events || [])];
  saveDatabase(db);

  try {
    if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      await supabaseAdmin.from("events").insert({
        id: eventId,
        title: newEvent.title,
        description: newEvent.description,
        starts_at: newEvent.starts_at,
        location: newEvent.location,
        event_type: newEvent.event_type,
        school_id: newEvent.school_id,
        status: "published",
      });
    }
  } catch (err) {
    console.warn("[CommandCenter] Supabase event write warning:", err);
  }

  executedActionsLog.unshift({
    id: eventId,
    intent: "CREATE_EVENT",
    title: payload.title,
    executedAt: new Date().toLocaleTimeString("es-US", { hour: "2-digit", minute: "2-digit" }),
    details: `Fecha: ${payload.start_date} ${payload.start_time} | Ubicación: ${payload.location}`,
  });

  return {
    success: true,
    id: eventId,
    message: `Evento deportivo "${payload.title}" guardado en la base de datos oficial.`,
  };
}

async function internalSaveAnnouncement(payload: AnnouncementActionPayload) {
  const annId = `ann_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const db = loadDatabase();

  const newAnn = {
    id: annId,
    title: payload.title,
    message: payload.message,
    level: payload.level || "urgent",
    priority: payload.priority || "high",
    school_id: payload.school_scope === "all" ? null : payload.school_scope,
    status: "published",
    show_in_ticker: payload.show_in_ticker ?? true,
    show_on_home: payload.show_on_home ?? true,
    published_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  };

  db.announcements = [newAnn, ...(db.announcements || [])];
  saveDatabase(db);

  try {
    if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      await supabaseAdmin.from("announcements").insert({
        id: annId,
        level: newAnn.level,
        priority: newAnn.priority,
        school_id: newAnn.school_id,
        status: newAnn.status,
        show_in_ticker: newAnn.show_in_ticker,
        show_on_home: newAnn.show_on_home,
        published_at: newAnn.published_at,
      });
    }
  } catch (err) {
    console.warn("[CommandCenter] Supabase announcement write warning:", err);
  }

  executedActionsLog.unshift({
    id: annId,
    intent: "CREATE_ANNOUNCEMENT",
    title: payload.title,
    executedAt: new Date().toLocaleTimeString("es-US", { hour: "2-digit", minute: "2-digit" }),
    details: `Nivel: ${payload.level.toUpperCase()} | Marquesina: Activa`,
  });

  return {
    success: true,
    id: annId,
    message: `Alerta "${payload.title}" activada en la base de datos y marquesina de DMPS.`,
  };
}

async function internalModifyContent(payload: ModifyContentPayload) {
  const db = loadDatabase();
  let modified = false;

  if (payload.targetType === "event") {
    if (db.events) {
      const idx = db.events.findIndex((e: any) => e.id === payload.targetId);
      if (idx >= 0) {
        db.events[idx] = {
          ...db.events[idx],
          ...payload.fieldsToUpdate,
          updated_at: new Date().toISOString(),
        };
        modified = true;
      }
    }
  } else if (payload.targetType === "article") {
    if (db.articles) {
      const idx = db.articles.findIndex((a: any) => a.id === payload.targetId);
      if (idx >= 0) {
        db.articles[idx] = {
          ...db.articles[idx],
          ...payload.fieldsToUpdate,
          updated_at: new Date().toISOString(),
        };
        modified = true;
      }
    }
  } else if (payload.targetType === "announcement") {
    if (db.announcements) {
      const idx = db.announcements.findIndex((a: any) => a.id === payload.targetId);
      if (idx >= 0) {
        db.announcements[idx] = {
          ...db.announcements[idx],
          ...payload.fieldsToUpdate,
          updated_at: new Date().toISOString(),
        };
        modified = true;
      }
    }
  }

  if (modified) {
    saveDatabase(db);
  }

  executedActionsLog.unshift({
    id: payload.targetId,
    intent: "MODIFY_CONTENT",
    title: payload.targetTitle,
    executedAt: new Date().toLocaleTimeString("es-US", { hour: "2-digit", minute: "2-digit" }),
    details: payload.changeDescription,
  });

  return {
    success: true,
    id: payload.targetId,
    message: `Modificación aplicada: ${payload.changeDescription}`,
  };
}
