import type { InferSelectModel } from "drizzle-orm";
import { and, eq } from "drizzle-orm";
import fp from "fastify-plugin";
import { config } from "../config";
import { db } from "../db/client";
import { domains, organizations } from "../db/schema";
import { AppError } from "../lib/errors";

export default fp(async (app) => {
  app.decorateRequest("organization");

  app.addHook("onRequest", async (request) => {
    if (
      request.url.startsWith("/health") ||
      request.url.startsWith("/documentation")
    )
      return;

    const explicitSlug = request.headers["x-organization"];
    const hostname = request.hostname.split(":")[0]?.toLowerCase();
    let organization: InferSelectModel<typeof organizations> | undefined;

    if (typeof explicitSlug === "string" && explicitSlug.length > 0) {
      [organization] = await db
        .select()
        .from(organizations)
        .where(
          and(
            eq(organizations.slug, explicitSlug),
            eq(organizations.isActive, true),
          ),
        )
        .limit(1);
    } else if (hostname && !["localhost", "127.0.0.1"].includes(hostname)) {
      [organization] = await db
        .select({ organization: organizations })
        .from(domains)
        .innerJoin(organizations, eq(domains.organizationId, organizations.id))
        .where(
          and(eq(domains.hostname, hostname), eq(organizations.isActive, true)),
        )
        .limit(1)
        .then((rows) => rows.map((row) => row.organization));
    }

    if (!organization) {
      [organization] = await db
        .select()
        .from(organizations)
        .where(
          and(
            eq(organizations.slug, config.DEFAULT_ORGANIZATION_SLUG),
            eq(organizations.isActive, true),
          ),
        )
        .limit(1);
    }
    if (!organization)
      throw new AppError(
        404,
        "ORGANIZATION_NOT_FOUND",
        "No organization is configured for this host.",
      );
    request.organization = organization;
  });
});
