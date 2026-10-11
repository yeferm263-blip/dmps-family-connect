// Loosely typed Supabase client: this imported app's queries reference tables/columns
// beyond the generated schema types, so we expose the client without table typing.
import type { SupabaseClient } from "@supabase/supabase-js";
import { supabase as typedClient } from "@/integrations/supabase/client";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const supabase = typedClient as unknown as SupabaseClient<any, "public", any>;
const rawUrl =
  (typeof import.meta !== "undefined" && import.meta.env
    ? import.meta.env.VITE_SUPABASE_URL
    : undefined) ||
  (typeof process !== "undefined" && process.env ? process.env.SUPABASE_URL : undefined);

const rawKey =
  (typeof import.meta !== "undefined" && import.meta.env
    ? import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
    : undefined) ||
  (typeof process !== "undefined" && process.env
    ? process.env.SUPABASE_PUBLISHABLE_KEY
    : undefined);

export function isSupabaseConfigured(): boolean {
  return Boolean(
    rawUrl &&
    rawKey &&
    !rawUrl.includes("placeholder") &&
    rawUrl.trim() !== "" &&
    rawKey.trim() !== "",
  );
}
export function hasSupabaseRealtimeKey(): boolean {
  return isSupabaseConfigured();
}
