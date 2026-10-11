/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type JSZip from "jszip";
import { parseBackupFile, type PublicContentBackup } from "@/lib/public-content-reset";
import { readBackupZip, restoreFullBackup } from "@/lib/backup-zip";

export function RestoreBackupCard() {
  const queryClient = useQueryClient();
  const [backup, setBackup] = useState<PublicContentBackup | null>(null);
  const [zip, setZip] = useState<JSZip | null>(null);
  const [fileName, setFileName] = useState("");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);

  const onFile = async (file?: File) => {
    if (!file) return;
    try {
      if (file.name.toLowerCase().endsWith(".zip")) {
        const r = await readBackupZip(file);
        setBackup(r.backup);
        setZip(r.zip);
      } else {
        setBackup(parseBackupFile(await file.text()));
        setZip(null);
      }
      setFileName(file.name);
    } catch (e: any) {
      setBackup(null);
      toast.error(e?.message || "No se pudo leer el archivo.");
    }
  };

  const total = backup
    ? Object.values(backup.data || {}).reduce((n: number, rows: any) => n + (rows?.length || 0), 0)
    : 0;

  const runRestore = async () => {
    if (!backup) return;
    setConfirmOpen(false);
    setBusy(true);
    try {
      const res = await restoreFullBackup(backup, zip, setProgress);
      await queryClient.invalidateQueries();
      if (res.success) {
        toast.success("Contenido restaurado", {
          description: `${res.restored} registros y ${res.reuploaded} imágenes restaurados, ${res.removed} eliminados.`,
        });
      } else {
        toast.error("Restauración con errores", { description: res.errors.slice(0, 3).join(" · ") });
      }
    } catch (e: any) {
      toast.error(e?.message || "Error al restaurar.");
    } finally {
      setBusy(false);
      setProgress("");
    }
  };

  return (
    <Card className="rounded-3xl border border-border bg-card p-6 shadow-soft space-y-4">
      <div>
        <h2 className="text-xl font-bold text-foreground">Restaurar desde un respaldo</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Sube un archivo de respaldo (.zip o .json) descargado antes. El contenido público volverá a quedar
          exactamente como estaba en ese momento.
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
        <Input
          type="file"
          accept=".zip,application/zip,application/json,.json"
          disabled={busy}
          onChange={(e) => onFile(e.target.files?.[0])}
          className="rounded-xl text-xs"
        />
        <Button
          type="button"
          disabled={!backup || busy}
          onClick={() => setConfirmOpen(true)}
          className="rounded-xl text-xs font-bold gap-2 min-w-44"
        >
          <RefreshCw className={`size-4 ${busy ? "animate-spin" : ""}`} />
          {busy ? "Restaurando…" : "Restaurar respaldo"}
        </Button>
      </div>
      {backup && (
        <p className="text-xs text-muted-foreground">
          Archivo: <strong>{fileName}</strong> · {total} registros
          {backup.timestamp ? ` · creado ${new Date(backup.timestamp).toLocaleString()}` : ""}
        </p>
      )}
      {busy && progress && <p className="text-xs text-primary">{progress}</p>}

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Restaurar este respaldo?</DialogTitle>
            <DialogDescription>
              El contenido actual se reemplazará por el del respaldo. Lo creado después del respaldo
              se eliminará.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={runRestore}>Sí, restaurar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
