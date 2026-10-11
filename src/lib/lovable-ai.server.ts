// Minimal drop-in for the parts of @google/genai this app used, backed by the Lovable AI Gateway (Responses API).
// Callers keep `ai.models.generateContent({ model, contents, config })` and read `response.text`.

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/responses";
const DEFAULT_MODEL = "openai/gpt-6-astra";

function toInputContent(contents: unknown): any[] {
  if (typeof contents === "string") return [{ type: "input_text", text: contents }];
  const parts: any[] = Array.isArray(contents) ? contents : [contents];
  return parts.flatMap((p: any) => {
    if (typeof p === "string") return [{ type: "input_text", text: p }];
    if (p?.parts) return toInputContent(p.parts);
    if (p?.text) return [{ type: "input_text", text: p.text }];
    if (p?.inlineData?.data) {
      const mime = p.inlineData.mimeType || "audio/mpeg";
      const url = `data:${mime};base64,${p.inlineData.data}`;
      if (mime.startsWith("image/")) return [{ type: "input_image", image_url: url }];
      return [{ type: "input_file", filename: `media.${mime.split("/")[1] || "bin"}`, file_data: url }];
    }
    return [];
  });
}

export function hasLovableAI(): boolean {
  return Boolean(process.env["LOVABLE_API_KEY"]);
}

export class LovableGenAI {
  models = {
    generateContent: async (req: { model?: string; contents: unknown; config?: any }) => {
      const key = process.env["LOVABLE_API_KEY"];
      if (!key) throw new Error("La IA integrada no está disponible en este momento.");
      const wantsJson = req.config?.responseMimeType === "application/json";
      const instructions = [
        req.config?.systemInstruction ? String(req.config.systemInstruction) : "",
        wantsJson ? "Respond ONLY with valid JSON. No markdown fences." : "",
      ].filter(Boolean).join("\n");

      const res = await fetch(GATEWAY_URL, {
        method: "POST",
        headers: {
          "Lovable-API-Key": key,
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
          "X-Lovable-AIG-SDK": "fetch",
        },
        body: JSON.stringify({
          model: DEFAULT_MODEL,
          stream: true,
          store: false,
          reasoning: { effort: "low" },
          ...(instructions ? { instructions } : {}),
          input: [{ role: "user", content: toInputContent(req.contents) }],
        }),
      });
      if (res.status === 429) throw new Error("429: Demasiadas solicitudes a la IA. Intenta de nuevo en un momento.");
      if (res.status === 402) throw new Error("402: Se agotaron los créditos de IA del espacio de trabajo.");
      if (!res.ok) throw new Error(`Error de IA (${res.status}): ${(await res.text()).slice(0, 300)}`);
      // Consume the SSE stream and collect the output text.
      let text = "";
      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        let idx;
        while ((idx = buf.indexOf("\n")) >= 0) {
          const line = buf.slice(0, idx).trim();
          buf = buf.slice(idx + 1);
          if (!line.startsWith("data:")) continue;
          const payload = line.slice(5).trim();
          if (!payload || payload === "[DONE]") continue;
          try {
            const ev = JSON.parse(payload);
            if (ev.type === "response.output_text.delta") text += ev.delta ?? "";
            if (ev.type === "response.failed" || ev.type === "error") {
              throw new Error(ev?.response?.error?.message || ev?.message || "Error de IA");
            }
          } catch (e: any) {
            if (e?.message && !(e instanceof SyntaxError)) throw e;
          }
        }
      }
      text = (text || "").trim().replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "");
      return { text };
    },
  };
}
