import { createHash } from "node:crypto";
import {
  pageSectionsSchema,
  paginationSchema,
  publicAnnouncementSchema,
  publicFooterSchema,
  publicQuickContactSchema,
  themeSchema,
} from "@openorg/contracts";
import {
  and,
  asc,
  desc,
  eq,
  gt,
  gte,
  ilike,
  isNull,
  or,
  sql,
} from "drizzle-orm";
import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { db } from "../db/client";
import {
  contents,
  events,
  formSubmissions,
  forms,
  members,
  navigationItems,
  organizationUnits,
  pages,
  positionAssignments,
  positions,
  settings,
} from "../db/schema";
import { AppError } from "../lib/errors";

const slugParams = z.object({
  slug: z
    .string()
    .min(1)
    .max(180)
    .regex(/^[a-z0-9-]+$/),
});
const contentQuery = paginationSchema.extend({
  type: z.enum(["post", "news", "campaign"]).default("post"),
});

export const publicRoutes: FastifyPluginAsync = async (app) => {
  app.get("/site", async (request) => {
    const [navigation, publicSettings] = await Promise.all([
      db
        .select()
        .from(navigationItems)
        .where(
          and(
            eq(navigationItems.organizationId, request.organization.id),
            eq(navigationItems.isVisible, true),
          ),
        )
        .orderBy(asc(navigationItems.sortOrder)),
      db
        .select()
        .from(settings)
        .where(
          and(
            eq(settings.organizationId, request.organization.id),
            eq(settings.isPublic, true),
          ),
        ),
    ]);
    const rootItems = navigation.filter((item) => !item.parentId);
    const setting = (key: string) =>
      publicSettings.find((item) => item.key === key)?.value;
    const footer = publicFooterSchema
      .catch({ links: [] })
      .parse(setting("footer"));
    const announcement = publicAnnouncementSchema
      .catch({
        enabled: false,
        eyebrow: "Announcement",
        title: "",
        message: "",
        imageUrl: null,
        actionLabel: "Learn more",
        actionUrl: "/",
        startsAt: null,
        endsAt: null,
      })
      .parse(setting("announcement"));
    const quickContact = publicQuickContactSchema
      .catch({
        enabled: false,
        label: "Contact us",
        href: "/contact",
        channel: "message",
      })
      .parse(setting("quickContact"));
    const now = Date.now();
    const announcementIsCurrent =
      announcement.enabled &&
      (!announcement.startsAt ||
        new Date(announcement.startsAt).getTime() <= now) &&
      (!announcement.endsAt || new Date(announcement.endsAt).getTime() >= now);
    return {
      data: {
        organization: {
          id: request.organization.id,
          name: request.organization.name,
          slug: request.organization.slug,
          kind: request.organization.kind,
          tagline: request.organization.tagline,
          description: request.organization.description,
          logoUrl: request.organization.logoUrl,
          faviconUrl: request.organization.faviconUrl,
          locale: request.organization.locale,
          theme: themeSchema
            .catch({
              colors: {
                primary: "#3b5bdb",
                secondary: "#182230",
                accent: "#f97066",
                surface: "#f8fafc",
                foreground: "#101828",
              },
              radius: "large",
              fontHeading: "Manrope",
              fontBody: "Inter",
            })
            .parse(request.organization.theme),
        },
        navigation: rootItems
          .filter((item) => item.location === "header")
          .map((item) => ({
            id: item.id,
            label: item.label,
            href: item.href,
            external: item.isExternal,
            children: navigation
              .filter((child) => child.parentId === item.id)
              .map((child) => ({
                label: child.label,
                href: child.href,
                external: child.isExternal,
              })),
          })),
        footer,
        announcement: announcementIsCurrent ? announcement : null,
        quickContact: quickContact.enabled ? quickContact : null,
      },
    };
  });

  app.get("/pages", async (request) => {
    const items = await db
      .select({
        title: pages.title,
        slug: pages.slug,
        excerpt: pages.excerpt,
        isHomepage: pages.isHomepage,
        seo: pages.seo,
        updatedAt: pages.updatedAt,
      })
      .from(pages)
      .where(
        and(
          eq(pages.organizationId, request.organization.id),
          eq(pages.status, "published"),
          isNull(pages.deletedAt),
        ),
      )
      .orderBy(desc(pages.publishedAt));
    return { data: items };
  });

  app.get("/pages/home", async (request) => {
    const [page] = await db
      .select()
      .from(pages)
      .where(
        and(
          eq(pages.organizationId, request.organization.id),
          eq(pages.isHomepage, true),
          eq(pages.status, "published"),
          isNull(pages.deletedAt),
        ),
      )
      .limit(1);
    if (!page)
      throw new AppError(
        404,
        "PAGE_NOT_FOUND",
        "Homepage has not been published yet.",
      );
    return {
      data: { ...page, sections: pageSectionsSchema.parse(page.sections) },
    };
  });

  app.get("/pages/:slug", async (request) => {
    const { slug } = slugParams.parse(request.params);
    const [page] = await db
      .select()
      .from(pages)
      .where(
        and(
          eq(pages.organizationId, request.organization.id),
          eq(pages.slug, slug),
          eq(pages.status, "published"),
          isNull(pages.deletedAt),
        ),
      )
      .limit(1);
    if (!page) throw new AppError(404, "PAGE_NOT_FOUND", "Page was not found.");
    return {
      data: { ...page, sections: pageSectionsSchema.parse(page.sections) },
    };
  });

  app.get("/contents", async (request) => {
    const query = contentQuery.parse(request.query);
    const conditions = [
      eq(contents.organizationId, request.organization.id),
      eq(contents.type, query.type),
      eq(contents.status, "published"),
      isNull(contents.deletedAt),
    ];
    if (query.search) {
      const searchCondition = or(
        ilike(contents.title, `%${query.search}%`),
        ilike(contents.excerpt, `%${query.search}%`),
      );
      if (searchCondition) conditions.push(searchCondition);
    }
    const offset = (query.page - 1) * query.limit;
    const [items, countRows] = await Promise.all([
      db
        .select()
        .from(contents)
        .where(and(...conditions))
        .orderBy(desc(contents.featured), desc(contents.publishedAt))
        .limit(query.limit)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(contents)
        .where(and(...conditions)),
    ]);
    return {
      data: items,
      meta: {
        page: query.page,
        limit: query.limit,
        total: countRows[0]?.count ?? 0,
      },
    };
  });

  app.get("/contents/:slug", async (request) => {
    const { slug } = slugParams.parse(request.params);
    const [content] = await db
      .select()
      .from(contents)
      .where(
        and(
          eq(contents.organizationId, request.organization.id),
          eq(contents.slug, slug),
          eq(contents.status, "published"),
          isNull(contents.deletedAt),
        ),
      )
      .limit(1);
    if (!content)
      throw new AppError(404, "CONTENT_NOT_FOUND", "Content was not found.");
    return { data: content };
  });

  app.get("/events", async (request) => {
    const query = paginationSchema
      .extend({ upcoming: z.coerce.boolean().default(true) })
      .parse(request.query);
    const conditions = [
      eq(events.organizationId, request.organization.id),
      eq(events.status, "published"),
      isNull(events.deletedAt),
    ];
    if (query.upcoming) conditions.push(gt(events.startsAt, new Date()));
    const [items, countRows] = await Promise.all([
      db
        .select()
        .from(events)
        .where(and(...conditions))
        .orderBy(query.upcoming ? asc(events.startsAt) : desc(events.startsAt))
        .limit(query.limit)
        .offset((query.page - 1) * query.limit),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(events)
        .where(and(...conditions)),
    ]);
    return {
      data: items,
      meta: {
        page: query.page,
        limit: query.limit,
        total: countRows[0]?.count ?? 0,
      },
    };
  });

  app.get("/events/:slug", async (request) => {
    const { slug } = slugParams.parse(request.params);
    const [event] = await db
      .select()
      .from(events)
      .where(
        and(
          eq(events.organizationId, request.organization.id),
          eq(events.slug, slug),
          eq(events.status, "published"),
          isNull(events.deletedAt),
        ),
      )
      .limit(1);
    if (!event)
      throw new AppError(404, "EVENT_NOT_FOUND", "Event was not found.");
    return { data: event };
  });

  app.get("/members", async (request) => {
    const query = paginationSchema.parse(request.query);
    const conditions = [
      eq(members.organizationId, request.organization.id),
      eq(members.status, "active"),
      eq(members.isPublic, true),
      isNull(members.deletedAt),
    ];
    if (query.search) conditions.push(ilike(members.name, `%${query.search}%`));
    const items = await db
      .select({
        id: members.id,
        name: members.name,
        memberNumber: members.memberNumber,
        avatarUrl: members.avatarUrl,
        biography: members.biography,
        socialLinks: members.socialLinks,
      })
      .from(members)
      .where(and(...conditions))
      .orderBy(asc(members.name))
      .limit(query.limit)
      .offset((query.page - 1) * query.limit);
    return { data: items, meta: { page: query.page, limit: query.limit } };
  });

  app.get("/structure", async (request) => {
    const [units, positionRows, assignments] = await Promise.all([
      db
        .select()
        .from(organizationUnits)
        .where(
          and(
            eq(organizationUnits.organizationId, request.organization.id),
            eq(organizationUnits.isActive, true),
          ),
        )
        .orderBy(asc(organizationUnits.sortOrder)),
      db
        .select()
        .from(positions)
        .where(eq(positions.organizationId, request.organization.id))
        .orderBy(asc(positions.sortOrder)),
      db
        .select({
          assignment: positionAssignments,
          member: {
            id: members.id,
            name: members.name,
            avatarUrl: members.avatarUrl,
            memberNumber: members.memberNumber,
          },
        })
        .from(positionAssignments)
        .innerJoin(members, eq(positionAssignments.memberId, members.id))
        .where(
          and(
            eq(positionAssignments.organizationId, request.organization.id),
            or(
              isNull(positionAssignments.endsAt),
              gte(positionAssignments.endsAt, new Date()),
            ),
          ),
        ),
    ]);
    return { data: { units, positions: positionRows, assignments } };
  });

  app.post(
    "/forms/:slug/submissions",
    { config: { rateLimit: { max: 5, timeWindow: "10 minutes" } } },
    async (request, reply) => {
      const { slug } = slugParams.parse(request.params);
      const payload = z.record(z.string(), z.unknown()).parse(request.body);
      const [form] = await db
        .select()
        .from(forms)
        .where(
          and(
            eq(forms.organizationId, request.organization.id),
            eq(forms.slug, slug),
            eq(forms.isActive, true),
          ),
        )
        .limit(1);
      if (!form)
        throw new AppError(404, "FORM_NOT_FOUND", "Form was not found.");
      const allowedFields = new Set(
        form.fields.map((field) => String(field.name ?? "")),
      );
      const filteredPayload = Object.fromEntries(
        Object.entries(payload).filter(([key]) => allowedFields.has(key)),
      );
      if (Object.keys(filteredPayload).length === 0)
        throw new AppError(
          422,
          "EMPTY_SUBMISSION",
          "No valid form fields were submitted.",
        );
      const [submission] = await db
        .insert(formSubmissions)
        .values({
          organizationId: request.organization.id,
          formId: form.id,
          payload: filteredPayload,
          ipHash: createHash("sha256")
            .update(`${request.ip}:${form.id}`)
            .digest("hex"),
          userAgent: request.headers["user-agent"]?.slice(0, 500),
        })
        .returning({ id: formSubmissions.id });
      return reply.status(201).send({
        data: {
          id: submission?.id,
          message:
            form.successMessage ?? "Thank you. Your message has been received.",
        },
      });
    },
  );
};
