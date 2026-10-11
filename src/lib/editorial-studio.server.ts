// Server-only: uses the Lovable AI Gateway for text and images.
import dns from "node:dns/promises";
import { isPrivateOrReservedIp } from "./remove-bg.server";
import { LovableGenAI } from "./lovable-ai.server";
export const IMAGE_MODEL = "openai/gpt-image-2.5-sunburst";

export type GeneratedArticle = {
  title_es: string;
  summary_es: string;
  content_es: string;
  title_en: string;
  summary_en: string;
  content_en: string;
  image_alt_es: string;
  image_alt_en?: string;
  category_id: string;
  official_url: string;
  source_name: string;
  image_prompt_es?: string;
  image_prompt_en?: string;
  image_prompt?: string;
};

export interface UrlCheckResult {
  url: string;
  accessible: boolean;
  httpStatus?: number;
  isKnownOfficialDomain: boolean;
  statusLabel: string;
}

const KNOWN_OFFICIAL_DOMAINS = [
  "dmschools.org",
  "iowa.gov",
  "educateiowa.gov",
  "ridedart.com",
  "dmreg.co",
  "desmoinesregister.com",
];

export async function verifySourceUrlSafety(targetUrl: string): Promise<UrlCheckResult> {
  if (!targetUrl || !targetUrl.trim()) {
    return {
      url: targetUrl,
      accessible: false,
      isKnownOfficialDomain: false,
      statusLabel: "URL vacía",
    };
  }

  try {
    const parsed = new URL(targetUrl.trim());
    if (parsed.protocol !== "https:") {
      return {
        url: targetUrl,
        accessible: false,
        isKnownOfficialDomain: false,
        statusLabel: "Rechazado: no utiliza HTTPS seguro",
      };
    }

    const host = parsed.hostname.toLowerCase();
    if (
      host === "localhost" ||
      host.endsWith(".localhost") ||
      host.endsWith(".local") ||
      host.endsWith(".internal")
    ) {
      return {
        url: targetUrl,
        accessible: false,
        isKnownOfficialDomain: false,
        statusLabel: "Rechazado: destino local o interno no permitido (SSRF mitigado)",
      };
    }

    // Check against SSRF via DNS
    let addresses: import("node:dns").LookupAddress[] = [];
    try {
      addresses = await dns.lookup(host, { all: true });
    } catch {
      return {
        url: targetUrl,
        accessible: false,
        isKnownOfficialDomain: false,
        statusLabel: "Fallo DNS: el dominio no resuelve a ninguna dirección IP",
      };
    }

    for (const record of addresses) {
      if (isPrivateOrReservedIp(record.address)) {
        return {
          url: targetUrl,
          accessible: false,
          isKnownOfficialDomain: false,
          statusLabel: `Rechazado: resuelve a dirección privada/metadatos (${record.address})`,
        };
      }
    }

    const isKnownOfficial = KNOWN_OFFICIAL_DOMAINS.some(
      (dom) => host === dom || host.endsWith(`.${dom}`),
    );

    // Controlled HEAD request with short timeout (3.5s)
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 3500);

    let res: Response;
    try {
      res = await fetch(parsed.toString(), {
        method: "HEAD",
        signal: ctrl.signal,
        redirect: "follow",
        headers: { "User-Agent": "DMPS-LinkVerifier/1.0" },
      });
    } catch (e) {
      clearTimeout(timer);
      return {
        url: targetUrl,
        accessible: false,
        isKnownOfficialDomain: isKnownOfficial,
        statusLabel: `No accesible o tiempo de espera agotado (${(e as Error).name})`,
      };
    }
    clearTimeout(timer);

    const ok = res.status >= 200 && res.status < 400;
    const label = ok
      ? isKnownOfficial
        ? `Fuente oficial confirmada (HTTP ${res.status} en dominio oficial)`
        : `Enlace accesible (HTTP ${res.status}, sugerencia externa pendiente de verificación)`
      : `No accesible (HTTP ${res.status})`;

    return {
      url: targetUrl,
      accessible: ok,
      httpStatus: res.status,
      isKnownOfficialDomain: isKnownOfficial,
      statusLabel: label,
    };
  } catch (err) {
    return {
      url: targetUrl,
      accessible: false,
      isKnownOfficialDomain: false,
      statusLabel: `URL sintácticamente inválida: ${(err as Error).message}`,
    };
  }
}

export async function researchArticle(opts: {
  topic?: string;
  avoidTitles: string[];
  categories: { id: string; name: string }[];
}): Promise<{ article: GeneratedArticle; sources: string[]; verificationAudit: string }> {
  const prompt = `Eres editor en jefe de DMPS Info, el portal oficial comunitario para familias y estudiantes de Des Moines Public Schools (Iowa), incluyendo Lincoln High, East High, Roosevelt, North, Hoover y Central Campus.
${opts.topic ? `Tema solicitado: "${opts.topic}".` : "Propón y escribe sobre un tema útil, relevante y actual para las familias (fechas escolares, programas, becas, transporte DART, inscripciones, nutrición, salud, tutorías, recursos comunitarios)."}
Usa solo información de fuentes verificables que conozcas (dmschools.org, iowa.gov, departamentos de educación, distritos escolares). No inventes datos, teléfonos ni fechas.
No repitas estos títulos existentes: ${opts.avoidTitles.slice(0, 60).join(" | ") || "ninguno"}.

REGLAS DE CONTENIDO Y MULTIMEDIA:
1. Escribe en Markdown rico (## subtítulos, listas, formato claro, lenguaje empático y accesible para familias), 500-800 palabras.
2. RECURSOS MULTIMEDIA Y VIDEOS SUGERIDOS:
   Si existen videos o guías explicativas relevantes, titula la sección claramente:
   "## Recursos y Videos Informativos Sugeridos" (en español) / "## Recommended Informational Resources and Videos" (en inglés).
   No presentes enlaces a videos de terceros o búsquedas de YouTube como "fuentes oficiales confirmadas". Indícalos explícitamente como sugerencias de búsqueda o recursos educativos adicionales.
3. IMÁGENES ILUSTRATIVAS: Describe recursos visuales útiles (mapas escolares, formularios oficiales, calendarios).
4. Genera la versión completa equivalente en inglés (natural American English).
5. Categorías disponibles (usa el id exacto): ${opts.categories.map((c) => `${c.id}=${c.name}`).join(", ")}.

PORTADAS EDITORIALES PARA AMBAS VERSIONES:
Proporciona dos prompts de imagen (image_prompt_es y image_prompt_en) para generar portadas de alta calidad editorial acordes al tema.

Responde SOLO con un objeto JSON con las claves:
- title_es
- summary_es (máx 180 caracteres)
- content_es
- title_en
- summary_en
- content_en
- image_alt_es
- image_alt_en
- category_id
- official_url (enlace oficial principal de consulta)
- source_name
- image_prompt_es
- image_prompt_en
- image_prompt`;

  const ai = new LovableGenAI();
  const res = await ai.models.generateContent({
    contents: prompt,
    config: { responseMimeType: "application/json" },
  });
  const m = res.text.match(/\{[\s\S]*\}/);
  if (!m) throw new Error("La IA no devolvió un artículo válido.");
  const article = JSON.parse(m[0]) as GeneratedArticle;
  if (!article.title_es || !article.content_es) throw new Error("Artículo incompleto.");

  const sources = [article.official_url].filter(Boolean);

  // Technical verification check of the main source URL
  let verificationAudit = "Sin fuentes declaradas";
  if (article.official_url) {
    const check = await verifySourceUrlSafety(article.official_url);
    verificationAudit = `[Verificación Técnica de Enlaces]
URL: ${check.url}
Accesibilidad: ${check.accessible ? "Accesible" : "No comprobada"}
Dominio oficial: ${check.isKnownOfficialDomain ? "Sí (Distrito/Gobierno)" : "No (Externo o sugerencia)"}
Detalle: ${check.statusLabel}
Estado editorial: Pendiente de confirmación humana`;
  }

  return { article, sources, verificationAudit };
}

export async function generateImage(prompt: string): Promise<{ mime: string; data: Uint8Array }> {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new Error("La IA integrada no está disponible.");
  const res = await fetch("https://ai.gateway.lovable.dev/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      "X-Lovable-AIG-SDK": "fetch",
    },
    body: JSON.stringify({
      model: IMAGE_MODEL,
      prompt: `${prompt}. Warm, inclusive, realistic editorial photo style for a school district family portal. Wide composition. No text, no logos.`,
      size: "1536x1024",
      n: 1,
    }),
  });
  const json = (await res.json().catch(() => ({}))) as any;
  if (res.status === 402) throw new Error("Se agotaron los créditos de IA.");
  if (res.status === 429) throw new Error("Demasiadas solicitudes, intenta en un momento.");
  if (!res.ok) throw new Error(json?.error?.message || `Error de imagen (${res.status})`);
  const b64 = json?.data?.[0]?.b64_json;
  if (!b64) throw new Error("La IA no devolvió una imagen.");
  return { mime: "image/png", data: Uint8Array.from(atob(b64), (c) => c.charCodeAt(0)) };
}

export function markdownToBlocks(md: string): any[] {
  const blocks: any[] = [];
  let list: string[] = [];
  const flush = () => {
    if (list.length) blocks.push({ type: "list", items: list });
    list = [];
  };
  for (const raw of md.split("\n")) {
    const line = raw.trim();
    if (!line) {
      flush();
      continue;
    }
    if (/^#{1,3}\s+/.test(line)) {
      flush();
      blocks.push({ type: "heading", text: line.replace(/^#{1,3}\s+/, "") });
    } else if (/^(\*|-|\d+\.)\s+/.test(line)) list.push(line.replace(/^(\*|-|\d+\.)\s+/, ""));
    else if (line.startsWith("> ")) {
      flush();
      blocks.push({
        type: "callout",
        title: "Importante",
        text: line.slice(2),
        variant: "verified",
      });
    } else {
      flush();
      blocks.push({ type: "paragraph", text: line });
    }
  }
  flush();
  return blocks;
}
