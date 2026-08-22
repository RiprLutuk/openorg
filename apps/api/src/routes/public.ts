import { pageSectionsSchema, paginationSchema } from "@openorg/contracts";
import { and, asc, desc, eq, gt, gte, ilike, or, sql } from "drizzle-orm";
import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { db } from "../db/client";
import {
  championshipStandings,
  contactSubmissions,
  contents,
  events,
  industryStatistics,
  lenderRegistries,
  members,
  organizationUnits,
  pages,
  positionAssignments,
  positions,
  publicComplaints,
  registeredClubs,
  regulations,
  siteSettings,
  technicianDirectories,
  workingGroups,
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
      name: "APTI Indonesia",
      slug: "apti",
      kind: "association" as const,
      tagline: "Asosiasi Pengusaha & Teknisi Pendingin Indonesia",
      description:
        "Wadah resmi profesionalisme perusahaan pendingin dan teknisi refrigerasi tata udara (HVAC/R) Indonesia.",
      logoUrl: null,
      faviconUrl: null,
      locale: "id-ID",
      timezone: "Asia/Jakarta",
      primaryColor: "#0284c7",
      secondaryColor: "#090d16",
      theme: null,
      quickContact: {
        channel: "message",
        label: "Hubungi Sekretariat",
        value: "sekretariat@apti.or.id",
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
          theme: site.theme
            ? {
                colors: {
                  primary:
                    site.theme.colors?.primary ??
                    site.primaryColor ??
                    "#0284c7",
                  secondary:
                    site.theme.colors?.secondary ??
                    site.secondaryColor ??
                    "#0f172a",
                  accent: site.theme.colors?.accent ?? "#38bdf8",
                  surface: site.theme.colors?.surface ?? "#f8fafc",
                  foreground: site.theme.colors?.foreground ?? "#090d16",
                },
                radius: site.theme.radius ?? "large",
                fontHeading: site.theme.fontHeading ?? "Manrope",
                fontBody: site.theme.fontBody ?? "Inter",
              }
            : {
                colors: {
                  primary: site.primaryColor ?? "#0284c7",
                  secondary: site.secondaryColor ?? "#0f172a",
                  accent: "#38bdf8",
                  surface: "#f8fafc",
                  foreground: "#090d16",
                },
                radius: "large",
                fontHeading: "Manrope",
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

  // Regulations & Governance Public API
  app.get("/regulations", async (request) => {
    const query = z
      .object({
        category: z
          .enum([
            "regulasi_pemerintah",
            "se_organisasi",
            "ad_art",
            "posisi_kebijakan",
          ])
          .optional(),
        search: z.string().optional(),
      })
      .parse(request.query);

    const conditions = [eq(regulations.status, "published")];
    if (query.category) {
      conditions.push(eq(regulations.category, query.category));
    }
    if (query.search) {
      conditions.push(ilike(regulations.title, `%${query.search}%`));
    }

    const rows = await db
      .select()
      .from(regulations)
      .where(and(...conditions))
      .orderBy(desc(regulations.issuedDate), desc(regulations.createdAt));

    return { data: rows };
  });

  // Public Ethics & Complaints Filing
  app.post(
    "/complaints",
    { config: { rateLimit: { max: 5, timeWindow: "10 minutes" } } },
    async (request, reply) => {
      const complaintSchema = z.object({
        complainantName: z.string().min(2).max(160),
        complainantEmail: z.string().email().max(320),
        complainantPhone: z.string().max(40).optional(),
        targetType: z
          .enum(["member", "technician", "lender", "company"])
          .default("member"),
        targetIdentifier: z.string().min(2).max(160),
        category: z
          .enum(["kode_etik", "layanan_teknisi", "penagihan", "sengketa"])
          .default("kode_etik"),
        description: z.string().min(10).max(10_000),
        evidenceFileUrl: z.string().max(2048).optional(),
      });

      const body = complaintSchema.parse(request.body);
      const ticketNumber = `CMP-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

      const [complaint] = await db
        .insert(publicComplaints)
        .values({
          ticketNumber,
          complainantName: body.complainantName,
          complainantEmail: body.complainantEmail,
          complainantPhone: body.complainantPhone,
          targetType: body.targetType,
          targetIdentifier: body.targetIdentifier,
          category: body.category,
          description: body.description,
          evidenceFileUrl: body.evidenceFileUrl,
        })
        .returning({
          id: publicComplaints.id,
          ticketNumber: publicComplaints.ticketNumber,
        });

      return reply.status(201).send({
        data: {
          id: complaint?.id,
          ticketNumber: complaint?.ticketNumber,
          message:
            "Laporan pengaduan Anda telah berhasil dibuat. Simpan nomor tiket ini untuk pelacakan status.",
        },
      });
    },
  );

  // Complaint Status Verification Lookup
  app.get("/complaints/verify/:ticketNumber", async (request) => {
    const params = z
      .object({ ticketNumber: z.string().min(3) })
      .parse(request.params);
    const [complaint] = await db
      .select({
        ticketNumber: publicComplaints.ticketNumber,
        category: publicComplaints.category,
        targetType: publicComplaints.targetType,
        targetIdentifier: publicComplaints.targetIdentifier,
        status: publicComplaints.status,
        createdAt: publicComplaints.createdAt,
        reviewedAt: publicComplaints.reviewedAt,
        responseNotes: publicComplaints.responseNotes,
      })
      .from(publicComplaints)
      .where(eq(publicComplaints.ticketNumber, params.ticketNumber))
      .limit(1);

    if (!complaint) {
      throw new AppError(
        404,
        "NO_RECORD_FOUND",
        "Nomor tiket pengaduan tidak ditemukan.",
      );
    }
    return { data: complaint };
  });

  // Championship Standings Public API
  app.get("/championships", async (request) => {
    const query = z
      .object({
        seasonYear: z.coerce.number().optional(),
        category: z.string().optional(),
      })
      .parse(request.query);
    const conditions = [];
    if (query.seasonYear)
      conditions.push(eq(championshipStandings.seasonYear, query.seasonYear));
    if (query.category)
      conditions.push(eq(championshipStandings.category, query.category));

    const rows = await db
      .select()
      .from(championshipStandings)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(
        asc(championshipStandings.rank),
        desc(championshipStandings.points),
      );

    return { data: rows };
  });

  // Industry Statistics & Indicators Public API
  app.get("/statistics", async () => {
    const rows = await db
      .select()
      .from(industryStatistics)
      .orderBy(
        asc(industryStatistics.sortOrder),
        asc(industryStatistics.metricKey),
      );

    return { data: rows };
  });

  // Cari Teknisi Terverifikasi (ASISI / APITU)
  app.get("/technicians", async (request) => {
    const query = z
      .object({ city: z.string().optional(), search: z.string().optional() })
      .parse(request.query);
    const conditions = [];
    if (query.city)
      conditions.push(ilike(technicianDirectories.city, `%${query.city}%`));
    if (query.search) {
      conditions.push(
        or(
          ilike(technicianDirectories.name, `%${query.search}%`),
          ilike(technicianDirectories.ktaNumber, `%${query.search}%`),
          ilike(technicianDirectories.workshopName, `%${query.search}%`),
        ),
      );
    }

    const rows = await db
      .select()
      .from(technicianDirectories)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(technicianDirectories.rating));

    return { data: rows };
  });

  // Kelompok Kerja / Pokja Advokasi (APINDO, AFTECH, idEA)
  app.get("/working-groups", async () => {
    const rows = await db
      .select()
      .from(workingGroups)
      .where(eq(workingGroups.isActive, true))
      .orderBy(asc(workingGroups.name));

    return { data: rows };
  });

  // Direktori Klub & Pengprov TKT (IMI, APITU)
  app.get("/clubs", async (request) => {
    const query = z
      .object({ province: z.string().optional() })
      .parse(request.query);
    const conditions = [];
    if (query.province)
      conditions.push(ilike(registeredClubs.province, `%${query.province}%`));

    const rows = await db
      .select()
      .from(registeredClubs)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(registeredClubs.activeMembers));

    return { data: rows };
  });

  // Verifikasi Platform Fintech & Multifinance (AFPI, AFTECH, APPI)
  app.get("/lenders", async (request) => {
    const query = z
      .object({ search: z.string().optional() })
      .parse(request.query);
    const conditions = [];
    if (query.search) {
      conditions.push(
        or(
          ilike(lenderRegistries.brandName, `%${query.search}%`),
          ilike(lenderRegistries.companyName, `%${query.search}%`),
          ilike(lenderRegistries.licenseNumber, `%${query.search}%`),
        ),
      );
    }

    const rows = await db
      .select()
      .from(lenderRegistries)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(asc(lenderRegistries.brandName));

    return { data: rows };
  });

  // WHOIS IP/ASN & IIX Traffic Simulator (APJII)
  app.get("/whois", async (request) => {
    const query = z
      .object({ query: z.string().optional() })
      .parse(request.query);
    const q = query.query?.trim() ?? "APJII-IDNIC-ASN";

    return {
      data: {
        query: q,
        asn: "AS134371",
        organization: "APJII IDNIC NIR National Registry",
        ipRange: "103.28.144.0/22",
        status: "ACTIVE_ALLOCATION",
        iixTrafficPeakGbps: "2,480 Gbps",
        peeringStatus: "CONNECTED_TO_IIX_JKT01",
        updatedAt: new Date().toISOString(),
      },
    };
  });
};
