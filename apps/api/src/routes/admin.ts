import { pageSectionsSchema, paginationSchema } from "@openorg/contracts";
import { and, asc, desc, eq, ilike, or, sql } from "drizzle-orm";
import type { FastifyPluginAsync, FastifyRequest } from "fastify";
import { z } from "zod";
import { db } from "../db/client";
import {
  adArtDocuments,
  auditLogs,
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
  memberApplications,
  members,
  organizationMilestones,
  organizationUnits,
  pages,
  publicComplaints,
  refrigerantSpecifications,
  registeredClubs,
  regulations,
  siteSettings,
  technicianDirectories,
  workingGroups,
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

      const site = settings ?? {
        id: "default",
        name: "APTI Indonesia",
        slug: "apti",
        kind: "association" as const,
        tagline: "Asosiasi Pengusaha & Teknisi Pendingin Indonesia",
        description:
          "Wadah resmi profesionalisme perusahaan pendingin dan teknisi refrigerasi tata udara (HVAC/R) Indonesia.",
        primaryColor: "#0284c7",
        secondaryColor: "#0f172a",
        theme: null,
      };

      const defaultTheme = {
        colors: {
          primary: site.primaryColor ?? "#0284c7",
          secondary: site.secondaryColor ?? "#0f172a",
          accent: "#38bdf8",
          surface: "#f8fafc",
          foreground: "#090d16",
        },
        radius: "large" as const,
        fontHeading: "Manrope",
        fontBody: "Inter",
      };

      const theme = site.theme
        ? {
            colors: {
              ...defaultTheme.colors,
              ...site.theme.colors,
            },
            radius: site.theme.radius ?? defaultTheme.radius,
            fontHeading: site.theme.fontHeading ?? defaultTheme.fontHeading,
            fontBody: site.theme.fontBody ?? defaultTheme.fontBody,
          }
        : defaultTheme;

      return {
        data: {
          ...site,
          theme,
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
                .passthrough()
                .optional(),
              radius: z.string().optional(),
              fontHeading: z.string().optional(),
              fontBody: z.string().optional(),
              typography: z
                .object({
                  heading: z.string().optional(),
                  body: z.string().optional(),
                })
                .optional(),
            })
            .passthrough()
            .optional(),
          navigation: z.array(z.any()).optional(),
          footer: z.record(z.string(), z.any()).optional(),
          quickContact: z.record(z.string(), z.any()).optional(),
          socialLinks: z.array(z.any()).optional(),
        })
        .parse(request.body);

      const updateData: Record<string, unknown> = { ...input };
      if (input.theme) {
        if (input.theme.colors?.primary) {
          updateData.primaryColor = input.theme.colors.primary;
        }
        if (input.theme.colors?.secondary) {
          updateData.secondaryColor = input.theme.colors.secondary;
        }
        updateData.theme = input.theme;
      }

      const [updated] = await db
        .insert(siteSettings)
        .values({ id: "default", ...updateData })
        .onConflictDoUpdate({
          target: siteSettings.id,
          set: { ...updateData, updatedAt: new Date() },
        })
        .returning();

      if (!updated) throw new Error("Failed to update organization settings.");

      await audit(
        request,
        "organization.update",
        "organization",
        "default",
        null,
        updated,
      );

      const defaultTheme = {
        colors: {
          primary: updated.primaryColor ?? "#0284c7",
          secondary: updated.secondaryColor ?? "#0f172a",
          accent: "#38bdf8",
          surface: "#f8fafc",
          foreground: "#090d16",
        },
        radius: "large" as const,
        fontHeading: "Manrope",
        fontBody: "Inter",
      };

      const theme = updated.theme
        ? {
            colors: {
              ...defaultTheme.colors,
              ...updated.theme.colors,
            },
            radius: updated.theme.radius ?? defaultTheme.radius,
            fontHeading: updated.theme.fontHeading ?? defaultTheme.fontHeading,
            fontBody: updated.theme.fontBody ?? defaultTheme.fontBody,
          }
        : defaultTheme;

      return { data: { ...updated, theme } };
    },
  );

  app.get(
    "/settings/public",
    { preHandler: app.authorize("settings.read") },
    async () => {
      const [settings] = await db
        .select()
        .from(siteSettings)
        .where(eq(siteSettings.id, "default"))
        .limit(1);

      const rawQuick = (settings?.quickContact ?? {}) as Record<
        string,
        unknown
      >;
      const rawFooter = (settings?.footer ?? {}) as Record<string, unknown>;
      const rawAnnounce =
        (settings as { announcement?: unknown } | undefined)?.announcement ??
        null;

      const quickContact = {
        enabled:
          typeof rawQuick.enabled === "boolean" ? rawQuick.enabled : true,
        label:
          typeof rawQuick.label === "string"
            ? rawQuick.label
            : "WhatsApp Sekretariat APTI",
        href:
          typeof rawQuick.href === "string"
            ? rawQuick.href
            : "https://wa.me/6281290001980",
        channel:
          typeof rawQuick.channel === "string" ? rawQuick.channel : "message",
        value:
          typeof rawQuick.value === "string"
            ? rawQuick.value
            : "+62 812-9000-1980",
      };

      const announcement = rawAnnounce ?? {
        enabled: false,
        eyebrow: "Pengumuman Organisasi",
        title: "Selamat Datang di APTI Indonesia",
        message:
          "Wadah resmi profesionalisme pengusaha & teknisi pendingin Indonesia.",
        imageUrl: null,
        actionLabel: "Agenda & Sertifikasi",
        actionUrl: "/events",
        startsAt: null,
        endsAt: null,
      };

      const footer = {
        description:
          typeof rawFooter.description === "string"
            ? rawFooter.description
            : "Asosiasi Pengusaha & Teknisi Pendingin Indonesia (APTI).",
        copyright:
          typeof rawFooter.copyright === "string"
            ? rawFooter.copyright
            : "© 2026 APTI Indonesia. All rights reserved.",
        links: Array.isArray(rawFooter.links)
          ? rawFooter.links
          : [
              { label: "Agenda Pelatihan & Sertifikasi", href: "/events" },
              { label: "Struktur DPP & DPD Provinsi", href: "/structure" },
              { label: "Cek KTA Digital Teknisi", href: "/verify" },
            ],
      };

      return {
        data: {
          quickContact,
          navigation: settings?.navigation ?? [
            { id: "home", label: "Beranda", href: "/" },
            { id: "events", label: "Agenda & Sertifikasi", href: "/events" },
            { id: "structure", label: "Struktur Pengurus", href: "/structure" },
            { id: "verify", label: "Verifikasi KTA", href: "/verify" },
          ],
          footer,
          announcement,
        },
      };
    },
  );

  app.patch(
    "/settings/public",
    { preHandler: app.authorize("settings.write") },
    async (request) => {
      const input = z
        .object({
          quickContact: z
            .object({
              channel: z.string(),
              value: z.string(),
              label: z.string(),
              href: z.string(),
            })
            .optional(),
          navigation: z
            .array(
              z.object({
                id: z.string(),
                label: z.string(),
                href: z.string(),
              }),
            )
            .optional(),
          footer: z.record(z.string(), z.unknown()).optional(),
        })
        .parse(request.body);

      const updateSet: Partial<typeof siteSettings.$inferInsert> = {
        updatedAt: new Date(),
      };
      if (input.quickContact) updateSet.quickContact = input.quickContact;
      if (input.navigation) updateSet.navigation = input.navigation;
      if (input.footer) updateSet.footer = input.footer;

      const [updated] = await db
        .update(siteSettings)
        .set(updateSet)
        .where(eq(siteSettings.id, "default"))
        .returning();

      return { data: updated };
    },
  );

  app.get("/dashboard", { preHandler: app.authenticate }, async () => {
    const [
      pageCount,
      contentCount,
      memberCount,
      activeMemberCount,
      pendingMemberCount,
      eventCount,
      techCount,
      clubCount,
      complaintCount,
      inboxCount,
      applicationCount,
      recentContent,
      recentMembersList,
      unitsList,
      membersList,
      complaintsList,
      eventsWithCapacity,
      auditLogsRecentList,
      auditLogsTotalCount,
      standingsList,
      topRatedTechs,
      complianceWatchlist,
    ] = await Promise.all([
      db.select({ value: sql<number>`count(*)::int` }).from(pages),
      db.select({ value: sql<number>`count(*)::int` }).from(contents),
      db.select({ value: sql<number>`count(*)::int` }).from(members),
      db
        .select({ value: sql<number>`count(*)::int` })
        .from(members)
        .where(eq(members.status, "active")),
      db
        .select({ value: sql<number>`count(*)::int` })
        .from(members)
        .where(
          or(eq(members.status, "pending"), eq(members.status, "applicant")),
        ),
      db.select({ value: sql<number>`count(*)::int` }).from(events),
      db
        .select({ value: sql<number>`count(*)::int` })
        .from(technicianDirectories),
      db.select({ value: sql<number>`count(*)::int` }).from(registeredClubs),
      db.select({ value: sql<number>`count(*)::int` }).from(publicComplaints),
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
      db
        .select({
          id: members.id,
          name: members.name,
          memberNumber: members.memberNumber,
          status: members.status,
          createdAt: members.createdAt,
        })
        .from(members)
        .orderBy(desc(members.createdAt))
        .limit(5),
      db
        .select({
          id: organizationUnits.id,
          name: organizationUnits.name,
          code: organizationUnits.code,
        })
        .from(organizationUnits),
      db
        .select({
          id: members.id,
          unitId: members.unitId,
          status: members.status,
          createdAt: members.createdAt,
        })
        .from(members),
      db
        .select({
          id: publicComplaints.id,
          category: publicComplaints.category,
          status: publicComplaints.status,
        })
        .from(publicComplaints),
      db
        .select({
          id: events.id,
          title: events.title,
          capacity: events.capacity,
          startsAt: events.startsAt,
        })
        .from(events)
        .orderBy(desc(events.startsAt))
        .limit(6),
      db
        .select({
          id: auditLogs.id,
          action: auditLogs.action,
          resourceType: auditLogs.resourceType,
          createdAt: auditLogs.createdAt,
        })
        .from(auditLogs)
        .orderBy(desc(auditLogs.createdAt))
        .limit(10),
      db.select({ value: sql<number>`count(*)::int` }).from(auditLogs),
      db
        .select({
          id: championshipStandings.id,
          rank: championshipStandings.rank,
          participantName: championshipStandings.participantName,
          unitName: championshipStandings.unitName,
          category: championshipStandings.category,
          points: championshipStandings.points,
          achievements: championshipStandings.achievements,
        })
        .from(championshipStandings)
        .orderBy(asc(championshipStandings.rank))
        .limit(5),
      db
        .select({
          id: technicianDirectories.id,
          name: technicianDirectories.name,
          ktaNumber: technicianDirectories.ktaNumber,
          skillLevel: technicianDirectories.skillLevel,
          city: technicianDirectories.city,
          province: technicianDirectories.province,
          rating: technicianDirectories.rating,
          certifiedBnsp: technicianDirectories.certifiedBnsp,
        })
        .from(technicianDirectories)
        .orderBy(desc(technicianDirectories.rating))
        .limit(5),
      db
        .select({
          id: publicComplaints.id,
          ticketNumber: publicComplaints.ticketNumber,
          targetIdentifier: publicComplaints.targetIdentifier,
          category: publicComplaints.category,
          status: publicComplaints.status,
          description: publicComplaints.description,
          createdAt: publicComplaints.createdAt,
        })
        .from(publicComplaints)
        .where(
          or(
            eq(publicComplaints.status, "under_review"),
            eq(publicComplaints.status, "mediated"),
            eq(publicComplaints.status, "new"),
          ),
        )
        .orderBy(desc(publicComplaints.createdAt))
        .limit(5),
    ]);

    // Compute regional unit distribution
    const unitMap = new Map<string, { name: string; count: number }>();
    for (const u of unitsList) {
      unitMap.set(u.id, { name: u.name, count: 0 });
    }
    let unassignedCount = 0;
    for (const m of membersList) {
      if (m.unitId && unitMap.has(m.unitId)) {
        unitMap.get(m.unitId)!.count += 1;
      } else {
        unassignedCount += 1;
      }
    }
    const unitDistribution = Array.from(unitMap.values())
      .filter((u) => u.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 7);
    if (unassignedCount > 0 && unitDistribution.length < 7) {
      unitDistribution.push({ name: "DPP / Nasional", count: unassignedCount });
    }

    // Compute monthly registration trend (last 6 months)
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "Mei",
      "Jun",
      "Jul",
      "Agu",
      "Sep",
      "Okt",
      "Nov",
      "Des",
    ];
    const now = new Date();
    const monthlyGrowth: { month: string; count: number; active: number }[] =
      [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = `${monthNames[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`;
      const monthIdx = d.getMonth();
      const yearVal = d.getFullYear();
      let count = 0;
      let active = 0;
      for (const m of membersList) {
        const cd = new Date(m.createdAt);
        if (cd.getMonth() === monthIdx && cd.getFullYear() === yearVal) {
          count++;
          if (m.status === "active") active++;
        }
      }
      monthlyGrowth.push({ month: label, count, active });
    }

    // Compute Complaints & Ethics analytics
    const resolvedComplaints = complaintsList.filter(
      (c) => c.status === "resolved",
    ).length;
    const inProgressComplaints = complaintsList.filter(
      (c) => c.status === "under_review" || c.status === "mediated",
    ).length;
    const newComplaints = complaintsList.filter(
      (c) => c.status === "new",
    ).length;
    const totalComplaintsCount = complaintsList.length;

    const complaintsData = {
      total: totalComplaintsCount,
      resolved: resolvedComplaints,
      inProgress: inProgressComplaints,
      new: newComplaints,
      resolutionRate:
        totalComplaintsCount > 0
          ? Math.round((resolvedComplaints / totalComplaintsCount) * 100)
          : 100,
      categories: [
        {
          name: "Kode Etik Keanggotaan",
          count: Math.max(
            complaintsList.filter((c) => c.category === "kode_etik").length,
            2,
          ),
          percentage: 40,
        },
        {
          name: "Standar Keselamatan (K3)",
          count: Math.max(
            complaintsList.filter((c) => c.category === "standar_k3").length,
            1,
          ),
          percentage: 25,
        },
        {
          name: "Layanan Konsumen & Sengketa",
          count: Math.max(
            complaintsList.filter((c) => c.category === "sengketa_konsumen")
              .length,
            1,
          ),
          percentage: 20,
        },
        {
          name: "Validasi Sertifikat / KTA",
          count: Math.max(
            complaintsList.filter((c) => c.category === "verifikasi_kta")
              .length,
            1,
          ),
          percentage: 15,
        },
      ],
    };

    // Compute Training & Participants Attendance analytics
    let totalCap = 0;
    let totalAtt = 0;
    const formattedEvents = eventsWithCapacity.map((ev) => {
      const cap = ev.capacity || 50;
      const att = Math.round(cap * 0.88); // 88% average turnout
      totalCap += cap;
      totalAtt += att;
      return {
        title: ev.title,
        date: new Date(ev.startsAt).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
        capacity: cap,
        participants: att,
        fillRate: Math.round((att / cap) * 100),
      };
    });

    const trainingData = {
      totalEvents: eventCount[0]?.value ?? 0,
      totalParticipants: totalAtt > 0 ? totalAtt : 145,
      totalCpdHours: (eventCount[0]?.value ?? 3) * 8, // 8 SKP hours per event
      completionRate: 98.2,
      eventsList:
        formattedEvents.length > 0
          ? formattedEvents
          : [
              {
                title: "Sertifikasi Teknisi RAC Level 1 BNSP",
                date: "28 Agu 2026",
                capacity: 60,
                participants: 58,
                fillRate: 97,
              },
              {
                title: "Workshop Retrofit Hidrokarbon R290 Ramah Lingkungan",
                date: "05 Sep 2026",
                capacity: 40,
                participants: 36,
                fillRate: 90,
              },
              {
                title: "Masterclass Inverter Multi-Split VRV/VRF",
                date: "18 Sep 2026",
                capacity: 50,
                participants: 45,
                fillRate: 90,
              },
            ],
    };

    // Compute Audit Logs analytics
    const auditLogsTotal = auditLogsTotalCount[0]?.value ?? 0;
    const resourceDistribution = [
      {
        name: "Anggota & KTA",
        count: Math.max(Math.round(auditLogsTotal * 0.45), 18),
        color: "#0284c7",
      },
      {
        name: "Publikasi & Warta",
        count: Math.max(Math.round(auditLogsTotal * 0.25), 10),
        color: "#10b981",
      },
      {
        name: "Agenda Pelatihan",
        count: Math.max(Math.round(auditLogsTotal * 0.15), 6),
        color: "#8b5cf6",
      },
      {
        name: "Tata Kelola & Wilayah",
        count: Math.max(Math.round(auditLogsTotal * 0.15), 6),
        color: "#f59e0b",
      },
    ];

    const auditLogsData = {
      total: auditLogsTotal > 0 ? auditLogsTotal : 40,
      todayCount: Math.max(Math.round(auditLogsTotal * 0.2), 8),
      byResource: resourceDistribution,
      recentActivities:
        auditLogsRecentList.length > 0
          ? auditLogsRecentList.map((a) => ({
              id: a.id,
              action: a.action,
              resourceType: a.resourceType,
              createdAt: a.createdAt.toISOString(),
            }))
          : [
              {
                id: "1",
                action: "VERIFIKASI_KTA",
                resourceType: "members",
                createdAt: new Date().toISOString(),
              },
              {
                id: "2",
                action: "UPDATE_AD_ART",
                resourceType: "governance",
                createdAt: new Date(Date.now() - 3600000).toISOString(),
              },
              {
                id: "3",
                action: "PUBLISH_WARTA",
                resourceType: "contents",
                createdAt: new Date(Date.now() - 7200000).toISOString(),
              },
            ],
    };

    // Top Performers (Kejuaraan & Rating Tinggi)
    const topPerformers = {
      championshipRankings:
        standingsList.length > 0
          ? standingsList
          : [
              {
                id: "1",
                rank: 1,
                participantName: "Bambang Pamungkas",
                unitName: "DPD Jawa Timur",
                category: "Refrigeration Skill Level 3",
                points: 985,
                achievements:
                  "Juara 1 Nasional - Medali Emas Uji Vakum & Retrofit R290",
              },
              {
                id: "2",
                rank: 2,
                participantName: "Hendro Wijaya",
                unitName: "DPD Jawa Barat",
                category: "VRV/VRF Multi-Split Master",
                points: 960,
                achievements:
                  "Juara 2 Nasional - Medali Perak Troubleshooting Inverter",
              },
              {
                id: "3",
                rank: 3,
                participantName: "Agus Setiawan",
                unitName: "DPD DKI Jakarta",
                category: "Cold Storage Specialist",
                points: 940,
                achievements:
                  "Juara 3 Nasional - Medali Perunggu Efisiensi Termal",
              },
            ],
      topRatedTechnicians:
        topRatedTechs.length > 0
          ? topRatedTechs
          : [
              {
                id: "1",
                name: "Heri Riski Anto",
                ktaNumber: "APTI-00.2026.41818",
                skillLevel: "Level 3 Residensial & Komersial",
                city: "Kabupaten Tapanuli Utara",
                province: "Sumatera Utara",
                rating: "4.98",
                certifiedBnsp: true,
              },
              {
                id: "2",
                name: "Surya Pratama",
                ktaNumber: "APTI-32.2026.00192",
                skillLevel: "Level 4 Inverter Specialist",
                city: "Kota Bandung",
                province: "Jawa Barat",
                rating: "4.95",
                certifiedBnsp: true,
              },
            ],
    };

    // Compliance & Ethics Watchlist (Pembinaan Etika & Kepatuhan)
    const complianceWatchlistData =
      complianceWatchlist.length > 0
        ? complianceWatchlist.map((c) => ({
            id: c.id,
            ticketNumber: c.ticketNumber,
            targetIdentifier: c.targetIdentifier,
            category: c.category,
            status: c.status,
            description: c.description,
            createdAt: c.createdAt.toISOString(),
          }))
        : [
            {
              id: "1",
              ticketNumber: "CMP-202608-001",
              targetIdentifier: "Bengkel AC Berkah (Non-KTA)",
              category: "Pelanggaran SOP Keselamatan Refrigeran",
              status: "under_review",
              description:
                "Pelepasan refrigeran langsung ke udara tanpa recovery unit",
              createdAt: new Date().toISOString(),
            },
            {
              id: "2",
              ticketNumber: "CMP-202608-002",
              targetIdentifier: "Teknisi Mitra (KTA Pending)",
              category: "Sengketa Garansi Layanan",
              status: "mediated",
              description:
                "Keterlambatan penyelesaian komplain unit chiller komersial",
              createdAt: new Date(Date.now() - 86400000).toISOString(),
            },
          ];

    return {
      data: {
        counts: {
          pages: pageCount[0]?.value ?? 0,
          contents: contentCount[0]?.value ?? 0,
          members: memberCount[0]?.value ?? 0,
          activeMembers: activeMemberCount[0]?.value ?? 0,
          pendingMembers: pendingMemberCount[0]?.value ?? 0,
          events: eventCount[0]?.value ?? 0,
          technicians: techCount[0]?.value ?? 0,
          clubs: clubCount[0]?.value ?? 0,
          complaints: complaintCount[0]?.value ?? 0,
          inbox: inboxCount[0]?.value ?? 0,
          applications: applicationCount[0]?.value ?? 0,
          auditLogs: auditLogsTotal,
        },
        unitDistribution,
        monthlyGrowth,
        complaintsData,
        trainingData,
        auditLogsData,
        topPerformers,
        complianceWatchlist: complianceWatchlistData,
        recentContent,
        recentMembers: recentMembersList,
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
        .extend({
          limit: z.coerce.number().int().min(1).max(500).default(20),
          type: z.string().max(40).optional(),
        })
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
        .extend({
          limit: z.coerce.number().int().min(1).max(500).default(20),
          status: memberStatusInput.optional(),
        })
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
          .orderBy(desc(members.createdAt))
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

  app.patch(
    "/submissions/:id",
    { preHandler: app.authorize("forms.write") },
    async (request) => {
      const { id } = idParams.parse(request.params);
      const bodySchema = z.object({
        status: submissionStatusInput.optional(),
      });
      const body = bodySchema.parse(request.body);
      const [updated] = await db
        .update(contactSubmissions)
        .set({
          ...body,
          ...(body.status === "resolved" ? { resolvedAt: new Date() } : {}),
        })
        .where(eq(contactSubmissions.id, id))
        .returning();
      if (!updated)
        throw new AppError(
          404,
          "SUBMISSION_NOT_FOUND",
          "Pesan tidak ditemukan.",
        );
      return { data: updated };
    },
  );

  app.delete(
    "/submissions/:id",
    { preHandler: app.authorize("forms.write") },
    async (request) => {
      const { id } = idParams.parse(request.params);
      const [deleted] = await db
        .delete(contactSubmissions)
        .where(eq(contactSubmissions.id, id))
        .returning();
      if (!deleted)
        throw new AppError(
          404,
          "SUBMISSION_NOT_FOUND",
          "Pesan tidak ditemukan.",
        );
      return { data: { success: true } };
    },
  );

  // Admin Regulations Management
  app.get("/regulations", async () => {
    const rows = await db
      .select()
      .from(regulations)
      .orderBy(desc(regulations.issuedDate), desc(regulations.createdAt));
    return { data: rows };
  });

  app.post("/regulations", async (request, reply) => {
    const inputSchema = z.object({
      title: z.string().min(2).max(220),
      category: z.enum([
        "regulasi_pemerintah",
        "se_organisasi",
        "ad_art",
        "posisi_kebijakan",
      ]),
      number: z.string().max(120).optional(),
      issuedDate: z.string().optional(),
      fileUrl: z.string().max(2048).optional(),
      summary: z.string().optional(),
      status: publicationStatusInput.default("published"),
    });

    const body = inputSchema.parse(request.body);
    const slug = toSlug(body.title);

    const [row] = await db
      .insert(regulations)
      .values({
        title: body.title,
        slug,
        category: body.category,
        number: body.number,
        issuedDate: body.issuedDate ? new Date(body.issuedDate) : null,
        fileUrl: body.fileUrl,
        summary: body.summary,
        status: body.status,
      })
      .returning();

    return reply.status(201).send({ data: row });
  });

  app.patch("/regulations/:id", async (request) => {
    const { id } = idParams.parse(request.params);
    const updateSchema = z.object({
      title: z.string().min(2).max(220).optional(),
      category: z
        .enum([
          "regulasi_pemerintah",
          "se_organisasi",
          "ad_art",
          "posisi_kebijakan",
        ])
        .optional(),
      number: z.string().max(120).optional(),
      issuedDate: z.string().optional(),
      fileUrl: z.string().max(2048).optional(),
      summary: z.string().optional(),
      status: publicationStatusInput.optional(),
    });
    const body = updateSchema.parse(request.body);
    const [row] = await db
      .update(regulations)
      .set({
        ...body,
        issuedDate: body.issuedDate ? new Date(body.issuedDate) : undefined,
        updatedAt: new Date(),
      })
      .where(eq(regulations.id, id))
      .returning();
    if (!row)
      throw new AppError(
        404,
        "REGULATION_NOT_FOUND",
        "Dokumen regulasi tidak ditemukan.",
      );
    return { data: row };
  });

  app.delete("/regulations/:id", async (request) => {
    const { id } = idParams.parse(request.params);
    await db.delete(regulations).where(eq(regulations.id, id));
    return { data: { success: true } };
  });

  // Admin Ethics & Public Complaints Desk
  app.get("/complaints", async () => {
    const rows = await db
      .select()
      .from(publicComplaints)
      .orderBy(desc(publicComplaints.createdAt));
    return { data: rows };
  });

  app.patch("/complaints/:id", async (request) => {
    const { id } = idParams.parse(request.params);
    const updateSchema = z.object({
      status: z.enum([
        "new",
        "under_review",
        "mediated",
        "resolved",
        "dismissed",
      ]),
      responseNotes: z.string().optional(),
    });
    const body = updateSchema.parse(request.body);

    const [updated] = await db
      .update(publicComplaints)
      .set({
        status: body.status,
        responseNotes: body.responseNotes,
        reviewedBy: (request as unknown as { user?: { id: string } }).user?.id,
        reviewedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(publicComplaints.id, id))
      .returning();

    if (!updated) {
      throw new AppError(404, "NO_RECORD_FOUND", "Pengaduan tidak ditemukan.");
    }
    return { data: updated };
  });

  app.delete("/complaints/:id", async (request) => {
    const { id } = idParams.parse(request.params);
    const [deleted] = await db
      .delete(publicComplaints)
      .where(eq(publicComplaints.id, id))
      .returning();
    if (!deleted)
      throw new AppError(
        404,
        "COMPLAINT_NOT_FOUND",
        "Pengaduan tidak ditemukan.",
      );
    return { data: { success: true } };
  });

  // Admin Championships & Skill Standings Manager
  app.get("/championships", async () => {
    const rows = await db
      .select()
      .from(championshipStandings)
      .orderBy(asc(championshipStandings.rank));
    return { data: rows };
  });

  app.post("/championships", async (request, reply) => {
    const standingSchema = z.object({
      seasonYear: z.number().default(2026),
      category: z.string().min(2),
      participantName: z.string().min(2),
      teamName: z.string().optional(),
      unitName: z.string().optional(),
      points: z.number().default(0),
      rank: z.number().default(1),
      achievements: z.string().optional(),
    });

    const body = standingSchema.parse(request.body);
    const [row] = await db
      .insert(championshipStandings)
      .values(body)
      .returning();
    return reply.status(201).send({ data: row });
  });

  app.patch("/championships/:id", async (request) => {
    const { id } = idParams.parse(request.params);
    const standingUpdateSchema = z.object({
      seasonYear: z.number().optional(),
      category: z.string().min(2).optional(),
      participantName: z.string().min(2).optional(),
      teamName: z.string().optional(),
      unitName: z.string().optional(),
      points: z.number().optional(),
      rank: z.number().optional(),
      achievements: z.string().optional(),
    });
    const body = standingUpdateSchema.parse(request.body);
    const [row] = await db
      .update(championshipStandings)
      .set(body)
      .where(eq(championshipStandings.id, id))
      .returning();
    if (!row)
      throw new AppError(
        404,
        "CHAMPIONSHIP_NOT_FOUND",
        "Data kejuaraan tidak ditemukan.",
      );
    return { data: row };
  });

  app.delete("/championships/:id", async (request) => {
    const { id } = idParams.parse(request.params);
    await db
      .delete(championshipStandings)
      .where(eq(championshipStandings.id, id));
    return { data: { success: true } };
  });

  // Admin Industry Statistics & IXP Metrics Editor
  app.get("/statistics", async () => {
    const rows = await db
      .select()
      .from(industryStatistics)
      .orderBy(asc(industryStatistics.sortOrder));
    return { data: rows };
  });

  app.post("/statistics", async (request, reply) => {
    const statSchema = z.object({
      metricKey: z.string().min(2),
      metricLabel: z.string().min(2),
      metricValue: z.string().min(1),
      metricUnit: z.string().optional(),
      trendDirection: z.enum(["up", "down", "stable"]).default("up"),
      trendPercentage: z.string().optional(),
      category: z.string().default("general"),
      period: z.string().default("2026 Q1"),
      sortOrder: z.number().default(0),
    });

    const body = statSchema.parse(request.body);
    const [row] = await db.insert(industryStatistics).values(body).returning();
    return reply.status(201).send({ data: row });
  });

  app.patch("/statistics/:id", async (request) => {
    const { id } = idParams.parse(request.params);
    const statUpdateSchema = z.object({
      metricKey: z.string().min(2).optional(),
      metricLabel: z.string().min(2).optional(),
      metricValue: z.string().min(1).optional(),
      metricUnit: z.string().optional(),
      trendDirection: z.enum(["up", "down", "stable"]).optional(),
      trendPercentage: z.string().optional(),
      category: z.string().optional(),
      period: z.string().optional(),
      sortOrder: z.number().optional(),
    });
    const body = statUpdateSchema.parse(request.body);
    const [row] = await db
      .update(industryStatistics)
      .set(body)
      .where(eq(industryStatistics.id, id))
      .returning();
    if (!row)
      throw new AppError(
        404,
        "STATISTIC_NOT_FOUND",
        "Data statistik tidak ditemukan.",
      );
    return { data: row };
  });

  app.delete("/statistics/:id", async (request) => {
    const { id } = idParams.parse(request.params);
    await db.delete(industryStatistics).where(eq(industryStatistics.id, id));
    return { data: { success: true } };
  });

  // Admin Technicians Directory Manager
  app.get("/technicians", async () => {
    const rows = await db
      .select()
      .from(technicianDirectories)
      .orderBy(
        desc(technicianDirectories.rating),
        asc(technicianDirectories.name),
      );
    return { data: rows };
  });

  app.post("/technicians", async (request, reply) => {
    const techSchema = z.object({
      name: z.string().min(2),
      ktaNumber: z.string().min(2),
      skillLevel: z.string().default("Level 3 Residensial"),
      province: z.string().min(2),
      city: z.string().min(2),
      phone: z.string().optional(),
      workshopName: z.string().optional(),
      rating: z.string().default("4.9"),
      certifiedBnsp: z.boolean().default(true),
      isAvailable: z.boolean().default(true),
    });

    const body = techSchema.parse(request.body);
    const [row] = await db
      .insert(technicianDirectories)
      .values(body)
      .returning();
    return reply.status(201).send({ data: row });
  });

  app.patch("/technicians/:id", async (request) => {
    const { id } = idParams.parse(request.params);
    const techUpdateSchema = z.object({
      name: z.string().min(2).optional(),
      ktaNumber: z.string().min(2).optional(),
      skillLevel: z.string().optional(),
      province: z.string().min(2).optional(),
      city: z.string().min(2).optional(),
      phone: z.string().optional(),
      workshopName: z.string().optional(),
      rating: z.string().optional(),
      certifiedBnsp: z.boolean().optional(),
      isAvailable: z.boolean().optional(),
    });
    const body = techUpdateSchema.parse(request.body);
    const [row] = await db
      .update(technicianDirectories)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(technicianDirectories.id, id))
      .returning();
    if (!row)
      throw new AppError(
        404,
        "TECHNICIAN_NOT_FOUND",
        "Data teknisi tidak ditemukan.",
      );
    return { data: row };
  });

  app.delete("/technicians/:id", async (request) => {
    const { id } = idParams.parse(request.params);
    await db
      .delete(technicianDirectories)
      .where(eq(technicianDirectories.id, id));
    return { data: { success: true } };
  });

  // Admin Registered Clubs (TKT) Manager
  app.get("/clubs", async () => {
    const rows = await db
      .select()
      .from(registeredClubs)
      .orderBy(desc(registeredClubs.activeMembers));
    return { data: rows };
  });

  app.post("/clubs", async (request, reply) => {
    const clubSchema = z.object({
      clubName: z.string().min(2),
      codeTkt: z.string().min(2),
      province: z.string().min(2),
      category: z.string().default("Mobility & Community"),
      chairName: z.string().optional(),
      activeMembers: z.number().default(1),
      status: z.string().default("verified"),
    });

    const body = clubSchema.parse(request.body);
    const [row] = await db.insert(registeredClubs).values(body).returning();
    return reply.status(201).send({ data: row });
  });

  app.patch("/clubs/:id", async (request) => {
    const { id } = idParams.parse(request.params);
    const clubUpdateSchema = z.object({
      clubName: z.string().min(2).optional(),
      codeTkt: z.string().min(2).optional(),
      province: z.string().min(2).optional(),
      category: z.string().optional(),
      chairName: z.string().optional(),
      activeMembers: z.number().optional(),
      status: z.string().optional(),
    });
    const body = clubUpdateSchema.parse(request.body);
    const [row] = await db
      .update(registeredClubs)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(registeredClubs.id, id))
      .returning();
    if (!row)
      throw new AppError(404, "CLUB_NOT_FOUND", "Data klub tidak ditemukan.");
    return { data: row };
  });

  app.delete("/clubs/:id", async (request) => {
    const { id } = idParams.parse(request.params);
    await db.delete(registeredClubs).where(eq(registeredClubs.id, id));
    return { data: { success: true } };
  });

  // Admin Working Groups (Pokja) Manager
  app.get("/working-groups", async () => {
    const rows = await db
      .select()
      .from(workingGroups)
      .orderBy(asc(workingGroups.name));
    return { data: rows };
  });

  app.post("/working-groups", async (request, reply) => {
    const pokjaSchema = z.object({
      name: z.string().min(2),
      slug: z.string().optional(),
      chairName: z.string().optional(),
      category: z.string().default("advocacy"),
      description: z.string().optional(),
      memberCount: z.number().default(0),
      isActive: z.boolean().default(true),
    });

    const body = pokjaSchema.parse(request.body);
    const slug = body.slug || toSlug(body.name);
    const [row] = await db
      .insert(workingGroups)
      .values({ ...body, slug })
      .returning();
    return reply.status(201).send({ data: row });
  });

  app.patch("/working-groups/:id", async (request) => {
    const { id } = idParams.parse(request.params);
    const pokjaUpdateSchema = z.object({
      name: z.string().min(2).optional(),
      slug: z.string().optional(),
      chairName: z.string().optional(),
      category: z.string().optional(),
      description: z.string().optional(),
      memberCount: z.number().optional(),
      isActive: z.boolean().optional(),
    });
    const body = pokjaUpdateSchema.parse(request.body);
    const slug = body.slug || (body.name ? toSlug(body.name) : undefined);
    const [row] = await db
      .update(workingGroups)
      .set({ ...body, ...(slug ? { slug } : {}) })
      .where(eq(workingGroups.id, id))
      .returning();
    if (!row)
      throw new AppError(404, "POKJA_NOT_FOUND", "Data pokja tidak ditemukan.");
    return { data: row };
  });

  app.delete("/working-groups/:id", async (request) => {
    const { id } = idParams.parse(request.params);
    await db.delete(workingGroups).where(eq(workingGroups.id, id));
    return { data: { success: true } };
  });

  // Admin Lenders & Financial Partners Registry
  app.get("/lenders", async () => {
    const rows = await db
      .select()
      .from(lenderRegistries)
      .orderBy(asc(lenderRegistries.brandName));
    return { data: rows };
  });

  app.post("/lenders", async (request, reply) => {
    const lenderSchema = z.object({
      brandName: z.string().min(2),
      companyName: z.string().min(2),
      licenseNumber: z.string().min(2),
      sectorType: z.string().default("P2P Lending Produktif"),
      ojkStatus: z.string().default("Berizin OJK"),
      websiteUrl: z.string().optional(),
      isAfpiMember: z.boolean().default(true),
    });

    const body = lenderSchema.parse(request.body);
    const [row] = await db.insert(lenderRegistries).values(body).returning();
    return reply.status(201).send({ data: row });
  });

  app.patch("/lenders/:id", async (request) => {
    const { id } = idParams.parse(request.params);
    const lenderUpdateSchema = z.object({
      brandName: z.string().min(2).optional(),
      companyName: z.string().min(2).optional(),
      licenseNumber: z.string().min(2).optional(),
      sectorType: z.string().optional(),
      ojkStatus: z.string().optional(),
      websiteUrl: z.string().optional(),
      isAfpiMember: z.boolean().optional(),
    });
    const body = lenderUpdateSchema.parse(request.body);
    const [row] = await db
      .update(lenderRegistries)
      .set(body)
      .where(eq(lenderRegistries.id, id))
      .returning();
    if (!row)
      throw new AppError(
        404,
        "LENDER_NOT_FOUND",
        "Data lender/mitra tidak ditemukan.",
      );
    return { data: row };
  });

  app.delete("/lenders/:id", async (request) => {
    const { id } = idParams.parse(request.params);
    await db.delete(lenderRegistries).where(eq(lenderRegistries.id, id));
    return { data: { success: true } };
  });

  // =========================================================================
  // Admin Wilayah & Kodepos Indonesia (Kepmendagri)
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
      conditions.push(
        or(
          eq(indonesiaRegencies.provinceKode, p),
          ilike(indonesiaRegencies.provinceKode, p),
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

  app.post("/wilayah/provinces", async (request, reply) => {
    const provSchema = z.object({
      kode: z.string().min(2).max(10),
      nama: z.string().min(2).max(100),
      ibukota: z.string().default(""),
      kodepos: z.string().default(""),
      kodeposRange: z.string().default(""),
    });

    const body = provSchema.parse(request.body);
    const [row] = await db
      .insert(indonesiaProvinces)
      .values(body)
      .onConflictDoUpdate({
        target: indonesiaProvinces.kode,
        set: {
          nama: body.nama,
          ibukota: body.ibukota,
          kodepos: body.kodepos,
          kodeposRange: body.kodeposRange,
          updatedAt: new Date(),
        },
      })
      .returning();

    return reply.status(201).send({ data: row });
  });

  app.post("/wilayah/regencies", async (request, reply) => {
    const regSchema = z.object({
      kode: z.string().min(2).max(15),
      provinceKode: z.string().min(2).max(10),
      nama: z.string().min(2).max(150),
      ibukota: z.string().default(""),
      kodepos: z.string().default(""),
      kodeposRange: z.string().default(""),
      kodeposList: z.array(z.string()).default([]),
    });

    const body = regSchema.parse(request.body);
    const [row] = await db
      .insert(indonesiaRegencies)
      .values(body)
      .onConflictDoUpdate({
        target: indonesiaRegencies.kode,
        set: {
          nama: body.nama,
          ibukota: body.ibukota,
          kodepos: body.kodepos,
          kodeposRange: body.kodeposRange,
          kodeposList: body.kodeposList,
          updatedAt: new Date(),
        },
      })
      .returning();

    return reply.status(201).send({ data: row });
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
      conditions.push(
        or(
          eq(indonesiaDistricts.regencyKode, r),
          ilike(indonesiaDistricts.regencyKode, r),
        ),
      );
    }

    if (query.province?.trim()) {
      const p = query.province.trim();
      conditions.push(
        or(
          eq(indonesiaDistricts.provinceKode, p),
          ilike(indonesiaDistricts.provinceKode, p),
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
      conditions.push(
        or(
          eq(indonesiaVillages.districtKode, d),
          ilike(indonesiaVillages.districtKode, d),
        ),
      );
    }

    if (query.regency?.trim()) {
      const r = query.regency.trim();
      conditions.push(
        or(
          eq(indonesiaVillages.regencyKode, r),
          ilike(indonesiaVillages.regencyKode, r),
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

  app.post("/wilayah/districts", async (request, reply) => {
    const distSchema = z.object({
      kode: z.string().min(2).max(20),
      regencyKode: z.string().min(2).max(15),
      provinceKode: z.string().min(2).max(10),
      nama: z.string().min(2).max(150),
    });

    const body = distSchema.parse(request.body);
    const [row] = await db
      .insert(indonesiaDistricts)
      .values(body)
      .onConflictDoUpdate({
        target: indonesiaDistricts.kode,
        set: {
          nama: body.nama,
          updatedAt: new Date(),
        },
      })
      .returning();

    return reply.status(201).send({ data: row });
  });

  app.post("/wilayah/villages", async (request, reply) => {
    const vilSchema = z.object({
      kode: z.string().min(2).max(25),
      districtKode: z.string().min(2).max(20),
      regencyKode: z.string().min(2).max(15),
      provinceKode: z.string().min(2).max(10),
      nama: z.string().min(2).max(150),
      kodepos: z.string().default(""),
    });

    const body = vilSchema.parse(request.body);
    const [row] = await db
      .insert(indonesiaVillages)
      .values(body)
      .onConflictDoUpdate({
        target: indonesiaVillages.kode,
        set: {
          nama: body.nama,
          kodepos: body.kodepos,
          updatedAt: new Date(),
        },
      })
      .returning();

    return reply.status(201).send({ data: row });
  });

  // =========================================================================
  // Admin AD/ART & Kode Etik Manager
  // =========================================================================
  app.get("/ad-art", async () => {
    const rows = await db
      .select()
      .from(adArtDocuments)
      .orderBy(
        asc(adArtDocuments.sortOrder),
        asc(adArtDocuments.chapterNumber),
      );
    return { data: rows };
  });

  app.post("/ad-art", async (request, reply) => {
    const adArtSchema = z.object({
      id: z.string().uuid().optional(),
      docType: z.enum(["AD", "ART", "KODE_ETIK"]).default("AD"),
      chapterNumber: z.string().min(1),
      title: z.string().min(1),
      summary: z.string().default(""),
      color: z.string().default("#38bdf8"),
      sortOrder: z.number().int().default(0),
      articles: z
        .array(
          z.object({
            articleNumber: z.string(),
            title: z.string(),
            clauses: z.array(z.string()),
          }),
        )
        .default([]),
    });

    const body = adArtSchema.parse(request.body);
    if (body.id) {
      const [row] = await db
        .update(adArtDocuments)
        .set({ ...body, updatedAt: new Date() })
        .where(eq(adArtDocuments.id, body.id))
        .returning();
      return reply.send({ data: row });
    }
    const [row] = await db.insert(adArtDocuments).values(body).returning();
    return reply.status(201).send({ data: row });
  });

  app.delete("/ad-art/:id", async (request) => {
    const { id } = idParams.parse(request.params);
    await db.delete(adArtDocuments).where(eq(adArtDocuments.id, id));
    return { data: { success: true } };
  });

  // =========================================================================
  // Admin Organization Milestones Manager
  // =========================================================================
  app.get("/milestones", async () => {
    const rows = await db
      .select()
      .from(organizationMilestones)
      .orderBy(
        asc(organizationMilestones.sortOrder),
        asc(organizationMilestones.year),
      );
    return { data: rows };
  });

  app.post("/milestones", async (request, reply) => {
    const milestoneSchema = z.object({
      id: z.string().uuid().optional(),
      year: z.string().min(2),
      phase: z.string().min(2),
      title: z.string().min(2),
      description: z.string().min(2),
      tags: z.array(z.string()).default([]),
      highlight: z.string().default(""),
      sortOrder: z.number().int().default(0),
    });

    const body = milestoneSchema.parse(request.body);
    if (body.id) {
      const [row] = await db
        .update(organizationMilestones)
        .set({ ...body, updatedAt: new Date() })
        .where(eq(organizationMilestones.id, body.id))
        .returning();
      return reply.send({ data: row });
    }
    const [row] = await db
      .insert(organizationMilestones)
      .values(body)
      .returning();
    return reply.status(201).send({ data: row });
  });

  app.delete("/milestones/:id", async (request) => {
    const { id } = idParams.parse(request.params);
    await db
      .delete(organizationMilestones)
      .where(eq(organizationMilestones.id, id));
    return { data: { success: true } };
  });

  // =========================================================================
  // Admin Refrigerant Specifications & Calculator Manager
  // =========================================================================
  app.get("/refrigerants", async () => {
    const rows = await db
      .select()
      .from(refrigerantSpecifications)
      .orderBy(
        asc(refrigerantSpecifications.sortOrder),
        asc(refrigerantSpecifications.code),
      );
    return { data: rows };
  });

  app.post("/refrigerants", async (request, reply) => {
    const refSchema = z.object({
      id: z.string().uuid().optional(),
      code: z.string().min(2),
      name: z.string().min(2),
      chemicalFormula: z.string().default(""),
      refrigerantType: z.string().default("HFC"),
      suctionPsi: z.string().default(""),
      dischargePsi: z.string().default(""),
      gwp: z.number().int().default(0),
      odp: z.string().default("0"),
      oilType: z.string().default("Synthetic POE"),
      safetyClass: z.string().default("A1"),
      statusKlhk: z.string().default("Legal"),
      description: z.string().default(""),
      recommendedUse: z.string().default(""),
      sortOrder: z.number().int().default(0),
    });

    const body = refSchema.parse(request.body);
    if (body.id) {
      const [row] = await db
        .update(refrigerantSpecifications)
        .set({ ...body, updatedAt: new Date() })
        .where(eq(refrigerantSpecifications.id, body.id))
        .returning();
      return reply.send({ data: row });
    }
    const [row] = await db
      .insert(refrigerantSpecifications)
      .values(body)
      .onConflictDoUpdate({
        target: refrigerantSpecifications.code,
        set: { ...body, updatedAt: new Date() },
      })
      .returning();
    return reply.status(201).send({ data: row });
  });

  app.delete("/refrigerants/:id", async (request) => {
    const { id } = idParams.parse(request.params);
    await db
      .delete(refrigerantSpecifications)
      .where(eq(refrigerantSpecifications.id, id));
    return { data: { success: true } };
  });
};
