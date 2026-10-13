import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DEFAULT_ADS, fetchAdsSettings, isValidClientId, saveAdsSettings, type AdsSettings } from "@/lib/ads";

export const Route = createFileRoute("/admin/publicidad")({
  head: () => ({ meta: [{ title: "Publicidad | Admin DMPS" }] }),
  component: AdsAdminPage,
});

function AdsAdminPage() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["ads-settings"], queryFn: fetchAdsSettings });
  const [form, setForm] = useState<AdsSettings>(DEFAULT_ADS);
  const [saving, setSaving] = useState(false);
  useEffect(() => { if (data) setForm(data); }, [data]);
  const set = <K extends keyof AdsSettings>(k: K, v: AdsSettings[K]) => setForm((p) => ({ ...p, [k]: v }));

  async function save() {
    if (!isValidClientId(form.client_id)) return toast.error("El ID debe verse así: ca-pub-1234567890");
    setSaving(true);
    try {
      await saveAdsSettings(form);
      await qc.invalidateQueries({ queryKey: ["ads-settings"] });
      toast.success(form.enabled ? "Publicidad activada." : "Publicidad desactivada.");
    } catch (e) {
      toast.error(`No se pudo guardar: ${(e as Error).message}`);
    } finally {
      setSaving(false);
    }
  }

  const Check = ({ k, label }: { k: "enabled" | "show_in_articles" | "show_in_home"; label: string }) => (
    <label className="flex min-h-11 items-center gap-3 font-semibold">
      <input type="checkbox" checked={form[k]} onChange={(e) => set(k, e.target.checked)} className="size-5" />
      {label}
    </label>
  );

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-3xl font-extrabold">Publicidad (Google AdSense)</h1>
        <p className="text-muted-foreground">
          Los anuncios solo salen en los espacios fijos que actives aquí. Nunca flotan ni tapan botones, y no
          aparecen en el panel de administración.
        </p>
      </header>
      <div className="surface-card space-y-5 p-5">
        <Check k="enabled" label="Activar publicidad en todo el sitio" />
        <div className="space-y-2">
          <Label htmlFor="ads-client">ID de editor</Label>
          <Input id="ads-client" value={form.client_id} onChange={(e) => set("client_id", e.target.value)} />
        </div>
        <hr className="border-border" />
        <Check k="show_in_articles" label="Espacio al final de cada artículo" />
        <div className="space-y-2">
          <Label htmlFor="slot-a">Código del bloque (data-ad-slot) para artículos</Label>
          <Input id="slot-a" placeholder="ej. 1234567890" value={form.slot_article_bottom} onChange={(e) => set("slot_article_bottom", e.target.value.trim())} />
        </div>
        <Check k="show_in_home" label="Espacio en la página de inicio" />
        <div className="space-y-2">
          <Label htmlFor="slot-h">Código del bloque (data-ad-slot) para inicio</Label>
          <Input id="slot-h" placeholder="ej. 1234567890" value={form.slot_home} onChange={(e) => set("slot_home", e.target.value.trim())} />
        </div>
        <p className="text-sm text-muted-foreground">
          Recomendado en AdSense: desactiva "Anuncios automáticos", crea "Bloques de anuncios de display" y bloquea
          categorías sensibles en el Centro de revisión de anuncios. Un espacio sin código queda oculto.
        </p>
        <Button onClick={save} disabled={saving}>{saving ? "Guardando..." : "Guardar"}</Button>
      </div>
    </div>
  );
}
