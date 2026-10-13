import { supabase } from "@/lib/db";

export type AdsSettings = {
  enabled: boolean;
  client_id: string;
  /** Slot IDs from AdSense ("Bloques de anuncios"). Empty = that space stays hidden. */
  slot_article_bottom: string;
  slot_home: string;
  show_in_articles: boolean;
  show_in_home: boolean;
};

export const DEFAULT_ADS: AdsSettings = {
  enabled: false,
  client_id: "ca-pub-4360884520548274",
  slot_article_bottom: "",
  slot_home: "",
  show_in_articles: true,
  show_in_home: true,
};

export const ADS_SETTINGS_KEY = "ads_settings";

export async function fetchAdsSettings(): Promise<AdsSettings> {
  try {
    const { data, error } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", ADS_SETTINGS_KEY)
      .maybeSingle();
    if (error || !data?.value) return DEFAULT_ADS;
    return { ...DEFAULT_ADS, ...(data.value as Partial<AdsSettings>) };
  } catch {
    return DEFAULT_ADS;
  }
}

export async function saveAdsSettings(value: AdsSettings) {
  const updated_at = new Date().toISOString();
  const { error } = await supabase
    .from("site_settings")
    .upsert({ key: ADS_SETTINGS_KEY, value, updated_at }, { onConflict: "key" });
  if (error) throw error;
  return value;
}

export const isValidClientId = (id: string) => /^ca-pub-\d{10,20}$/.test(id.trim());
