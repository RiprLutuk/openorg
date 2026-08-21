import { describe, expect, test } from "bun:test";
import { toSlug } from "./slug";

describe("toSlug", () => {
  test("creates stable, URL-safe slugs", () => {
    expect(toSlug("  Aksi Bersama: Untuk Semua!  ")).toBe(
      "aksi-bersama-untuk-semua",
    );
  });

  test("normalizes accented characters", () => {
    expect(toSlug("Café & Komunitas")).toBe("cafe-komunitas");
  });
});
