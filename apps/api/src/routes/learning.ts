import { creditSchemeInputSchema } from "@openorg/contracts";
import { and, asc, desc, eq, or, sql } from "drizzle-orm";
import type { FastifyPluginAsync, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { db } from "../db/client";
import {
  auditLogs,
  learningActivities,
  learningAttendance,
  learningCreditLedger,
  learningCreditSchemes,
  learningEnrollments,
  memberAccounts,
  members,
} from "../db/schema";
import { AppError } from "../lib/errors";

const _idParams = z.object({ id: z.string().uuid() });
const activityInput = z.object({
  eventId: z.string().uuid().nullable().optional(),
  creditSchemeId: z.string().uuid().nullable().optional(),
  title: z.string().trim().min(2).max(200),
  code: z.string().trim().min(2).max(80),
  deliveryMode: z
    .enum(["onsite", "online", "hybrid", "self_paced"])
    .default("onsite"),
  creditAmountHundredths: z.number().int().min(0).default(100),
  capacity: z.number().int().min(1).nullable().optional(),
  status: z
    .enum(["draft", "open", "in_progress", "completed", "cancelled"])
    .default("open"),
  startsAt: z
    .string()
    .datetime()
    .transform((v) => new Date(v)),
  endsAt: z
    .string()
    .datetime()
    .transform((v) => new Date(v))
    .nullable()
    .optional(),
});

const enrollmentInput = z.object({
  activityId: z.string().uuid(),
});

async function audit(
  request: FastifyRequest,
  action: string,
  resourceType: string,
  resourceId: string,
  before?: unknown,
  after?: unknown,
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

export const adminLearningRoutes: FastifyPluginAsync = async (app) => {
  app.get(
    "/schemes",
    { preHandler: app.authorize("learning.read") },
    async () => {
      const rows = await db
        .select()
        .from(learningCreditSchemes)
        .orderBy(asc(learningCreditSchemes.name));
      return { data: rows };
    },
  );

  app.post(
    "/schemes",
    { preHandler: app.authorize("learning.write") },
    async (request, reply) => {
      const input = creditSchemeInputSchema.parse(request.body);
      const [created] = await db
        .insert(learningCreditSchemes)
        .values(input)
        .returning();
      await audit(
        request,
        "learning_scheme.create",
        "learning_credit_scheme",
        created?.id ?? "",
        undefined,
        created,
      );
      return reply.status(201).send({ data: created });
    },
  );

  app.get(
    "/activities",
    { preHandler: app.authorize("learning.read") },
    async () => {
      const rows = await db
        .select({
          activity: learningActivities,
          schemeName: learningCreditSchemes.name,
        })
        .from(learningActivities)
        .leftJoin(
          learningCreditSchemes,
          eq(learningActivities.creditSchemeId, learningCreditSchemes.id),
        )
        .orderBy(desc(learningActivities.startsAt));
      return { data: rows };
    },
  );

  app.post(
    "/activities",
    { preHandler: app.authorize("learning.write") },
    async (request, reply) => {
      const input = activityInput.parse(request.body);
      const [created] = await db
        .insert(learningActivities)
        .values(input)
        .returning();
      await audit(
        request,
        "learning_activity.create",
        "learning_activity",
        created?.id ?? "",
        undefined,
        created,
      );
      return reply.status(201).send({ data: created });
    },
  );

  app.get(
    "/overview",
    { preHandler: app.authorize("learning.read") },
    async () => {
      const [rawSchemes, rawActivities, rawEnrollments, ledger, memberList] =
        await Promise.all([
          db.select().from(learningCreditSchemes),
          db.select().from(learningActivities),
          db.select().from(learningEnrollments),
          db.select().from(learningCreditLedger),
          db.select().from(members),
        ]);

      const memberMap = new Map(memberList.map((m) => [m.id, m]));
      const schemeMap = new Map(rawSchemes.map((s) => [s.id, s]));

      const schemes = rawSchemes.map((s) => ({
        ...s,
        unitLabel: s.unitName,
      }));

      const activities = rawActivities.map((a) => ({
        ...a,
        creditAmount: Math.round(a.creditAmountHundredths) / 100,
        scheme: a.creditSchemeId ? schemeMap.get(a.creditSchemeId) : null,
      }));

      const enrollments = rawEnrollments.map((e) => ({
        ...e,
        member: memberMap.get(e.memberId) ?? {
          id: e.memberId,
          name: "Anggota",
          memberNumber: "MEM-0000",
        },
        attendance: {
          status: e.status === "confirmed" ? "present" : e.status,
        },
      }));

      return {
        data: {
          schemes,
          activities,
          enrollments,
          ledger,
        },
      };
    },
  );

  app.post(
    "/award",
    { preHandler: app.authorize("learning.write") },
    async (request) => {
      const input = z
        .object({
          memberId: z.string().uuid(),
          schemeId: z.string().uuid(),
          amount: z.number().positive(),
          description: z.string().optional(),
        })
        .parse(request.body);

      const [created] = await db
        .insert(learningCreditLedger)
        .values({
          memberId: input.memberId,
          schemeId: input.schemeId,
          entryType: "earned",
          creditAmountHundredths: Math.round(input.amount * 100),
          notes: input.description ?? "Pemberian Kredit SKP Pelatihan",
        })
        .returning();

      return { data: created };
    },
  );

  app.delete(
    "/activities/:id",
    { preHandler: app.authorize("learning.write") },
    async (request, reply) => {
      const { id } = z.object({ id: z.string().uuid() }).parse(request.params);
      const [deleted] = await db
        .delete(learningActivities)
        .where(eq(learningActivities.id, id))
        .returning();
      if (!deleted)
        throw new AppError(
          404,
          "ACTIVITY_NOT_FOUND",
          "Kegiatan tidak ditemukan.",
        );
      return reply.status(204).send();
    },
  );

  app.delete(
    "/enrollments/:id",
    { preHandler: app.authorize("learning.write") },
    async (request, reply) => {
      const { id } = z.object({ id: z.string().uuid() }).parse(request.params);
      const [deleted] = await db
        .delete(learningEnrollments)
        .where(eq(learningEnrollments.id, id))
        .returning();
      if (!deleted)
        throw new AppError(
          404,
          "ENROLLMENT_NOT_FOUND",
          "Pendaftaran tidak ditemukan.",
        );
      return reply.status(204).send();
    },
  );
};

export const memberLearningRoutes: FastifyPluginAsync = async (app) => {
  app.get(
    "/learning",
    { preHandler: app.authenticateMember },
    async (request) => {
      const member = request.currentMember;
      if (!member)
        throw new AppError(401, "MEMBER_UNAUTHENTICATED", "Sign in required.");

      const [
        rawActivities,
        rawSchemes,
        rawEnrollments,
        rawAttendance,
        rawLedger,
      ] = await Promise.all([
        db
          .select()
          .from(learningActivities)
          .orderBy(asc(learningActivities.startsAt)),
        db.select().from(learningCreditSchemes),
        db
          .select()
          .from(learningEnrollments)
          .where(eq(learningEnrollments.memberId, member.id)),
        db.select().from(learningAttendance),
        db
          .select()
          .from(learningCreditLedger)
          .where(eq(learningCreditLedger.memberId, member.id))
          .orderBy(desc(learningCreditLedger.createdAt)),
      ]);

      const schemeMap = new Map(rawSchemes.map((s) => [s.id, s]));
      const activityMap = new Map(rawActivities.map((a) => [a.id, a]));
      const attendanceMap = new Map(
        rawAttendance.map((att) => [att.enrollmentId, att]),
      );

      const catalog = rawActivities
        .filter((a) => a.status === "open")
        .map((a) => {
          const scheme = a.creditSchemeId
            ? schemeMap.get(a.creditSchemeId)
            : null;
          const meta = (a.metadata ?? {}) as Record<string, unknown>;
          return {
            id: a.id,
            title: a.title,
            code: a.code,
            description: (meta.description as string) ?? null,
            deliveryMode: a.deliveryMode,
            locationName: (meta.locationName as string) ?? null,
            startsAt: a.startsAt.toISOString(),
            capacity: a.capacity,
            creditAmount: (a.creditAmountHundredths || 0) / 100,
            scheme: scheme
              ? {
                  id: scheme.id,
                  code: scheme.code,
                  name: scheme.name,
                  unitLabel: scheme.unitName,
                }
              : null,
          };
        });

      const enrollments = rawEnrollments.map((e) => {
        const activity = activityMap.get(e.activityId);
        const scheme =
          activity && activity.creditSchemeId
            ? schemeMap.get(activity.creditSchemeId)
            : null;
        const attendance = attendanceMap.get(e.id);
        return {
          id: e.id,
          activityId: e.activityId,
          status: e.status,
          activity: activity
            ? {
                id: activity.id,
                title: activity.title,
                startsAt: activity.startsAt.toISOString(),
                creditAmount: (activity.creditAmountHundredths || 0) / 100,
              }
            : {
                id: e.activityId,
                title: "Aktivitas",
                startsAt: new Date().toISOString(),
                creditAmount: 0,
              },
          scheme: scheme
            ? { code: scheme.code, unitLabel: scheme.unitName }
            : null,
          attendance: attendance ? { status: attendance.status } : null,
        };
      });

      const balanceMap = new Map<string, number>();
      for (const entry of rawLedger) {
        const current = balanceMap.get(entry.schemeId) ?? 0;
        balanceMap.set(
          entry.schemeId,
          current + (entry.creditAmountHundredths || 0) / 100,
        );
      }

      const balances = rawSchemes.map((scheme) => ({
        amount: balanceMap.get(scheme.id) ?? 0,
        scheme: {
          id: scheme.id,
          code: scheme.code,
          name: scheme.name,
          unitLabel: scheme.unitName,
        },
      }));

      const ledger = rawLedger.map((entry) => {
        const scheme = schemeMap.get(entry.schemeId);
        const activity = entry.activityId
          ? activityMap.get(entry.activityId)
          : null;
        return {
          id: entry.id,
          amount: (entry.creditAmountHundredths || 0) / 100,
          entryType: entry.entryType,
          reason: entry.notes ?? "Kredit pelatihan",
          postedAt: entry.createdAt.toISOString(),
          activityTitle: activity?.title ?? null,
          scheme: {
            code: scheme?.code ?? "CREDIT",
            unitLabel: scheme?.unitName ?? "kredit",
          },
        };
      });

      return {
        data: {
          catalog,
          enrollments,
          balances,
          ledger,
        },
      };
    },
  );

  app.get(
    "/learning/activities",
    { preHandler: app.authenticateMember },
    async () => {
      const rows = await db
        .select()
        .from(learningActivities)
        .where(eq(learningActivities.status, "open"))
        .orderBy(asc(learningActivities.startsAt));
      return { data: rows };
    },
  );

  const handleEnrollment = async (
    activityId: string,
    member: typeof members.$inferSelect,
    reply: FastifyReply,
  ) => {
    const [activity] = await db
      .select()
      .from(learningActivities)
      .where(eq(learningActivities.id, activityId))
      .limit(1);

    if (!activity) {
      throw new AppError(
        404,
        "ACTIVITY_NOT_FOUND",
        "Kegiatan pelatihan tidak ditemukan.",
      );
    }

    if (activity.status !== "open" && activity.status !== "in_progress") {
      throw new AppError(
        400,
        "ACTIVITY_NOT_OPEN",
        "Pendaftaran untuk kegiatan pelatihan ini tidak tersedia atau sudah ditutup.",
      );
    }

    // Check existing enrollment
    const [existing] = await db
      .select()
      .from(learningEnrollments)
      .where(
        and(
          eq(learningEnrollments.activityId, activityId),
          eq(learningEnrollments.memberId, member.id),
        ),
      )
      .limit(1);

    if (existing) {
      if (existing.status === "cancelled") {
        const [updated] = await db
          .update(learningEnrollments)
          .set({ status: "registered", registeredAt: new Date() })
          .where(eq(learningEnrollments.id, existing.id))
          .returning();
        return reply.status(200).send({ data: updated });
      }
      return reply.status(200).send({ data: existing });
    }

    // Determine status based on capacity
    let status: "registered" | "waitlisted" = "registered";
    if (activity.capacity && activity.capacity > 0) {
      const [countRow] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(learningEnrollments)
        .where(
          and(
            eq(learningEnrollments.activityId, activityId),
            or(
              eq(learningEnrollments.status, "registered"),
              eq(learningEnrollments.status, "confirmed"),
            ),
          ),
        );

      const currentCount = countRow?.count ?? 0;
      if (currentCount >= activity.capacity) {
        status = "waitlisted";
      }
    }

    const [created] = await db
      .insert(learningEnrollments)
      .values({
        activityId,
        memberId: member.id,
        status,
      })
      .returning();

    return reply.status(201).send({ data: created });
  };

  app.post(
    "/learning/activities/:id/enroll",
    { preHandler: app.authenticateMember },
    async (request, reply) => {
      const { id } = z.object({ id: z.string().uuid() }).parse(request.params);
      const member = request.currentMember;
      if (!member)
        throw new AppError(401, "MEMBER_UNAUTHENTICATED", "Sign in required.");
      return handleEnrollment(id, member, reply);
    },
  );

  app.post(
    "/learning/enroll",
    { preHandler: app.authenticateMember },
    async (request, reply) => {
      const input = enrollmentInput.parse(request.body);
      const member = request.currentMember;
      if (!member)
        throw new AppError(401, "MEMBER_UNAUTHENTICATED", "Sign in required.");
      return handleEnrollment(input.activityId, member, reply);
    },
  );

  app.get(
    "/learning/credits",
    { preHandler: app.authenticateMember },
    async (request) => {
      const member = request.currentMember;
      if (!member)
        throw new AppError(401, "MEMBER_UNAUTHENTICATED", "Sign in required.");

      const rows = await db
        .select({
          ledger: learningCreditLedger,
          schemeName: learningCreditSchemes.name,
          unitName: learningCreditSchemes.unitName,
        })
        .from(learningCreditLedger)
        .innerJoin(
          learningCreditSchemes,
          eq(learningCreditLedger.schemeId, learningCreditSchemes.id),
        )
        .where(eq(learningCreditLedger.memberId, member.id))
        .orderBy(desc(learningCreditLedger.createdAt));

      return { data: rows };
    },
  );
};
