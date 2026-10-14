/** Today's date (YYYY-MM-DD) in the district's timezone (Des Moines, America/Chicago). */
export function chicagoToday(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Chicago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

/**
 * An event is finished once its last day (end date, or start date when it has
 * no end) is before today in Des Moines. Finished events are hidden publicly.
 */
export function isEventFinished(
  e: { start_date?: string | null; end_date?: string | null; starts_at?: string | null },
  today: string = chicagoToday(),
): boolean {
  const last = String(e.end_date || e.start_date || e.starts_at || "").slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(last)) return false;
  return last < today;
}
