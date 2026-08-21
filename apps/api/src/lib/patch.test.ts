import { describe, expect, test } from "bun:test";
import { z } from "zod";
import { onlyProvided } from "./patch";

describe("PATCH field semantics", () => {
  test("does not persist schema defaults that the client did not send", () => {
    const schema = z.object({
      title: z.string(),
      status: z.enum(["draft", "published"]).default("draft"),
      featured: z.boolean().default(false),
    });
    const body = { title: "Updated title" };
    const parsed = schema.partial().parse(body);

    expect(parsed).toEqual({
      title: "Updated title",
      status: "draft",
      featured: false,
    });
    expect(onlyProvided(parsed, body)).toEqual({ title: "Updated title" });
  });
});
