import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const removeImageBackgroundFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        imageUrl: z.string().optional(),
        imageBase64: z.string().optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { data: canManage } = await context.supabase.rpc("can_manage_content");
    if (!canManage) {
      throw new Error("No tienes autorización para gestionar contenido multimedia.");
    }

    const { executeRemoveBg } = await import("./remove-bg.server");
    const result = await executeRemoveBg(data);

    if (!result.success) {
      throw new Error(result.error || "No se pudo remover el fondo de la imagen.");
    }

    return { url: result.url! };
  });
