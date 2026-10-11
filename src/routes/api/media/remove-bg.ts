import { createFileRoute } from "@tanstack/react-router";
import { executeRemoveBg } from "@/lib/remove-bg.server";

export const Route = createFileRoute("/api/media/remove-bg")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          // 1. Authenticate HTTP request directly
          const authHeader = request.headers.get("authorization");
          if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return new Response(
              JSON.stringify({
                success: false,
                error: "No autorizado: se requiere token de autenticación de usuario (Bearer).",
                code: "UNAUTHORIZED",
              }),
              { status: 401, headers: { "Content-Type": "application/json" } },
            );
          }

          const token = authHeader.slice(7).trim();
          if (!token) {
            return new Response(
              JSON.stringify({
                success: false,
                error: "No autorizado: token vacío.",
                code: "UNAUTHORIZED",
              }),
              { status: 401, headers: { "Content-Type": "application/json" } },
            );
          }

          const supabaseUrl = process.env.SUPABASE_URL;
          const supabaseKey =
            process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

          if (!supabaseUrl || !supabaseKey) {
            return new Response(
              JSON.stringify({
                success: false,
                error: "Servicio de autenticación no configurado en el servidor.",
                code: "AUTH_UNAVAILABLE",
              }),
              { status: 401, headers: { "Content-Type": "application/json" } },
            );
          }

          const { createClient } = await import("@supabase/supabase-js");
          const userClient = createClient(supabaseUrl, supabaseKey, {
            auth: { persistSession: false, autoRefreshToken: false },
            global: { headers: { Authorization: `Bearer ${token}` } },
          });

          const { data: userData, error: userError } = await userClient.auth.getUser(token);
          if (userError || !userData?.user) {
            return new Response(
              JSON.stringify({
                success: false,
                error: "No autorizado: sesión de usuario inválida o expirada.",
                code: "UNAUTHORIZED",
              }),
              { status: 401, headers: { "Content-Type": "application/json" } },
            );
          }

          // 2. Authorize user permissions: must have can_manage_content
          const { data: canManage } = await userClient.rpc("can_manage_content");
          if (!canManage) {
            return new Response(
              JSON.stringify({
                success: false,
                error:
                  "Acceso denegado: no tienes permisos para gestionar contenido multimedia ni consumir la API de remove.bg.",
                code: "FORBIDDEN",
              }),
              { status: 403, headers: { "Content-Type": "application/json" } },
            );
          }

          // 3. Validate request size
          const contentLength = request.headers.get("content-length");
          if (contentLength && parseInt(contentLength, 10) > 18 * 1024 * 1024) {
            return new Response(
              JSON.stringify({
                success: false,
                error: "El cuerpo de la petición excede el tamaño máximo permitido (18 MB).",
                code: "PAYLOAD_TOO_LARGE",
              }),
              { status: 413, headers: { "Content-Type": "application/json" } },
            );
          }

          const body = (await request.json().catch(() => ({}))) as {
            imageUrl?: string;
            imageBase64?: string;
          };

          const result = await executeRemoveBg({
            imageUrl: body.imageUrl,
            imageBase64: body.imageBase64,
          });

          if (!result.success) {
            const httpStatus =
              result.code === "PAYLOAD_TOO_LARGE"
                ? 413
                : result.code === "HTTP_402"
                  ? 402
                  : result.code === "HTTP_403"
                    ? 403
                    : 400;

            return new Response(
              JSON.stringify({
                success: false,
                error: result.error,
                code: result.code,
              }),
              {
                status: httpStatus,
                headers: { "Content-Type": "application/json" },
              },
            );
          }

          return new Response(
            JSON.stringify({
              success: true,
              url: result.url,
            }),
            {
              status: 200,
              headers: { "Content-Type": "application/json" },
            },
          );
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err);
          return new Response(
            JSON.stringify({
              success: false,
              error: `Error interno del servidor: ${msg}`,
            }),
            {
              status: 500,
              headers: { "Content-Type": "application/json" },
            },
          );
        }
      },
    },
  },
});
