import { pageSectionsSchema, paginationSchema } from "@openorg/contracts";
import { and, asc, desc, eq, ilike, sql } from "drizzle-orm";
import type { FastifyPluginAsync, FastifyRequest } from "fastify";
import { z } from "zod";
import { db } from "../db/client";
import {
  auditLogs,
  contactSubmissions,
  contents,
  events,
  memberApplications,
  members,
  organizationUnits,
  pages,
  siteSettings,
} from "../db/schema";
import { AppError } from "../lib/errors";
import { sanitizeHtml } from "../lib/sanitize";
import { toSlug } from "../lib/slug";

const idParams = z.object({ id: z.string().uuid() });
const publicationStatusInput = z.enum([
  "draft",
  "review",
  "scheduled",
  "published",
  "archived",
]);
const memberStatusInput = z.enum([
  "applicant",
  "pending",
  "active",
  "inactive",
  "rejected",
]);
const submissionStatusInput = z.enum([
  "new",
  "in_progress",
  "resolved",
  "spam",
]);

const pageInput = z.object({
  title: z.string().trim().min(1).max(180),
  slug: z.string().trim().max(160).optional(),
  excerpt: z.string().trim().max(1000).nullable().optional(),
  sections: pageSectionsSchema.default([]),
  status: publicationStatusInput.default("draft"),
  isHomepage: z.boolean().default(false),
  seo: z.record(z.string(), z.unknown()).default({}),
});

const contentInput = z.object({
  title: z.string().trim().min(1).max(200),
  slug: z.string().trim().max(180).optional(),
  type: z.string().trim().min(1).max(40).default("post"),
  excerpt: z.string().trim().max(1000).nullable().optional(),
  body: z.string().default(""),
  coverUrl: z.string().url().nullable().optional(),
  authorName: z.string().trim().max(120).nullable().optional(),
  sourceUrl: z.string().url().nullable().optional(),
  status: publicationStatusInput.default("draft"),
  categoryId: z.string().uuid().nullable().optional(),
  seo: z.record(z.string(), z.unknown()).default({}),
});

const eventInput = z.object({
  title: z.string().trim().min(1).max(200),
  slug: z.string().trim().max(180).optional(),
  description: z.string().trim().max(10_000).nullable().optional(),
  coverUrl: z.string().url().nullable().optional(),
  locationName: z.string().trim().max(200).nullable().optional(),
  address: z.string().trim().max(1000).nullable().optional(),
  meetingUrl: z.string().url().nullable().optional(),
  registrationUrl: z.string().url().nullable().optional(),
  startsAt: z
    .string()
    .datetime()
    .transform((val) => new Date(val)),
  endsAt: z
    .string()
    .datetime()
    .transform((val) => new Date(val))
    .nullable()
    .optional(),
  capacity: z.number().int().min(1).max(1_000_000).nullable().optional(),
  status: publicationStatusInput.default("published"),
  seo: z.record(z.string(), z.unknown()).default({}),
});

const memberInput = z.object({
  memberNumber: z.string().trim().min(1).max(60),
  name: z.string().trim().min(1).max(160),
  email: z.string().trim().toLowerCase().email().nullable().optional(),
  phone: z.string().trim().max(40).nullable().optional(),
  unitId: z.string().uuid().nullable().optional(),
  status: memberStatusInput.default("active"),
  avatarUrl: z.string().url().nullable().optional(),
  metadata: z.record(z.string(), z.unknown()).default({}),
});

const memberUpdateInput = memberInput.partial();

function sanitizePageSections(sections: unknown) {
  const parsed = pageSectionsSchema.parse(sections);
  return parsed.map((section) =>
    section.type === "richText"
      ? { ...section, html: sanitizeHtml(section.html) }
      : section,
  );
}

function onlyProvided<T extends object>(parsed: T, raw: unknown): Partial<T> {
  if (!raw || typeof raw !== "object") return parsed;
  const rawObj = raw as Record<string, unknown>;
  const result: Partial<T> = {};
  for (const key of Object.keys(parsed) as Array<keyof T>) {
    if (key in rawObj) {
      result[key] = parsed[key];
    }
  }
  return result;
}

async function audit(
  request: FastifyRequest,
  action: string,
  resourceType: string,
  resourceId: string | undefined,
  before: unknown,
  after: unknown,
) {
  await db.insert(auditLogs).values({
    actorId: request.currentUser?.id,
    action,
    resourceType,
    resourceId,
    before: before as Record<string, unknown> | undefined,
    after: after as Record<string, unknown> | undefined,
    ipAddress: request.ip,
    userAgent: request.headers["user-agent"]?.slice(0, 500),
    requestId: request.id,
  });
}

export const adminRoutes: FastifyPluginAsync = async (app) => {
  app.get(
    "/organization",
    { preHandler: app.authorize("settings.read") },
    async () => {
      const [settings] = await db
        .select()
        .from(siteSettings)
        .where(eq(siteSettings.id, "default"))
        .limit(1);
      return {
        data: settings ?? {
          id: "default",
          name: "OpenOrg Association",
          slug: "openorg",
          kind: "association",
          tagline: "Platform Resmi Organisasi",
          description:
            "Platform terpadu keanggotaan, tata kelola organisasi, kredit akademi SKP/CPD, dan verifikasi kredensial.",
        },
      };
    },
  );

  app.patch(
    "/organization",
    { preHandler: app.authorize("settings.write") },
    async (request) => {
      const input = z
        .object({
          name: z.string().min(2).max(160).optional(),
          tagline: z.string().max(240).nullable().optional(),
          description: z.string().max(5000).nullable().optional(),
          logoUrl: z.string().url().nullable().optional(),
          faviconUrl: z.string().url().nullable().optional(),
          email: z.string().email().nullable().optional(),
          phone: z.string().max(40).nullable().optional(),
          address: z.string().max(2000).nullable().optional(),
          locale: z.string().max(12).optional(),
          timezone: z.string().max(60).optional(),
          primaryColor: z.string().optional(),
          secondaryColor: z.string().optional(),
          theme: z
            .object({
              colors: z
                .object({
                  primary: z.string().optional(),
                  secondary: z.string().optional(),
                  accent: z.string().optional(),
                  surface: z.string().optional(),
                  foreground: z.string().optional(),
                })
                .optional(),
              radius: z.string().optional(),
              fontHeading: z.string().optional(),
              fontBody: z.string().optional(),
            })
            .optional(),
          navigation: z.array(z.any()).optional(),
          footer: z.record(z.string(), z.any()).optional(),
          quickContact: z.record(z.string(), z.any()).optional(),
          socialLinks: z.array(z.any()).optional(),
        })
        .parse(request.body);

      const updateData: Record<string, unknown> = { ...input };
      if (input.theme?.colors?.primary) {
        updateData.primaryColor = input.theme.colors.primary;
      }
      if (input.theme?.colors?.secondary) {
        updateData.secondaryColor = input.theme.colors.secondary;
      }
      delete updateData.theme;

      const [updated] = await db
        .insert(siteSettings)
        .values({ id: "default", ...updateData })
        .onConflictDoUpdate({
          target: siteSettings.id,
          set: { ...updateData, updatedAt: new Date() },
        })
        .returning();

      await audit(
        request,
        "organization.update",
        "organization",
        "default",
        null,
        updated,
      );
      return { data: updated };
    },
  );

  app.get("/dashboard", { preHandler: app.authenticate }, async () => {
    const [
      pageCount,
      contentCount,
      memberCount,
      eventCount,
      inboxCount,
      applicationCount,
      recentContent,
    ] = await Promise.all([
      db.select({ value: sql<number>`count(*)::int` }).from(pages),
      db.select({ value: sql<number>`count(*)::int` }).from(contents),
      db.select({ value: sql<number>`count(*)::int` }).from(members),
      db.select({ value: sql<number>`count(*)::int` }).from(events),
      db
        .select({ value: sql<number>`count(*)::int` })
        .from(contactSubmissions)
        .where(eq(contactSubmissions.status, "new")),
      db
        .select({ value: sql<number>`count(*)::int` })
        .from(memberApplications)
        .where(eq(memberApplications.status, "pending")),
      db
        .select({
          id: contents.id,
          title: contents.title,
          type: contents.type,
          status: contents.status,
          updatedAt: contents.updatedAt,
        })
        .from(contents)
        .orderBy(desc(contents.updatedAt))
        .limit(5),
    ]);
    return {
      data: {
        counts: {
          pages: pageCount[0]?.value ?? 0,
          contents: contentCount[0]?.value ?? 0,
          members: memberCount[0]?.value ?? 0,
          events: eventCount[0]?.value ?? 0,
          inbox: inboxCount[0]?.value ?? 0,
          applications: applicationCount[0]?.value ?? 0,
        },
        recentContent,
      },
    };
  });

  app.get(
    "/pages",
    { preHandler: app.authorize("pages.read") },
    async (request) => {
      const query = paginationSchema.parse(request.query);
      const conditions = [];
      if (query.search)
        conditions.push(ilike(pages.title, `%${query.search}%`));
      const rows = await db
        .select()
        .from(pages)
        .where(conditions.length ? and(...conditions) : undefined)
        .orderBy(desc(pages.updatedAt))
        .limit(query.limit)
        .offset((query.page - 1) * query.limit);
      return { data: rows, meta: { page: query.page, limit: query.limit } };
    },
  );

  app.post(
    "/pages",
    { preHandler: app.authorize("pages.write") },
    async (request, reply) => {
      const input = pageInput.parse(request.body);
      const slug = input.slug ? toSlug(input.slug) : toSlug(input.title);
      if (!slug)
        throw new AppError(
          422,
          "INVALID_SLUG",
          "A valid page slug is required.",
        );
      const [created] = await db.transaction(async (tx) => {
        if (input.isHomepage)
          await tx
            .update(pages)
            .set({ isHomepage: false, updatedAt: new Date() })
            .where(eq(pages.isHomepage, true));
        return tx
          .insert(pages)
          .values({
            ...input,
            sections: sanitizePageSections(input.sections),
            slug,
            authorId: request.currentUser?.id,
            publishedAt: input.status === "published" ? new Date() : null,
          })
          .returning();
      });
      await audit(
        request,
        "page.create",
        "page",
        created?.id,
        undefined,
        created,
      );
      return reply.status(201).send({ data: created });
    },
  );

  app.patch(
    "/pages/:id",
    { preHandler: app.authorize("pages.write") },
    async (request) => {
      const { id } = idParams.parse(request.params);
      const input = onlyProvided(
        pageInput.partial().parse(request.body),
        request.body,
      );
      const [before] = await db
        .select()
        .from(pages)
        .where(eq(pages.id, id))
        .limit(1);
      if (!before)
        throw new AppError(404, "PAGE_NOT_FOUND", "Page was not found.");
      const values = {
        ...input,
        ...(input.sections
          ? { sections: sanitizePageSections(input.sections) }
          : {}),
        ...(input.slug ? { slug: toSlug(input.slug) } : {}),
        ...(input.status === "published" && !before.publishedAt
          ? { publishedAt: new Date() }
          : {}),
        updatedAt: new Date(),
      };
      const [updated] = await db.transaction(async (tx) => {
        if (input.isHomepage)
          await tx
            .update(pages)
            .set({ isHomepage: false, updatedAt: new Date() })
            .where(eq(pages.isHomepage, true));
        return tx.update(pages).set(values).where(eq(pages.id, id)).returning();
      });
      await audit(request, "page.update", "page", id, before, updated);
      return { data: updated };
    },
  );

  app.delete(
    "/pages/:id",
    { preHandler: app.authorize("pages.delete") },
    async (request, reply) => {
      const { id } = idParams.parse(request.params);
      const [deleted] = await db
        .delete(pages)
        .where(eq(pages.id, id))
        .returning();
      if (!deleted)
        throw new AppError(404, "PAGE_NOT_FOUND", "Page was not found.");
      await audit(request, "page.delete", "page", id, deleted, undefined);
      return reply.status(204).send();
    },
  );

  app.get(
    "/contents",
    { preHandler: app.authorize("contents.read") },
    async (request) => {
      const query = paginationSchema
        .extend({ type: z.string().max(40).optional() })
        .parse(request.query);
      const conditions = [];
      if (query.type) conditions.push(eq(contents.type, query.type));
      if (query.search)
        conditions.push(ilike(contents.title, `%${query.search}%`));
      const rows = await db
        .select()
        .from(contents)
        .where(conditions.length ? and(...conditions) : undefined)
        .orderBy(desc(contents.updatedAt))
        .limit(query.limit)
        .offset((query.page - 1) * query.limit);
      return { data: rows, meta: { page: query.page, limit: query.limit } };
    },
  );

  app.post(
    "/contents",
    { preHandler: app.authorize("contents.write") },
    async (request, reply) => {
      const input = contentInput.parse(request.body);
      const [created] = await db
        .insert(contents)
        .values({
          ...input,
          slug: toSlug(input.slug ?? input.title),
          body: sanitizeHtml(input.body),
          authorId: request.currentUser?.id,
          publishedAt: input.status === "published" ? new Date() : null,
        })
        .returning();
      await audit(
        request,
        "content.create",
        "content",
        created?.id,
        undefined,
        created,
      );
      return reply.status(201).send({ data: created });
    },
  );

  app.patch(
    "/contents/:id",
    { preHandler: app.authorize("contents.write") },
    async (request) => {
      const { id } = idParams.parse(request.params);
      const input = onlyProvided(
        contentInput.partial().parse(request.body),
        request.body,
      );
      const [before] = await db
        .select()
        .from(contents)
        .where(eq(contents.id, id))
        .limit(1);
      if (!before)
        throw new AppError(404, "CONTENT_NOT_FOUND", "Content was not found.");
      const [updated] = await db
        .update(contents)
        .set({
          ...input,
          ...(input.slug ? { slug: toSlug(input.slug) } : {}),
          ...(input.body !== undefined
            ? { body: sanitizeHtml(input.body) }
            : {}),
          ...(input.status === "published" && !before.publishedAt
            ? { publishedAt: new Date() }
            : {}),
          updatedAt: new Date(),
        })
        .where(eq(contents.id, id))
        .returning();
      await audit(request, "content.update", "content", id, before, updated);
      return { data: updated };
    },
  );

  app.delete(
    "/contents/:id",
    { preHandler: app.authorize("contents.write") },
    async (request, reply) => {
      const { id } = idParams.parse(request.params);
      const [deleted] = await db
        .delete(contents)
        .where(eq(contents.id, id))
        .returning();
      if (!deleted)
        throw new AppError(404, "CONTENT_NOT_FOUND", "Content was not found.");
      await audit(request, "content.delete", "content", id, deleted, undefined);
      return reply.status(204).send();
    },
  );

  app.get(
    "/events",
    { preHandler: app.authorize("events.read") },
    async (request) => {
      const query = paginationSchema
        .extend({ status: publicationStatusInput.optional() })
        .parse(request.query);
      const conditions = [];
      if (query.status) conditions.push(eq(events.status, query.status));
      if (query.search)
        conditions.push(ilike(events.title, `%${query.search}%`));
      const where = conditions.length ? and(...conditions) : undefined;
      const [rows, countRows] = await Promise.all([
        db
          .select()
          .from(events)
          .where(where)
          .orderBy(desc(events.startsAt))
          .limit(query.limit)
          .offset((query.page - 1) * query.limit),
        db
          .select({ count: sql<number>`count(*)::int` })
          .from(events)
          .where(where),
      ]);
      return {
        data: rows,
        meta: {
          page: query.page,
          limit: query.limit,
          total: countRows[0]?.count ?? 0,
        },
      };
    },
  );

  app.post(
    "/events",
    { preHandler: app.authorize("events.write") },
    async (request, reply) => {
      const input = eventInput.parse(request.body);
      if (input.endsAt && input.endsAt < input.startsAt)
        throw new AppError(
          422,
          "INVALID_EVENT_RANGE",
          "Event end time must be after its start time.",
        );
      const slug = toSlug(input.slug ?? input.title);
      if (!slug)
        throw new AppError(
          422,
          "INVALID_SLUG",
          "A valid event slug is required.",
        );
      const [created] = await db
        .insert(events)
        .values({
          ...input,
          slug,
          publishedAt: input.status === "published" ? new Date() : null,
        })
        .returning();
      await audit(
        request,
        "event.create",
        "event",
        created?.id,
        undefined,
        created,
      );
      return reply.status(201).send({ data: created });
    },
  );

  app.patch(
    "/events/:id",
    { preHandler: app.authorize("events.write") },
    async (request) => {
      const { id } = idParams.parse(request.params);
      const input = onlyProvided(
        eventInput.partial().parse(request.body),
        request.body,
      );
      const [before] = await db
        .select()
        .from(events)
        .where(eq(events.id, id))
        .limit(1);
      if (!before)
        throw new AppError(404, "EVENT_NOT_FOUND", "Event was not found.");
      const startsAt = input.startsAt ?? before.startsAt;
      const endsAt = input.endsAt === undefined ? before.endsAt : input.endsAt;
      if (endsAt && endsAt < startsAt)
        throw new AppError(
          422,
          "INVALID_EVENT_RANGE",
          "Event end time must be after its start time.",
        );
      const [updated] = await db
        .update(events)
        .set({
          ...input,
          ...(input.slug ? { slug: toSlug(input.slug) } : {}),
          ...(input.status === "published" && !before.publishedAt
            ? { publishedAt: new Date() }
            : {}),
          updatedAt: new Date(),
        })
        .where(eq(events.id, id))
        .returning();
      await audit(request, "event.update", "event", id, before, updated);
      return { data: updated };
    },
  );

  app.delete(
    "/events/:id",
    { preHandler: app.authorize("events.write") },
    async (request, reply) => {
      const { id } = idParams.parse(request.params);
      const [deleted] = await db
        .delete(events)
        .where(eq(events.id, id))
        .returning();
      if (!deleted)
        throw new AppError(404, "EVENT_NOT_FOUND", "Event was not found.");
      await audit(request, "event.delete", "event", id, deleted, undefined);
      return reply.status(204).send();
    },
  );

  app.get(
    "/organization-units",
    { preHandler: app.authorize("members.read") },
    async () => ({
      data: await db
        .select({
          id: organizationUnits.id,
          name: organizationUnits.name,
          type: organizationUnits.type,
          parentId: organizationUnits.parentId,
        })
        .from(organizationUnits)
        .where(eq(organizationUnits.isActive, true))
        .orderBy(asc(organizationUnits.sortOrder), asc(organizationUnits.name)),
    }),
  );

  app.get(
    "/members",
    { preHandler: app.authorize("members.read") },
    async (request) => {
      const query = paginationSchema
        .extend({ status: memberStatusInput.optional() })
        .parse(request.query);
      const conditions = [];
      if (query.status) conditions.push(eq(members.status, query.status));
      if (query.search)
        conditions.push(ilike(members.name, `%${query.search}%`));
      const where = conditions.length ? and(...conditions) : undefined;
      const [rows, countRows] = await Promise.all([
        db
          .select({
            member: members,
            unitName: organizationUnits.name,
          })
          .from(members)
          .leftJoin(organizationUnits, eq(members.unitId, organizationUnits.id))
          .where(where)
          .orderBy(asc(members.name))
          .limit(query.limit)
          .offset((query.page - 1) * query.limit),
        db
          .select({ count: sql<number>`count(*)::int` })
          .from(members)
          .where(where),
      ]);
      return {
        data: rows.map((row) => ({ ...row.member, unitName: row.unitName })),
        meta: {
          page: query.page,
          limit: query.limit,
          total: countRows[0]?.count ?? 0,
        },
      };
    },
  );

  app.post(
    "/members",
    { preHandler: app.authorize("members.write") },
    async (request, reply) => {
      const input = memberInput.parse(request.body);
      if (input.unitId) {
        const [unit] = await db
          .select({ id: organizationUnits.id })
          .from(organizationUnits)
          .where(eq(organizationUnits.id, input.unitId))
          .limit(1);
        if (!unit)
          throw new AppError(
            422,
            "INVALID_ORGANIZATION_UNIT",
            "The selected organization unit is not available.",
          );
      }
      const [created] = await db.insert(members).values(input).returning();
      await audit(
        request,
        "member.create",
        "member",
        created?.id,
        undefined,
        created,
      );
      return reply.status(201).send({ data: created });
    },
  );

  app.patch(
    "/members/:id",
    { preHandler: app.authorize("members.write") },
    async (request) => {
      const { id } = idParams.parse(request.params);
      const input = memberUpdateInput.parse(request.body);
      const [before] = await db
        .select()
        .from(members)
        .where(eq(members.id, id))
        .limit(1);
      if (!before)
        throw new AppError(404, "MEMBER_NOT_FOUND", "Member was not found.");
      if (input.unitId) {
        const [unit] = await db
          .select({ id: organizationUnits.id })
          .from(organizationUnits)
          .where(eq(organizationUnits.id, input.unitId))
          .limit(1);
        if (!unit)
          throw new AppError(
            422,
            "INVALID_ORGANIZATION_UNIT",
            "The selected organization unit is not available.",
          );
      }
      const [updated] = await db
        .update(members)
        .set({ ...input, updatedAt: new Date() })
        .where(eq(members.id, id))
        .returning();
      await audit(request, "member.update", "member", id, before, updated);
      return { data: updated };
    },
  );

  app.delete(
    "/members/:id",
    { preHandler: app.authorize("members.write") },
    async (request, reply) => {
      const { id } = idParams.parse(request.params);
      const [deleted] = await db
        .delete(members)
        .where(eq(members.id, id))
        .returning();
      if (!deleted)
        throw new AppError(404, "MEMBER_NOT_FOUND", "Member was not found.");
      await audit(request, "member.delete", "member", id, deleted, undefined);
      return reply.status(204).send();
    },
  );

  app.get(
    "/submissions",
    { preHandler: app.authorize("forms.read") },
    async (request) => {
      const query = paginationSchema
        .extend({
          status: submissionStatusInput.optional(),
        })
        .parse(request.query);
      const conditions = [];
      if (query.status)
        conditions.push(eq(contactSubmissions.status, query.status));
      if (query.search)
        conditions.push(ilike(contactSubmissions.name, `%${query.search}%`));
      const where = conditions.length ? and(...conditions) : undefined;
      const [rows, countRows] = await Promise.all([
        db
          .select()
          .from(contactSubmissions)
          .where(where)
          .orderBy(desc(contactSubmissions.createdAt))
          .limit(query.limit)
          .offset((query.page - 1) * query.limit),
        db
          .select({ count: sql<number>`count(*)::int` })
          .from(contactSubmissions)
          .where(where),
      ]);
      return {
        data: rows,
        meta: {
          page: query.page,
          limit: query.limit,
          total: countRows[0]?.count ?? 0,
        },
      };
    },
  );
};
