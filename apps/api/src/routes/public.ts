import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import {
  INDONESIA_PROVINCES,
  findProvince,
  pageSectionsSchema,
  paginationSchema,
} from "@openorg/contracts";
import { and, asc, desc, eq, gt, gte, ilike, or, sql } from "drizzle-orm";
import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { config } from "../config";
import { db } from "../db/client";
import {
  adArtDocuments,
  championshipStandings,
  contactSubmissions,
  contents,
  events,
  indonesiaDistricts,
  indonesiaProvinces,
  indonesiaRegencies,
  indonesiaVillages,
  industryStatistics,
  lenderRegistries,
  media,
  members,
  organizationMilestones,
  organizationUnits,
  pages,
  positionAssignments,
  positions,
  publicComplaints,
  refrigerantSpecifications,
  registeredClubs,
  regulations,
  siteSettings,
  technicianDirectories,
  workingGroups,
} from "../db/schema";
import { AppError } from "../lib/errors";
import { detectSupportedImage } from "../lib/media";

const slugParams = z.object({
  slug: z
    .string()
    .min(1)
    .max(180)
    .regex(/^[a-z0-9-]+$/),
});
const contentQuery = paginationSchema.extend({
  type: z.string().optional(),
});

export const publicRoutes: FastifyPluginAsync = async (app) => {
  app.addHook("onSend", async (request, reply) => {
    if (request.method === "GET" && !reply.hasHeader("cache-control")) {
      const url = request.url;
      if (url.includes("/wilayah")) {
        reply.header(
          "Cache-Control",
          "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400",
        );
      } else {
        reply.header(
          "Cache-Control",
          "public, max-age=60, s-maxage=300, stale-while-revalidate=600",
        );
      }
    }
  });

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

    if (!page) {
      return {
        data: {
          id: "home",
          title: "APTI Indonesia",
          slug: "home",
          excerpt:
            "Platform Resmi Asosiasi Pengusaha & Teknisi Pendingin Indonesia",
          isHomepage: true,
          status: "published",
          sections: [],
          seo: {},
          updatedAt: new Date().toISOString(),
        },
      };
    }

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
    const conditions = [eq(contents.status, "published")];
    if (query.type && query.type !== "all") {
      conditions.push(eq(contents.type, query.type));
    }
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

  app.get("/units", async () => {
    const units = await db
      .select()
      .from(organizationUnits)
      .where(eq(organizationUnits.isActive, true))
      .orderBy(asc(organizationUnits.sortOrder));
    return { data: units };
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
        page: z.coerce.number().int().min(1).default(1),
        limit: z.coerce.number().int().min(1).max(100).default(8),
      })
      .parse(request.query);

    const conditions = [eq(regulations.status, "published")];
    if (query.category) {
      conditions.push(eq(regulations.category, query.category));
    }
    if (query.search) {
      conditions.push(ilike(regulations.title, `%${query.search}%`));
    }

    const offset = (query.page - 1) * query.limit;
    const [rows, countRows] = await Promise.all([
      db
        .select()
        .from(regulations)
        .where(and(...conditions))
        .orderBy(desc(regulations.issuedDate), desc(regulations.createdAt))
        .limit(query.limit)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(regulations)
        .where(and(...conditions)),
    ]);

    const total = countRows[0]?.count ?? 0;
    return {
      data: rows,
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit) || 1,
      },
    };
  });

  // Public Complaint Evidence Upload Endpoint (Max 1MB per file, max 10 files)
  app.post(
    "/complaints/upload-evidence",
    { config: { rateLimit: { max: 40, timeWindow: "10 minutes" } } },
    async (request, reply) => {
      const upload = await request.file();
      if (!upload) {
        throw new AppError(
          422,
          "FILE_REQUIRED",
          "Pilih berkas bukti untuk diunggah.",
        );
      }
      const bytes = await upload.toBuffer();
      if (bytes.length === 0 || bytes.length > 1_048_576) {
        throw new AppError(
          413,
          "FILE_TOO_LARGE",
          "Ukuran setiap berkas bukti tidak boleh melebihi 1 MB.",
        );
      }
      const detected = detectSupportedImage(bytes);
      let extension: string;
      let mimeType: string;
      let isPdf = false;

      if (detected) {
        extension = detected.extension;
        mimeType = detected.mimeType;
      } else if (
        bytes.length > 4 &&
        bytes[0] === 0x25 &&
        bytes[1] === 0x50 &&
        bytes[2] === 0x44 &&
        bytes[3] === 0x46
      ) {
        extension = "pdf";
        mimeType = "application/pdf";
        isPdf = true;
      } else {
        throw new AppError(
          415,
          "UNSUPPORTED_MEDIA_TYPE",
          "Format berkas tidak didukung. Harap unggah format JPG, PNG, WebP, atau PDF.",
        );
      }

      const id = randomUUID();
      const filename = `${id}.${extension}`;
      const target = resolve(config.STORAGE_LOCAL_PATH, filename);
      await mkdir(dirname(target), { recursive: true });
      await writeFile(target, bytes, { flag: "wx" });

      const fileUrl = `${config.STORAGE_PUBLIC_URL.replace(/\/$/, "")}/${filename}`;

      await db.insert(media).values({
        id,
        kind: isPdf ? "document" : "image",
        filename,
        mimeType: mimeType || "application/octet-stream",
        sizeBytes: bytes.length,
        checksumSha256: id,
        url: fileUrl,
      });

      return reply.status(201).send({
        data: {
          id,
          url: fileUrl,
          filename: upload.filename,
          sizeBytes: bytes.length,
          extension,
        },
      });
    },
  );

  // Public Ethics & Complaints Filing
  app.post(
    "/complaints",
    { config: { rateLimit: { max: 5, timeWindow: "10 minutes" } } },
    async (request, reply) => {
      const complaintSchema = z.object({
        complainantName: z.string().min(2).max(160),
        complainantEmail: z.string().email().max(320),
        complainantPhone: z.string().max(40).optional(),
        targetType: z.string().max(60).default("technician"),
        targetIdentifier: z.string().min(2).max(160),
        category: z.string().min(2).max(80).default("kode_etik"),
        description: z.string().min(10).max(10_000),
        evidenceFileUrl: z.string().max(65535).optional(),
        hpWebsite: z.string().max(100).optional(),
      });

      const body = complaintSchema.parse(request.body);

      // Anti-Bot Honeypot Trap
      if (body.hpWebsite && body.hpWebsite.trim().length > 0) {
        throw new AppError(400, "BOT_DETECTED", "Verifikasi keamanan gagal.");
      }

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
        evidenceFileUrl: publicComplaints.evidenceFileUrl,
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

  // Championship Standings Public API (with pagination & search)
  app.get("/championships", async (request) => {
    const query = z
      .object({
        seasonYear: z.coerce.number().optional(),
        category: z.string().optional(),
        search: z.string().optional(),
        page: z.coerce.number().int().min(1).default(1),
        limit: z.coerce.number().int().min(1).max(100).default(8),
      })
      .parse(request.query);

    const conditions = [];
    if (query.seasonYear)
      conditions.push(eq(championshipStandings.seasonYear, query.seasonYear));
    if (query.category)
      conditions.push(eq(championshipStandings.category, query.category));
    if (query.search?.trim()) {
      const q = `%${query.search.trim()}%`;
      conditions.push(
        or(
          ilike(championshipStandings.participantName, q),
          ilike(championshipStandings.teamName, q),
          ilike(championshipStandings.unitName, q),
          ilike(championshipStandings.achievements, q),
        ),
      );
    }

    const whereClause = conditions.length ? and(...conditions) : undefined;
    const offset = (query.page - 1) * query.limit;

    const [rows, countRows] = await Promise.all([
      db
        .select()
        .from(championshipStandings)
        .where(whereClause)
        .orderBy(
          asc(championshipStandings.rank),
          desc(championshipStandings.points),
        )
        .limit(query.limit)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(championshipStandings)
        .where(whereClause),
    ]);

    const total = countRows[0]?.count ?? 0;
    return {
      data: rows,
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit) || 1,
      },
    };
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

  // Cari Teknisi Terverifikasi (ASISI / APITU) (with pagination & filters)
  app.get("/technicians", async (request) => {
    const query = z
      .object({
        city: z.string().optional(),
        province: z.string().optional(),
        search: z.string().optional(),
        page: z.coerce.number().int().min(1).default(1),
        limit: z.coerce.number().int().min(1).max(100).default(9),
      })
      .parse(request.query);

    const conditions = [];
    if (query.city)
      conditions.push(ilike(technicianDirectories.city, `%${query.city}%`));
    if (query.province)
      conditions.push(
        ilike(technicianDirectories.province, `%${query.province}%`),
      );
    if (query.search?.trim()) {
      const q = `%${query.search.trim()}%`;
      conditions.push(
        or(
          ilike(technicianDirectories.name, q),
          ilike(technicianDirectories.ktaNumber, q),
          ilike(technicianDirectories.workshopName, q),
          ilike(technicianDirectories.skillLevel, q),
        ),
      );
    }

    const whereClause = conditions.length ? and(...conditions) : undefined;
    const offset = (query.page - 1) * query.limit;

    const [rows, countRows] = await Promise.all([
      db
        .select()
        .from(technicianDirectories)
        .where(whereClause)
        .orderBy(desc(technicianDirectories.rating))
        .limit(query.limit)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(technicianDirectories)
        .where(whereClause),
    ]);

    const total = countRows[0]?.count ?? 0;
    return {
      data: rows,
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit) || 1,
      },
    };
  });

  // Direktori Bengkel / Workshop Anggota Resmi
  const handleGetWorkshops = async () => {
    const activeMembers = await db
      .select({
        id: members.id,
        name: members.name,
        email: members.email,
        phone: members.phone,
        memberNumber: members.memberNumber,
        unitId: members.unitId,
        metadata: members.metadata,
      })
      .from(members)
      .where(eq(members.status, "active"));

    const memberWorkshops = activeMembers
      .filter((m) => {
        const ad = (m.metadata as Record<string, any>)?.workshopAd;
        return ad && (ad.workshopName || ad.city);
      })
      .map((m) => {
        const ad = (m.metadata as Record<string, any>).workshopAd;
        return {
          id: m.id,
          memberNumber: m.memberNumber,
          workshopName: ad.workshopName || m.name,
          ownerName: ad.ownerName || m.name,
          category: ad.category || "Bengkel Servis AC & Pendingin",
          tagline: ad.tagline || "Solusi Tata Udara Profesional & Bergaransi",
          description: ad.description || "",
          address: ad.address || "",
          village: ad.village || "",
          district: ad.district || "",
          city: ad.city || "Jakarta",
          province: ad.province || "DKI Jakarta",
          postalCode: ad.postalCode || "",
          phone: ad.phone || m.phone || "",
          whatsapp: ad.whatsapp || ad.phone || m.phone || "",
          website: ad.website || "",
          googleMapsUrl: ad.googleMapsUrl || "",
          latitude: typeof ad.latitude === "number" ? ad.latitude : -6.2088,
          longitude: typeof ad.longitude === "number" ? ad.longitude : 106.8456,
          operatingHours: ad.operatingHours || "08:00 - 17:00",
          emergency24h: Boolean(ad.emergency24h),
          services: Array.isArray(ad.services)
            ? ad.services
            : ["Servis AC", "Perbaikan Modul"],
          isVerified: true,
          verifiedBadge: "APTI Verified Workshop",
          rating: 4.9,
          reviewCount: 28,
        };
      });

    return { data: memberWorkshops };
  };

  app.get("/workshops", handleGetWorkshops);
  app.get("/bengkel", handleGetWorkshops);

  // Kelompok Kerja / Pokja Advokasi (with pagination & search)
  app.get("/working-groups", async (request) => {
    const query = z
      .object({
        search: z.string().optional(),
        page: z.coerce.number().int().min(1).default(1),
        limit: z.coerce.number().int().min(1).max(100).default(6),
      })
      .parse(request.query);

    const conditions = [eq(workingGroups.isActive, true)];
    if (query.search?.trim()) {
      const q = `%${query.search.trim()}%`;
      const searchOr = or(
        ilike(workingGroups.name, q),
        ilike(workingGroups.chairName, q),
        ilike(workingGroups.category, q),
        ilike(workingGroups.description, q),
      );
      if (searchOr) {
        conditions.push(searchOr);
      }
    }

    const whereClause = and(...conditions);
    const offset = (query.page - 1) * query.limit;
    const [rows, countRows] = await Promise.all([
      db
        .select()
        .from(workingGroups)
        .where(whereClause)
        .orderBy(asc(workingGroups.name))
        .limit(query.limit)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(workingGroups)
        .where(whereClause),
    ]);

    const total = countRows[0]?.count ?? 0;
    return {
      data: rows,
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit) || 1,
      },
    };
  });

  // Direktori Klub & Pengprov TKT (with pagination & filters)
  app.get("/clubs", async (request) => {
    const query = z
      .object({
        province: z.string().optional(),
        search: z.string().optional(),
        page: z.coerce.number().int().min(1).default(1),
        limit: z.coerce.number().int().min(1).max(100).default(8),
      })
      .parse(request.query);

    const conditions = [];
    if (query.province)
      conditions.push(ilike(registeredClubs.province, `%${query.province}%`));
    if (query.search?.trim()) {
      const q = `%${query.search.trim()}%`;
      conditions.push(
        or(
          ilike(registeredClubs.clubName, q),
          ilike(registeredClubs.codeTkt, q),
          ilike(registeredClubs.chairName, q),
        ),
      );
    }

    const whereClause = conditions.length ? and(...conditions) : undefined;
    const offset = (query.page - 1) * query.limit;

    const [rows, countRows] = await Promise.all([
      db
        .select()
        .from(registeredClubs)
        .where(whereClause)
        .orderBy(desc(registeredClubs.activeMembers))
        .limit(query.limit)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(registeredClubs)
        .where(whereClause),
    ]);

    const total = countRows[0]?.count ?? 0;
    return {
      data: rows,
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit) || 1,
      },
    };
  });

  // Verifikasi Mitra Prinsipal, Distributor & Rekanan Resmi (with pagination & search)
  const handleGetPartners = async (request: any) => {
    const query = z
      .object({
        search: z.string().optional(),
        page: z.coerce.number().int().min(1).default(1),
        limit: z.coerce.number().int().min(1).max(100).default(8),
      })
      .parse(request.query);

    const conditions = [];
    if (query.search?.trim()) {
      const q = `%${query.search.trim()}%`;
      conditions.push(
        or(
          ilike(lenderRegistries.brandName, q),
          ilike(lenderRegistries.companyName, q),
          ilike(lenderRegistries.licenseNumber, q),
          ilike(lenderRegistries.sectorType, q),
        ),
      );
    }

    const whereClause = conditions.length ? and(...conditions) : undefined;
    const offset = (query.page - 1) * query.limit;

    const [rows, countRows] = await Promise.all([
      db
        .select()
        .from(lenderRegistries)
        .where(whereClause)
        .orderBy(asc(lenderRegistries.brandName))
        .limit(query.limit)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(lenderRegistries)
        .where(whereClause),
    ]);

    const total = countRows[0]?.count ?? 0;
    return {
      data: rows,
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit) || 1,
      },
    };
  };

  app.get("/partners", handleGetPartners);
  app.get("/lenders", handleGetPartners);

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

  // =========================================================================
  // Database Wilayah & Kodepos Indonesia (Kepmendagri)
  // =========================================================================
  app.get("/wilayah/provinces", async (request) => {
    const query = z
      .object({
        search: z.string().optional(),
      })
      .parse(request.query);

    const conditions = [];
    if (query.search?.trim()) {
      const q = `%${query.search.trim()}%`;
      conditions.push(
        or(
          ilike(indonesiaProvinces.nama, q),
          ilike(indonesiaProvinces.ibukota, q),
          ilike(indonesiaProvinces.kode, q),
        ),
      );
    }

    const rows = await db
      .select()
      .from(indonesiaProvinces)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(asc(indonesiaProvinces.kode));

    return { data: rows };
  });

  app.get("/wilayah/regencies", async (request) => {
    const query = z
      .object({
        province: z.string().optional(),
        search: z.string().optional(),
      })
      .parse(request.query);

    const conditions = [];

    if (query.province?.trim()) {
      const p = query.province.trim();
      const provMatch = findProvince(p);
      const provCode = provMatch?.kode || p;
      conditions.push(
        or(
          eq(indonesiaRegencies.provinceKode, provCode),
          eq(indonesiaRegencies.provinceKode, p),
          ilike(indonesiaRegencies.provinceKode, p),
          sql`${indonesiaRegencies.provinceKode} IN (SELECT kode FROM indonesia_provinces WHERE nama ILIKE ${"%" + p + "%"})`,
        ),
      );
    }

    if (query.search?.trim()) {
      const q = `%${query.search.trim()}%`;
      conditions.push(
        or(
          ilike(indonesiaRegencies.nama, q),
          ilike(indonesiaRegencies.ibukota, q),
          ilike(indonesiaRegencies.kode, q),
          ilike(indonesiaRegencies.kodepos, q),
        ),
      );
    }

    const rows = await db
      .select()
      .from(indonesiaRegencies)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(asc(indonesiaRegencies.kode));

    return { data: rows };
  });

  app.get("/wilayah/districts", async (request) => {
    const query = z
      .object({
        regency: z.string().optional(),
        province: z.string().optional(),
        search: z.string().optional(),
        limit: z.coerce.number().int().min(1).max(500).default(200),
      })
      .parse(request.query);

    const conditions = [];

    if (query.regency?.trim()) {
      const r = query.regency.trim();
      const cleanR = r
        .replace(/^(kabupaten|kota adm\.|kota administrasi|kota|kab\.)\s+/i, "")
        .trim();
      conditions.push(
        or(
          eq(indonesiaDistricts.regencyKode, r),
          ilike(indonesiaDistricts.regencyKode, r),
          sql`${indonesiaDistricts.regencyKode} IN (SELECT kode FROM indonesia_regencies WHERE nama ILIKE ${"%" + cleanR + "%"} OR nama ILIKE ${"%" + r + "%"})`,
        ),
      );
    }

    if (query.province?.trim()) {
      const p = query.province.trim();
      const provMatch = findProvince(p);
      const provCode = provMatch?.kode || p;
      conditions.push(
        or(
          eq(indonesiaDistricts.provinceKode, provCode),
          eq(indonesiaDistricts.provinceKode, p),
          ilike(indonesiaDistricts.provinceKode, p),
          sql`${indonesiaDistricts.provinceKode} IN (SELECT kode FROM indonesia_provinces WHERE nama ILIKE ${"%" + p + "%"})`,
        ),
      );
    }

    if (query.search?.trim()) {
      const q = `%${query.search.trim()}%`;
      conditions.push(
        or(
          ilike(indonesiaDistricts.nama, q),
          ilike(indonesiaDistricts.kode, q),
        ),
      );
    }

    const rows = await db
      .select()
      .from(indonesiaDistricts)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(asc(indonesiaDistricts.kode))
      .limit(query.limit);

    return { data: rows };
  });

  app.get("/wilayah/villages", async (request) => {
    const query = z
      .object({
        district: z.string().optional(),
        regency: z.string().optional(),
        search: z.string().optional(),
        kodepos: z.string().optional(),
        limit: z.coerce.number().int().min(1).max(500).default(200),
      })
      .parse(request.query);

    const conditions = [];

    if (query.district?.trim()) {
      const d = query.district.trim();
      const cleanD = d.replace(/^(kecamatan|kec\.)\s+/i, "").trim();
      conditions.push(
        or(
          eq(indonesiaVillages.districtKode, d),
          ilike(indonesiaVillages.districtKode, d),
          sql`${indonesiaVillages.districtKode} IN (SELECT kode FROM indonesia_districts WHERE nama ILIKE ${"%" + cleanD + "%"} OR nama ILIKE ${"%" + d + "%"})`,
        ),
      );
    }

    if (query.regency?.trim()) {
      const r = query.regency.trim();
      const cleanR = r
        .replace(/^(kabupaten|kota adm\.|kota administrasi|kota|kab\.)\s+/i, "")
        .trim();
      conditions.push(
        or(
          eq(indonesiaVillages.regencyKode, r),
          ilike(indonesiaVillages.regencyKode, r),
          sql`${indonesiaVillages.regencyKode} IN (SELECT kode FROM indonesia_regencies WHERE nama ILIKE ${"%" + cleanR + "%"} OR nama ILIKE ${"%" + r + "%"})`,
        ),
      );
    }

    if (query.kodepos?.trim()) {
      conditions.push(eq(indonesiaVillages.kodepos, query.kodepos.trim()));
    }

    if (query.search?.trim()) {
      const q = `%${query.search.trim()}%`;
      conditions.push(
        or(
          ilike(indonesiaVillages.nama, q),
          ilike(indonesiaVillages.kode, q),
          ilike(indonesiaVillages.kodepos, q),
        ),
      );
    }

    const rows = await db
      .select()
      .from(indonesiaVillages)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(asc(indonesiaVillages.kode))
      .limit(query.limit);

    return { data: rows };
  });

  app.get("/wilayah/kodepos/:kodepos", async (request) => {
    const params = z
      .object({
        kodepos: z.string().min(2).max(10),
      })
      .parse(request.params);

    const targetKodepos = params.kodepos.trim();

    // Query villages matching postal code directly
    const villageRows = await db
      .select({
        kode: indonesiaVillages.kode,
        nama: indonesiaVillages.nama,
        kodepos: indonesiaVillages.kodepos,
        districtKode: indonesiaVillages.districtKode,
        regencyKode: indonesiaVillages.regencyKode,
        provinceKode: indonesiaVillages.provinceKode,
      })
      .from(indonesiaVillages)
      .where(eq(indonesiaVillages.kodepos, targetKodepos))
      .limit(20);

    // Query regency matching postal code
    const regencyRows = await db
      .select()
      .from(indonesiaRegencies)
      .where(
        or(
          eq(indonesiaRegencies.kodepos, targetKodepos),
          ilike(indonesiaRegencies.kodeposRange, `%${targetKodepos}%`),
          sql`${indonesiaRegencies.kodeposList} @> ${JSON.stringify([targetKodepos])}::jsonb`,
        ),
      )
      .limit(10);

    return {
      data: {
        villages: villageRows,
        regencies: regencyRows,
      },
    };
  });

  app.get("/wilayah/reverse-geocode", async (request) => {
    const query = z
      .object({
        latitude: z.coerce.number().min(-90).max(90),
        longitude: z.coerce.number().min(-180).max(180),
      })
      .parse(request.query);

    const lat = query.latitude;
    const lon = query.longitude;

    let raw: {
      road?: string;
      village?: string;
      district?: string;
      city?: string;
      state?: string;
      postcode?: string;
      displayName?: string;
    } | null = null;

    // 1. Try Photon (Komoot)
    try {
      const pRes = await fetch(
        `https://photon.komoot.io/reverse?lat=${lat}&lon=${lon}`,
        { headers: { "Accept-Language": "id" } },
      );
      if (pRes.ok) {
        const pData = (await pRes.json()) as any;
        const p = pData?.features?.[0]?.properties;
        if (p) {
          raw = {
            road: p.name || p.street || "",
            village: p.district || p.suburb || "",
            district: p.locality || p.county || "",
            city: p.city || "",
            state: p.state || "",
            postcode: p.postcode || "",
            displayName: [p.name, p.district, p.city, p.state, p.postcode]
              .filter(Boolean)
              .join(", "),
          };
        }
      }
    } catch {
      // ignore
    }

    // 2. Fallback to BigDataCloud
    if (!raw || !raw.state) {
      try {
        const bdcRes = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=id`,
        );
        if (bdcRes.ok) {
          const bdc = (await bdcRes.json()) as any;
          const admin = bdc.localityInfo?.administrative || [];
          raw = {
            road: bdc.locality || "",
            village: admin[5]?.name || admin[4]?.name || "",
            district: admin[4]?.name || admin[3]?.name || "",
            city: bdc.city || admin[3]?.name || "",
            state:
              admin.find((a: any) =>
                INDONESIA_PROVINCES.some((p) =>
                  a.name.toLowerCase().includes(p.nama.toLowerCase()),
                ),
              )?.name ||
              bdc.principalSubdivision ||
              "",
            postcode: bdc.postcode || "",
            displayName: [bdc.locality, bdc.city, bdc.principalSubdivision]
              .filter(Boolean)
              .join(", "),
          };
        }
      } catch {
        // ignore
      }
    }

    // 3. Fallback to Nominatim OSM with proper User-Agent
    if (!raw || !raw.state) {
      try {
        const nomRes = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`,
          {
            headers: {
              "User-Agent": "OpenOrg-Membership/1.0 (contact@openorg.id)",
              "Accept-Language": "id",
            },
          },
        );
        if (nomRes.ok) {
          const nom = (await nomRes.json()) as any;
          const a = nom.address || {};
          raw = {
            road: [a.road, a.house_number].filter(Boolean).join(", "),
            village:
              a.neighbourhood || a.quarter || a.hamlet || a.village || "",
            district: a.suburb || a.district || a.city_district || "",
            city: a.city || a.county || a.town || a.regency || "",
            state: a.state || a.province || a.region || "",
            postcode: a.postcode || "",
            displayName: nom.display_name || "",
          };
        }
      } catch {
        // ignore
      }
    }

    if (!raw || (!raw.state && !raw.city)) {
      throw new AppError(
        404,
        "GEOCODE_FAILED",
        "Lokasi tidak dapat diterjemahkan secara otomatis.",
      );
    }

    // Match Province in DB
    const allProvinces = await db.select().from(indonesiaProvinces);
    const rawText = `${raw.displayName || ""} ${raw.road || ""} ${raw.village || ""} ${raw.district || ""} ${raw.city || ""} ${raw.state || ""}`.toLowerCase();

    let matchedProvince = allProvinces.find((p) => {
      const pName = p.nama.toLowerCase();
      return (
        rawText.includes(pName) ||
        (raw?.state && raw.state.toLowerCase().includes(pName))
      );
    });

    if (!matchedProvince) {
      matchedProvince = allProvinces.find((p) =>
        p.nama
          .toLowerCase()
          .split(" ")
          .some((part) => part.length > 3 && rawText.includes(part)),
      );
    }

    if (!matchedProvince) {
      return {
        data: {
          latitude: lat,
          longitude: lon,
          raw,
          province: null,
          regency: null,
          district: null,
          village: null,
          postalCode: raw.postcode || "",
          road: raw.road || "",
          regencies: [],
          districts: [],
          villages: [],
        },
      };
    }

    // Regencies in Province
    const regList = await db
      .select()
      .from(indonesiaRegencies)
      .where(eq(indonesiaRegencies.provinceKode, matchedProvince.kode));

    // Intelligent Regency Matching with Priority Scoring:
    const scoredRegencies = regList.map((r) => {
      const rFull = r.nama.toLowerCase().trim();
      let score = 0;

      const isKota = rFull.startsWith("kota ");
      const isKab = rFull.startsWith("kabupaten ");
      const baseName = rFull
        .replace(/^(kabupaten|kota adm\.|kota administrasi|kota|kab\.)\s+/i, "")
        .trim();

      if (raw?.city && raw.city.toLowerCase().trim() === rFull) score += 100;
      if (rawText.includes(rFull)) score += 75;

      if (rawText.includes(baseName)) {
        score += 30;
        if (
          isKota &&
          (rawText.includes("kota " + baseName) ||
            (raw?.city && raw.city.toLowerCase().includes(baseName)))
        ) {
          score += 50;
        }
        if (
          isKab &&
          (rawText.includes("kabupaten " + baseName) ||
            (raw?.city && raw.city.toLowerCase().includes("kabupaten")))
        ) {
          score += 35;
        }

        // Directional modifiers
        if (rawText.includes("selatan") && !rFull.includes("selatan")) score -= 30;
        if (!rawText.includes("selatan") && rFull.includes("selatan")) score -= 30;
        if (rawText.includes("barat") && !rFull.includes("barat")) score -= 30;
        if (!rawText.includes("barat") && rFull.includes("barat")) score -= 30;
        if (rawText.includes("timur") && !rFull.includes("timur")) score -= 30;
        if (!rawText.includes("timur") && rFull.includes("timur")) score -= 30;
        if (rawText.includes("utara") && !rFull.includes("utara")) score -= 30;
        if (!rawText.includes("utara") && rFull.includes("utara")) score -= 30;
      }

      return { regency: r, score };
    });

    scoredRegencies.sort((a, b) => b.score - a.score);
    const matchedRegency =
      scoredRegencies[0]?.score && scoredRegencies[0].score > 0
        ? scoredRegencies[0].regency
        : regList[0];

    // Districts in Regency
    let distList: (typeof indonesiaDistricts.$inferSelect)[] = [];
    let matchedDistrict: (typeof indonesiaDistricts.$inferSelect) | undefined;
    if (matchedRegency) {
      distList = await db
        .select()
        .from(indonesiaDistricts)
        .where(eq(indonesiaDistricts.regencyKode, matchedRegency.kode));

      const scoredDistricts = distList.map((d) => {
        const dName = d.nama.toLowerCase().trim();
        let score = 0;
        if (
          raw?.district &&
          (dName === raw.district.toLowerCase() ||
            raw.district.toLowerCase().includes(dName))
        ) {
          score += 100;
        }
        if (rawText.includes(dName)) score += 60;
        return { district: d, score };
      });

      scoredDistricts.sort((a, b) => b.score - a.score);
      matchedDistrict =
        scoredDistricts[0]?.score && scoredDistricts[0].score > 0
          ? scoredDistricts[0].district
          : undefined;
    }

    // Villages in District
    let villList: (typeof indonesiaVillages.$inferSelect)[] = [];
    let matchedVillage: (typeof indonesiaVillages.$inferSelect) | undefined;
    if (matchedDistrict) {
      villList = await db
        .select()
        .from(indonesiaVillages)
        .where(eq(indonesiaVillages.districtKode, matchedDistrict.kode));

      const scoredVillages = villList.map((v) => {
        const vName = v.nama.toLowerCase().trim();
        let score = 0;
        if (
          raw?.village &&
          (vName === raw.village.toLowerCase() ||
            raw.village.toLowerCase().includes(vName))
        ) {
          score += 100;
        }
        if (rawText.includes(vName)) score += 60;
        return { village: v, score };
      });

      scoredVillages.sort((a, b) => b.score - a.score);
      matchedVillage =
        scoredVillages[0]?.score && scoredVillages[0].score > 0
          ? scoredVillages[0].village
          : undefined;
    }

    // If village not matched yet, try matching village directly in regency by name/postcode
    if (!matchedVillage && raw?.village && matchedRegency) {
      const [vDirect] = await db
        .select()
        .from(indonesiaVillages)
        .where(
          and(
            eq(indonesiaVillages.regencyKode, matchedRegency.kode),
            ilike(indonesiaVillages.nama, `%${raw.village.trim()}%`),
          ),
        )
        .limit(1);

      if (vDirect) {
        matchedVillage = vDirect;
        if (!matchedDistrict) {
          matchedDistrict = distList.find(
            (d) => d.kode === vDirect.districtKode,
          );
        }
      }
    }

    return {
      data: {
        latitude: lat,
        longitude: lon,
        raw,
        province: matchedProvince,
        regency: matchedRegency,
        district: matchedDistrict || null,
        village: matchedVillage || null,
        postalCode:
          matchedVillage?.kodepos ||
          raw?.postcode ||
          matchedRegency?.kodepos ||
          "",
        road: raw?.road || "",
        regencies: regList,
        districts: distList,
        villages: villList,
      },
    };
  });

  // =========================================================================
  // AD/ART & Kode Etik Organisasi Public API
  // =========================================================================
  app.get("/ad-art", async (request) => {
    const query = z
      .object({
        type: z.string().optional(),
        search: z.string().optional(),
      })
      .parse(request.query);

    const conditions = [];
    if (query.type?.trim()) {
      conditions.push(eq(adArtDocuments.docType, query.type.trim()));
    }
    if (query.search?.trim()) {
      const q = `%${query.search.trim()}%`;
      conditions.push(
        or(
          ilike(adArtDocuments.title, q),
          ilike(adArtDocuments.summary, q),
          ilike(adArtDocuments.chapterNumber, q),
        ),
      );
    }

    const rows = await db
      .select()
      .from(adArtDocuments)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(
        asc(adArtDocuments.sortOrder),
        asc(adArtDocuments.chapterNumber),
      );

    return { data: rows };
  });

  // =========================================================================
  // Profil & Sejarah Organisasi (Milestones) Public API
  // =========================================================================
  const handleGetMilestones = async () => {
    const rows = await db
      .select()
      .from(organizationMilestones)
      .orderBy(
        asc(organizationMilestones.sortOrder),
        asc(organizationMilestones.year),
      );

    return { data: rows };
  };

  app.get("/milestones", handleGetMilestones);
  app.get("/organization-profile/milestones", handleGetMilestones);

  // =========================================================================
  // Katalog Spesifikasi Freon / Refrigeran & Kalkulator Public API
  // =========================================================================
  const handleGetRefrigerants = async (request: any) => {
    const query = z
      .object({ search: z.string().optional() })
      .parse(request.query);

    const conditions = [];
    if (query.search?.trim()) {
      const q = `%${query.search.trim()}%`;
      conditions.push(
        or(
          ilike(refrigerantSpecifications.code, q),
          ilike(refrigerantSpecifications.name, q),
          ilike(refrigerantSpecifications.refrigerantType, q),
        ),
      );
    }

    const rows = await db
      .select()
      .from(refrigerantSpecifications)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(
        asc(refrigerantSpecifications.sortOrder),
        asc(refrigerantSpecifications.code),
      );

    return { data: rows };
  };

  app.get("/calculator/refrigerants", handleGetRefrigerants);
  app.get("/refrigerants", handleGetRefrigerants);
};
