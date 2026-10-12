import { createFileRoute } from "@tanstack/react-router";
import fs from "node:fs";
import path from "node:path";

let dbCache: Record<string, any> | null = null;

function getDb(): Record<string, any> {
  if (dbCache) return dbCache;
  try {
    const dbPath = path.resolve(process.cwd(), "data/persistent_db.json");
    if (fs.existsSync(dbPath)) {
      const raw = fs.readFileSync(dbPath, "utf-8");
      dbCache = JSON.parse(raw);
      return dbCache || {};
    }
  } catch (err) {
    console.error("Failed to load fallback db:", err);
  }
  return {};
}

export const Route = createFileRoute("/api/storage/$")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const splat = (params as { _splat?: string })._splat || "";
        const parts = splat.split("/").filter(Boolean);
        const target = parts[0] || "all";
        const db = getDb();

        if (target === "all") {
          return new Response(JSON.stringify({ success: true, data: db }), {
            headers: {
              "content-type": "application/json",
              "cache-control": "no-store, no-cache, must-revalidate",
            },
          });
        }

        const tableData = db[target] || [];
        return new Response(JSON.stringify({ success: true, table: target, data: tableData }), {
          headers: {
            "content-type": "application/json",
            "cache-control": "no-store, no-cache, must-revalidate",
          },
        });
      },

      POST: async ({ params }) => {
        const splat = (params as { _splat?: string })._splat || "";
        const parts = splat.split("/").filter(Boolean);
        const target = parts[0] || "bulk";

        return new Response(JSON.stringify({ success: true, table: target }), {
          headers: { "content-type": "application/json" },
        });
      },
    },
  },
});
