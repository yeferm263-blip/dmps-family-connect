import fs from "node:fs";
import path from "node:path";

// When invoked directly in production (Cloud Run / AI Studio runner):
const isMain =
  Boolean(process.argv[1]) &&
  (path.resolve(process.argv[1]) === path.resolve(import.meta.filename ?? "") ||
    process.argv[1].endsWith("/server.ts") ||
    process.argv[1].endsWith("\\server.ts"));

if (isMain) {
  const prodServer = path.resolve(process.cwd(), ".output/server/index.mjs");
  if (!fs.existsSync(prodServer)) {
    console.log("Production build not found. Running build...");
    const { execSync } = await import("node:child_process");
    execSync("npm run build", { stdio: "inherit" });
  }
  await import(prodServer);
}

// Export default server handler for TanStack Start / Nitro bundling
type FetchHandler = { fetch: (req: Request, env: unknown, ctx: unknown) => Promise<Response> | Response };
let cachedHandler: FetchHandler | null = null;

async function getHandler(): Promise<FetchHandler> {
  if (!cachedHandler) {
    const mod = await import("./src/server");
    cachedHandler = (mod.default ?? mod) as FetchHandler;
  }
  return cachedHandler;
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    const handler = await getHandler();
    return handler.fetch(request, env, ctx);
  },
};
