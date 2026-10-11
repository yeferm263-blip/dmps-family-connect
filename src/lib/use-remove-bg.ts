import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/db";

export interface RemoveBgHookResult {
  isRemovingBg: boolean;
  removeBg: (imageSource: string) => Promise<string | null>;
}

export function useRemoveBg(): RemoveBgHookResult {
  const [isRemovingBg, setIsRemovingBg] = useState(false);

  const removeBg = async (imageSource: string): Promise<string | null> => {
    if (!imageSource || !imageSource.trim()) {
      toast.error("No hay ninguna imagen cargada para quitar el fondo.");
      return null;
    }

    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token;

    if (!token) {
      toast.error(
        "Debes iniciar sesión con una cuenta de administrador o editor para quitar fondos de imágenes.",
      );
      return null;
    }

    setIsRemovingBg(true);
    const toastId = toast.loading("🪄 Eliminando fondo con remove.bg...");

    try {
      const payload: { imageUrl?: string; imageBase64?: string } = {};
      if (imageSource.startsWith("data:image/")) {
        payload.imageBase64 = imageSource;
      } else {
        payload.imageUrl = imageSource;
      }

      const res = await fetch("/api/media/remove-bg", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = (await res.json().catch(() => ({}))) as {
        success?: boolean;
        url?: string;
        error?: string;
      };

      if (!res.ok || !data.success || !data.url) {
        let errorMsg =
          data.error || "No se pudo eliminar el fondo. Se mantiene la imagen original.";
        if (res.status === 401) {
          errorMsg = "Tu sesión ha expirado o no es válida. Inicia sesión nuevamente.";
        } else if (res.status === 403) {
          errorMsg = "No tienes permisos de contenido para usar remove.bg.";
        }
        toast.error(errorMsg, { id: toastId });
        return null;
      }

      toast.success("¡Fondo eliminado con éxito (Transparente)!", { id: toastId });
      return data.url;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(`Error al procesar la imagen: ${msg}`, { id: toastId });
      return null;
    } finally {
      setIsRemovingBg(false);
    }
  };

  return {
    isRemovingBg,
    removeBg,
  };
}
