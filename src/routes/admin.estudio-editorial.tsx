import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import {
  generateStudioDraft,
  regenerateStudioImage,
  STUDIO_MARK,
} from "@/lib/editorial-studio.functions";

export const Route = createFileRoute("/admin/estudio-editorial")({
  head: () => ({ meta: [{ title: "AI Editorial Studio — DMPS Info" }] }),
  component: StudioPage,
});

type Draft = {
  id: string;
  slug: string;
  title: string | null;
  summary: string | null;
  status: string | null;
  verification_status: string | null;
  featured_image_url: string | null;
  official_url: string | null;
  verification_details: string | null;
  created_at: string | null;
};

function StudioPage() {
  const qc = useQueryClient();
  const generate = useServerFn(generateStudioDraft);
  const regenImage = useServerFn(regenerateStudioImage);
  const [topic, setTopic] = useState("");
  const [withImage, setWithImage] = useState(true);
  const [progress, setProgress] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const drafts = useQuery({
    queryKey: ["studio-drafts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("articles")
        .select(
          "id, slug, title, summary, status, verification_status, featured_image_url, official_url, verification_details, created_at",
        )
        .eq("admin_note", STUDIO_MARK)
        .order("created_at", { ascending: false })
        .limit(60);
      if (error) throw error;
      return (data ?? []) as Draft[];
    },
  });

  const run = async (count: number) => {
    for (let i = 0; i < count; i++) {
      setProgress(`Investigando y escribiendo artículo ${i + 1} de ${count}…`);
      try {
        const r = await generate({ data: { topic: topic.trim() || undefined, withImage } });
        toast.success(`Borrador creado: ${r.title}`);
        if (r.imageError) toast.error(`Imagen no generada: ${r.imageError}`);
      } catch (e) {
        toast.error((e as Error).message);
        break;
      }
      await qc.invalidateQueries({ queryKey: ["studio-drafts"] });
    }
    setProgress(null);
  };

  const setStatus = async (d: Draft, status: "published" | "archived") => {
    if (status === "published") {
      if (!d.title || !d.summary) return toast.error("Falta título o descripción.");
      if (!d.featured_image_url && !confirm("Este artículo no tiene imagen. ¿Publicar igualmente?"))
        return;
      if (
        !confirm(
          `¿Aprobar y publicar "${d.title}"? (La verificación factual quedará pendiente hasta que se contrasten evidencias).`,
        )
      )
        return;
    }
    const now = new Date().toISOString();
    // Do NOT automatically mark as verified when published. Keep factual verification separate.
    const { error } = await supabase
      .from("articles")
      .update({
        status,
        published_at: status === "published" ? now : null,
        verification_status:
          status === "archived" ? "rejected" : d.verification_status || "pending",
        updated_at: now,
      })
      .eq("id", d.id);
    if (error) toast.error(error.message);
    else
      toast.success(
        status === "published" ? "✅ Publicado (Verificación factual pendiente)" : "❌ Rechazado",
      );
    qc.invalidateQueries({ queryKey: ["studio-drafts"] });
  };

  const markFactualVerified = async (d: Draft) => {
    if (!confirm(`¿Confirmas que has contrastado las fuentes oficiales para "${d.title}"?`)) return;
    const now = new Date().toISOString();
    const { error } = await supabase
      .from("articles")
      .update({
        verification_status: "verified",
        verified_at: now,
        updated_at: now,
      })
      .eq("id", d.id);
    if (error) toast.error(error.message);
    else toast.success("🛡️ Marcado como verificado con fuentes oficiales.");
    qc.invalidateQueries({ queryKey: ["studio-drafts"] });
  };

  const remove = async (d: Draft) => {
    if (!confirm(`¿Eliminar "${d.title}"?`)) return;
    await supabase.from("article_translations").delete().eq("article_id", d.id);
    const { error } = await supabase.from("articles").delete().eq("id", d.id);
    if (error) toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["studio-drafts"] });
  };

  const regen = async (d: Draft) => {
    setBusyId(d.id);
    try {
      await regenImage({ data: { id: d.id } });
      toast.success("🖼️ Imagen regenerada y sincronizada en ambos idiomas");
    } catch (e) {
      toast.error((e as Error).message);
    }
    setBusyId(null);
    qc.invalidateQueries({ queryKey: ["studio-drafts"] });
  };

  const pending = (drafts.data ?? []).filter((d) => d.status === "draft");
  const done = (drafts.data ?? []).filter((d) => d.status !== "draft");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold">AI Editorial Studio</h1>
        <p className="text-sm text-muted-foreground">
          Investiga y crea artículos en español e inglés con Google Gemini. Todo se guarda como
          borrador: nada se publica sin tu aprobación.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Generar artículos</CardTitle>
          <CardDescription>
            Deja el tema vacío para que la IA proponga temas útiles. Cada artículo usa tu cuota de
            Gemini (búsqueda + imagen), que puede tener límites o cargos según tu cuenta de Google.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Tema específico (opcional), ej. Fechas de FAFSA 2027"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            disabled={!!progress}
          />
          <label className="flex items-center gap-3 text-sm">
            <Switch checked={withImage} onCheckedChange={setWithImage} disabled={!!progress} />
            Generar imagen original para la tarjeta
          </label>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => run(3)} disabled={!!progress}>
              ✨ Generar 3 artículos con IA
            </Button>
            <Button variant="outline" onClick={() => run(1)} disabled={!!progress}>
              Generar 1 artículo
            </Button>
          </div>
          {progress ? <p className="text-sm font-semibold text-primary">{progress}</p> : null}
        </CardContent>
      </Card>

      <section className="space-y-3">
        <h2 className="text-lg font-bold">Artículos pendientes de aprobación ({pending.length})</h2>
        {pending.length === 0 ? (
          <p className="text-sm text-muted-foreground">No hay borradores pendientes.</p>
        ) : null}
        {pending.map((d) => (
          <DraftCard
            key={d.id}
            d={d}
            busy={busyId === d.id}
            onApprove={() => setStatus(d, "published")}
            onReject={() => setStatus(d, "archived")}
            onDelete={() => remove(d)}
            onRegen={() => regen(d)}
            onVerifyFactual={() => markFactualVerified(d)}
          />
        ))}
      </section>

      {done.length ? (
        <section className="space-y-2">
          <h2 className="text-lg font-bold">Historial</h2>
          {done.map((d) => (
            <div
              key={d.id}
              className="flex items-center justify-between rounded-xl border border-border p-3 text-sm gap-2"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="truncate font-medium">{d.title}</span>
                {d.verification_status === "verified" ? (
                  <Badge
                    variant="outline"
                    className="border-emerald-500 text-emerald-700 bg-emerald-50 shrink-0 text-[10px]"
                  >
                    🛡️ Verificado oficial
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="border-amber-400 text-amber-700 bg-amber-50 shrink-0 text-[10px]"
                  >
                    ⚠️ Verificación factual pendiente
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {d.status === "published" && d.verification_status !== "verified" ? (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs"
                    onClick={() => markFactualVerified(d)}
                  >
                    Confirmar verificación
                  </Button>
                ) : null}
                <Badge variant={d.status === "published" ? "default" : "secondary"}>
                  {d.status === "published" ? "Publicado" : "Rechazado"}
                </Badge>
              </div>
            </div>
          ))}
        </section>
      ) : null}
    </div>
  );
}

function DraftCard({
  d,
  busy,
  onApprove,
  onReject,
  onDelete,
  onRegen,
  onVerifyFactual,
}: {
  d: Draft;
  busy: boolean;
  onApprove: () => void;
  onReject: () => void;
  onDelete: () => void;
  onRegen: () => void;
  onVerifyFactual: () => void;
}) {
  const sources = (d.verification_details ?? "").split("\n").filter(Boolean);
  return (
    <Card>
      <CardContent className="flex flex-col gap-4 p-4 sm:flex-row">
        <div className="aspect-video w-full shrink-0 overflow-hidden rounded-xl bg-muted sm:w-56">
          {d.featured_image_url ? (
            <img src={d.featured_image_url} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
              Sin imagen
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-bold leading-snug">{d.title}</h3>
            {d.verification_status === "verified" ? (
              <Badge
                variant="outline"
                className="border-emerald-500 text-emerald-700 bg-emerald-50 text-[10px]"
              >
                🛡️ Verificado con fuentes oficiales
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="border-amber-400 text-amber-700 bg-amber-50 text-[10px]"
              >
                ⚠️ Verificación factual pendiente
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{d.summary}</p>
          <div className="text-xs text-muted-foreground space-y-1">
            <p>
              {sources.length} datos/fuentes de auditoría
              {d.official_url ? (
                <>
                  {" · "}
                  <a
                    href={d.official_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline font-medium"
                  >
                    Enlace de consulta declarado
                  </a>
                </>
              ) : null}
            </p>
            {d.verification_details ? (
              <pre className="text-[10px] bg-muted/40 p-2 rounded-lg font-mono text-muted-foreground whitespace-pre-wrap max-h-24 overflow-y-auto">
                {d.verification_details}
              </pre>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            <Button size="sm" onClick={onApprove}>
              ✅ Aprobar y publicar
            </Button>
            {d.verification_status !== "verified" ? (
              <Button size="sm" variant="secondary" onClick={onVerifyFactual}>
                🛡️ Confirmar verificación de fuentes
              </Button>
            ) : null}
            <Button size="sm" variant="outline" asChild>
              <Link to="/admin/articulos" search={{ edit: d.id }}>
                ✏️ Editar
              </Link>
            </Button>
            <Button size="sm" variant="outline" onClick={onRegen} disabled={busy}>
              {busy ? "Generando…" : "🖼️ Regenerar imagen"}
            </Button>
            <Button size="sm" variant="outline" asChild>
              <a href={`/articles/${d.slug}?preview=1`} target="_blank" rel="noopener noreferrer">
                👁️ Vista previa
              </a>
            </Button>
            <Button size="sm" variant="outline" onClick={onReject}>
              ❌ Rechazar
            </Button>
            <Button size="sm" variant="ghost" onClick={onDelete}>
              🗑️ Eliminar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
