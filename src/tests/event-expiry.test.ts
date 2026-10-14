import { describe, expect, it } from "vitest";
import { chicagoToday, isEventFinished } from "@/lib/event-expiry";

describe("event expiry", () => {
  it("hides an event whose end date has passed", () => {
    expect(isEventFinished({ start_date: "2026-10-01", end_date: "2026-10-13" }, "2026-10-14")).toBe(true);
  });
  it("keeps an event on its last day", () => {
    expect(isEventFinished({ start_date: "2026-10-10", end_date: "2026-10-14T23:59:59+00" }, "2026-10-14")).toBe(false);
  });
  it("uses the start date when there is no end date", () => {
    expect(isEventFinished({ start_date: "2026-10-13", end_date: null }, "2026-10-14")).toBe(true);
  });
  it("uses Des Moines time, not UTC", () => {
    // 03:00 UTC on Oct 15 is still Oct 14 in Chicago
    expect(chicagoToday(new Date("2026-10-15T03:00:00Z"))).toBe("2026-10-14");
  });
});
