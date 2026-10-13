import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "@tanstack/react-router";
import { fetchAdsSettings, isValidClientId } from "@/lib/ads";

export const adsQuery = { queryKey: ["ads-settings"], queryFn: fetchAdsSettings, staleTime: 5 * 60 * 1000 };

/** Loads the AdSense script once, only when ads are switched on and never in admin pages. */
export function AdsLoader() {
  const { data } = useQuery(adsQuery);
  const { pathname } = useLocation();
  useEffect(() => {
    if (!data?.enabled || !isValidClientId(data.client_id) || pathname.startsWith("/admin")) return;
    if (document.getElementById("adsbygoogle-js")) return;
    const s = document.createElement("script");
    s.id = "adsbygoogle-js";
    s.async = true;
    s.crossOrigin = "anonymous";
    s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${data.client_id.trim()}`;
    document.head.appendChild(s);
  }, [data, pathname]);
  return null;
}

/** Fixed, in-flow ad space. Never floating, never over buttons. Hidden when ads are off. */
export function AdSlot({ placement }: { placement: "article" | "home" }) {
  const { data } = useQuery(adsQuery);
  const ref = useRef<HTMLModElement>(null);
  const slot = placement === "article" ? data?.slot_article_bottom : data?.slot_home;
  const allowed = placement === "article" ? data?.show_in_articles : data?.show_in_home;
  const active = !!data?.enabled && !!allowed && !!slot && isValidClientId(data.client_id);

  useEffect(() => {
    if (!active || !ref.current || ref.current.dataset.adsbygoogleStatus) return;
    try {
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch {
      /* ad blockers etc. */
    }
  }, [active, slot]);

  if (!active) return null;
  return (
    <aside
      aria-label="Publicidad"
      className="relative isolate my-10 overflow-hidden rounded-2xl border border-border bg-muted/30 p-3"
    >
      <p className="mb-2 text-center text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        Publicidad
      </p>
      <div className="flex min-h-[250px] w-full items-center justify-center">
        <ins
          ref={ref}
          className="adsbygoogle block w-full"
          style={{ display: "block", minHeight: 250 }}
          data-ad-client={data!.client_id.trim()}
          data-ad-slot={slot}
          data-ad-format="horizontal"
          data-full-width-responsive="false"
        />
      </div>
    </aside>
  );
}
