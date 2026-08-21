import { describe, expect, test } from "bun:test";
import { detectSupportedImage } from "./media";

describe("media signature validation", () => {
  test("detects supported image signatures", () => {
    expect(
      detectSupportedImage(
        Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
      ),
    ).toEqual({ extension: "png", mimeType: "image/png" });
    expect(
      detectSupportedImage(
        Uint8Array.from([
          0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50,
        ]),
      ),
    ).toEqual({ extension: "webp", mimeType: "image/webp" });
  });

  test("rejects non-image signatures", () => {
    expect(
      detectSupportedImage(new TextEncoder().encode("<script>")),
    ).toBeNull();
    expect(
      detectSupportedImage(Uint8Array.from([0x25, 0x50, 0x44, 0x46])),
    ).toBeNull();
  });
});
