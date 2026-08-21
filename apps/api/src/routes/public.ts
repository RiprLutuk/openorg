import { pageSectionsSchema, paginationSchema } from "@openorg/contracts";
import { and, asc, desc, eq, gt, gte, ilike, or, sql } from "drizzle-orm";
import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { db } from "../db/client";
import {
  contactSubmissions,
  contents,
  events,
  members,
  organizationUnits,
  pages,
  positionAssignments,
  positions,
  siteSettings,
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
  app.get("/site", async () => {
    const [settings] = await db
      .select()
      .from(siteSettings)
      .where(eq(siteSettings.id, "default"))
      .limit(1);

    const site = settings ?? {
      id: "default",
      name: "OpenOrg Association",
      slug: "openorg",
      kind: "association",
      tagline: "Platform Resmi Organisasi",
      description:
        "Platform terpadu keanggotaan, tata kelola organisasi, kredit akademi SKP/CPD, dan verifikasi kredensial.",
      logoUrl: null,
      faviconUrl: null,
      locale: "id-ID",
      timezone: "Asia/Jakarta",
      primaryColor: "#6941C6",
      secondaryColor: "#12B76A",
      quickContact: {
        channel: "message",
        label: "Hubungi Sekretariat",
        value: "sekretariat@openorg.id",
        href: "/contact",
      },
      navigation: [
        { id: "events", label: "Agenda", href: "/events" },
        { id: "structure", label: "Struktur Pengurus", href: "/structure" },
        { id: "verify", label: "Verifikasi Kredensial", href: "/verify" },
      ],
      footer: {},
    };

    return {
      data: {
        organization: {
          id: site.id,
          name: site.name,
          slug: site.slug,
          kind: site.kind,
          tagline: site.tagline,
          description: site.description,
          logoUrl: site.logoUrl,
          faviconUrl: site.faviconUrl,
          locale: site.locale,
          theme: {
            colors: {
              primary: site.primaryColor ?? "#6941C6",
              secondary: site.secondaryColor ?? "#12B76A",
              accent: "#7F56D9",
              surface: "#ffffff",
              foreground: "#101828",
            },
            radius: "large",
            fontHeading: "Inter",
            fontBody: "Inter",
          },
        },
        navigation: site.navigation ?? [
          { id: "events", label: "Agenda", href: "/events" },
          { id: "structure", label: "Struktur", href: "/structure" },
          { id: "verify", label: "Verifikasi Kredensial", href: "/verify" },
        ],
        footer: site.footer ?? {},
        announcement: null,
        quickContact: site.quickContact ?? {
          enabled: true,
          label: "Hubungi Kami",
          href: "/contact",
          channel: "message",
        },
      },
    };
  });

  app.get("/pages", async () => {
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
      .where(eq(pages.status, "published"))
      .orderBy(desc(pages.publishedAt));
    return { data: items };
  });

  app.get("/pages/home", async () => {
    const [page] = await db
      .select()
      .from(pages)
      .where(and(eq(pages.isHomepage, true), eq(pages.status, "published")))
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
      .where(and(eq(pages.slug, slug), eq(pages.status, "published")))
      .limit(1);
    if (!page) throw new AppError(404, "PAGE_NOT_FOUND", "Page was not found.");
    return {
      data: { ...page, sections: pageSectionsSchema.parse(page.sections) },
    };
  });

  app.get("/contents", async (request) => {
    const query = contentQuery.parse(request.query);
    const conditions = [
      eq(contents.type, query.type),
      eq(contents.status, "published"),
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
        .orderBy(desc(contents.publishedAt))
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
      .where(and(eq(contents.slug, slug), eq(contents.status, "published")))
      .limit(1);
    if (!content)
      throw new AppError(404, "CONTENT_NOT_FOUND", "Content was not found.");
    return { data: content };
  });

  app.get("/events", async (request) => {
    const query = paginationSchema
      .extend({ upcoming: z.coerce.boolean().default(true) })
      .parse(request.query);
    const conditions = [eq(events.status, "published")];
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
      .where(and(eq(events.slug, slug), eq(events.status, "published")))
      .limit(1);
    if (!event)
      throw new AppError(404, "EVENT_NOT_FOUND", "Event was not found.");
    return { data: event };
  });

  app.get("/structure", async () => {
    const [units, positionRows, assignments] = await Promise.all([
      db
        .select()
        .from(organizationUnits)
        .where(eq(organizationUnits.isActive, true))
        .orderBy(asc(organizationUnits.sortOrder)),
      db
        .select()
        .from(positions)
        .where(eq(positions.isActive, true))
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
          or(
            gte(positionAssignments.endsAt, new Date()),
            sql`${positionAssignments.endsAt} is null`,
          ),
        ),
    ]);
    return { data: { units, positions: positionRows, assignments } };
  });

  app.post(
    "/contact",
    { config: { rateLimit: { max: 5, timeWindow: "10 minutes" } } },
    async (request, reply) => {
      const contactSchema = z.object({
        name: z.string().min(2).max(160),
        email: z.string().email(),
        subject: z.string().max(200).optional(),
        message: z.string().min(5),
      });
      const body = contactSchema.parse(request.body);
      const [submission] = await db
        .insert(contactSubmissions)
        .values({
          name: body.name,
          email: body.email,
          subject: body.subject,
          message: body.message,
          ipAddress: request.ip,
        })
        .returning({ id: contactSubmissions.id });

      return reply.status(201).send({
        data: {
          id: submission?.id,
          message: "Pesan Anda telah diterima oleh sekretariat.",
        },
      });
    },
  );
};
