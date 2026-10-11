import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/creador-ia")({
  head: () => ({
    meta: [{ title: "Redirigiendo a AI Editorial Studio..." }],
  }),
  component: () => <Navigate to="/admin/estudio-editorial" replace />,
});
