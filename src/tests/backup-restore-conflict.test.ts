import { describe, expect, it } from "vitest";
import { chunkBySize, RESTORE_CONFLICT } from "@/lib/public-content-reset";

describe("backup restore", () => {
  it("restores help settings by their name, not by id", () => {
    expect(RESTORE_CONFLICT.help_settings).toBe("setting_key");
  });

  it("never puts more payload than the limit in one batch", () => {
    const rows = [{ a: "x".repeat(150) }, { a: "y".repeat(150) }, { a: "z".repeat(10) }];
    expect(chunkBySize(rows, 50, 200).map((p) => p.length)).toEqual([1, 2]);
  });
});
