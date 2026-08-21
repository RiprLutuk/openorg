import { describe, expect, test } from "bun:test";
import { sanitizeHtml } from "./sanitize";

describe("sanitizeHtml", () => {
  test("removes executable elements and event handlers", () => {
    const dirty =
      '<p onclick="steal()">Hello</p><script>alert(1)</script><img src="x" onerror="attack()">';
    const clean = sanitizeHtml(dirty);

    expect(clean).toContain("<p>Hello</p>");
    expect(clean).not.toContain("script");
    expect(clean).not.toContain("onclick");
    expect(clean).not.toContain("onerror");
  });

  test("neutralizes javascript urls", () => {
    expect(sanitizeHtml('<a href="javascript:alert(1)">open</a>')).toBe(
      '<a href="#">open</a>',
    );
  });
});
