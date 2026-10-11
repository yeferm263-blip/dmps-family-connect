import { Link } from "@tanstack/react-router";
import { Megaphone } from "lucide-react";

import { useI18n } from "@/lib/i18n";
import { localizedAnnouncement, type AnnouncementRow } from "@/lib/content";

/**
 * Thin, constantly scrolling strip with the active official notices.
 * Pure CSS animation — no extra requests or AI usage.
 */
export function AnnouncementTicker({
  announcements,
  schoolId,
}: {
  announcements: AnnouncementRow[];
  schoolId?: string;
}) {
  const { lang } = useI18n();
  const items = announcements
    .filter((a) => (a as { show_in_ticker?: boolean }).show_in_ticker === true)
    .map((a) => ({ id: a.id, ...localizedAnnouncement(a, lang, schoolId) }))
    .filter((a) => a.title);

  if (items.length === 0) return null;

  const label = lang === "es" ? "Avisos oficiales" : "Official notices";
  const row = (hidden: boolean) => (
    <ul className="ticker-row" aria-hidden={hidden || undefined}>
      {items.map((it) => (
        <li key={`${hidden ? "b" : "a"}-${it.id}`} className="flex items-center gap-2 whitespace-nowrap">
          <span className="size-1.5 rounded-full bg-destructive-foreground" aria-hidden />
          <Link to="/announcements" className="hover:underline" tabIndex={hidden ? -1 : undefined}>
            <strong className="font-semibold">{it.title}</strong>
            {it.message ? <span className="opacity-80"> — {it.message}</span> : null}
          </Link>
        </li>
      ))}
    </ul>
  );

  return (
    <div className="ticker-bar" role="region" aria-label={label}>
      <span className="ticker-label">
        <Megaphone className="size-3.5" aria-hidden />
        <span className="hidden sm:inline">{label}</span>
      </span>
      <div className="ticker-viewport">
        <div
          className="ticker-track"
          style={{ animationDuration: `${Math.max(20, items.length * 12)}s` }}
        >
          {row(false)}
          {row(true)}
        </div>
      </div>
    </div>
  );
}
