import {
  creditSchemeInputSchema,
  learningActivityInputSchema,
} from "@openorg/contracts";
import { and, asc, desc, eq, inArray, isNull, or, sql } from "drizzle-orm";
import type { FastifyPluginAsync, FastifyRequest } from "fastify";
import { z } from "zod";
import { db } from "../db/client";
import {
  auditLogs,
  creditLedger,
  creditSchemes,
  learningActivities,
  learningAttendance,
  learningEnrollments,
  members,
} from "../db/schema";
import { AppError } from "../lib/errors";
import {
  creditFromHundredths,
  creditToHundredths,
  resolveEnrollmentStatus,
} from "../lib/learning";

const idParams = z.object({ id: z.string().uuid() });
const adminEnrollmentInput = z.object({
  memberId: z.string().uuid(),
  status: z
    .enum(["registered", "waitlisted", "confirmed", "completed", "cancelled"])
    .default("confirmed"),
});
const attendanceInput = z.object({
  memberId: z.string().uuid(),
  status: z.enum(["present", "late", "absent", "excused"]),
  checkInAt: z.string().datetime().nullable().optional(),
  checkOutAt: z.string().datetime().nullable().optional(),
  minutesAttended: z.number().int().min(0).max(100_000).nullable().optional(),
  source: z.string().trim().min(1).max(80).default("admin"),
  evidence: z.record(z.string(), z.unknown()).default({}),
});
const adjustmentInput = z.object({
  memberId: z.string().uuid(),
  creditSchemeId: z.string().uuid(),
  amount: z
    .number()
    .min(-10_000)
    .max(10_000)
    .multipleOf(0.01)
    .refine((v) => v !== 0),
  reason: z.string().trim().min(3).max(5000),
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
    organizationId: request.organization.id,
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

async function tenantCreditScheme(organizationId: string, id: string) {
  const [scheme] = await db
    .select()
    .from(creditSchemes)
    .where(
      and(
        eq(creditSchemes.id, id),
        eq(creditSchemes.organizationId, organizationId),
      ),
    )
    .limit(1);
  if (!scheme)
    throw new AppError(
      422,
      "INVALID_CREDIT_SCHEME",
      "The credit scheme is not available in this workspace.",
    );
  return scheme;
}

async function tenantActivity(organizationId: string, id: string) {
  const [activity] = await db
    .select()
    .from(learningActivities)
    .where(
      and(
        eq(learningActivities.id, id),
        eq(learningActivities.organizationId, organizationId),
      ),
    )
    .limit(1);
  if (!activity)
    throw new AppError(
      404,
      "LEARNING_ACTIVITY_NOT_FOUND",
      "The learning activity was not found.",
    );
  return activity;
}

async function tenantActiveMember(organizationId: string, id: string) {
  const [member] = await db
    .select()
    .from(members)
    .where(
      and(
        eq(members.id, id),
        eq(members.organizationId, organizationId),
        eq(members.status, "active"),
        isNull(members.deletedAt),
      ),
    )
    .limit(1);
  if (!member)
    throw new AppError(
      422,
      "INVALID_LEARNING_MEMBER",
      "Only an active member in this workspace can join an activity.",
    );
  return member;
}

function presentActivity<T extends { creditAmountHundredths: number }>(
  activity: T,
) {
  return {
    ...activity,
    creditAmount: creditFromHundredths(activity.creditAmountHundredths),
  };
}

export const adminLearningRoutes: FastifyPluginAsync = async (app) => {
  app.get(
    "/overview",
    { preHandler: app.authorize("learning.read") },
    async (request) => {
      const organizationId = request.organization.id;
      const [schemes, activityRows, enrollmentRows, memberRows] =
        await Promise.all([
          db
            .select()
            .from(creditSchemes)
            .where(eq(creditSchemes.organizationId, organizationId))
            .orderBy(asc(creditSchemes.name)),
          db
            .select({ activity: learningActivities, scheme: creditSchemes })
            .from(learningActivities)
            .leftJoin(
              creditSchemes,
              eq(learningActivities.creditSchemeId, creditSchemes.id),
            )
            .where(eq(learningActivities.organizationId, organizationId))
            .orderBy(desc(learningActivities.startsAt)),
          db
            .select({
              enrollment: learningEnrollments,
              member: {
                id: members.id,
                name: members.name,
                memberNumber: members.memberNumber,
              },
              attendance: learningAttendance,
            })
            .from(learningEnrollments)
            .innerJoin(members, eq(learningEnrollments.memberId, members.id))
            .leftJoin(
              learningAttendance,
              and(
                eq(
                  learningAttendance.activityId,
                  learningEnrollments.activityId,
                ),
                eq(learningAttendance.memberId, learningEnrollments.memberId),
              ),
            )
            .where(eq(learningEnrollments.organizationId, organizationId))
            .orderBy(asc(members.name)),
          db
            .select({
              id: members.id,
              name: members.name,
              memberNumber: members.memberNumber,
            })
            .from(members)
            .where(
              and(
                eq(members.organizationId, organizationId),
                eq(members.status, "active"),
                isNull(members.deletedAt),
              ),
            )
            .orderBy(asc(members.name)),
        ]);
      return {
        data: {
          schemes,
          activities: activityRows.map((row) => ({
            ...presentActivity(row.activity),
            scheme: row.scheme,
          })),
          enrollments: enrollmentRows.map((row) => ({
            ...row.enrollment,
            member: row.member,
            attendance: row.attendance,
          })),
          members: memberRows,
        },
      };
    },
  );

  app.post(
    "/schemes",
    { preHandler: app.authorize("learning.write") },
    async (request, reply) => {
      const input = creditSchemeInputSchema.parse(request.body);
      const [created] = await db
        .insert(creditSchemes)
        .values({ ...input, organizationId: request.organization.id })
        .returning();
      if (!created) throw new Error("Could not create credit scheme.");
      await audit(
        request,
        "learning.credit_scheme_created",
        "credit_scheme",
        created.id,
        undefined,
        created,
      );
      return reply.status(201).send({ data: created });
    },
  );

  app.post(
    "/activities",
    { preHandler: app.authorize("learning.write") },
    async (request, reply) => {
      const input = learningActivityInputSchema.parse(request.body);
      if (input.creditSchemeId)
        await tenantCreditScheme(request.organization.id, input.creditSchemeId);
      const { creditAmount, ...values } = input;
      const [created] = await db
        .insert(learningActivities)
        .values({
          ...values,
          startsAt: new Date(values.startsAt),
          endsAt: values.endsAt ? new Date(values.endsAt) : null,
          enrollmentOpensAt: values.enrollmentOpensAt
            ? new Date(values.enrollmentOpensAt)
            : null,
          enrollmentClosesAt: values.enrollmentClosesAt
            ? new Date(values.enrollmentClosesAt)
            : null,
          creditAmountHundredths: creditToHundredths(creditAmount),
          organizationId: request.organization.id,
          createdBy: request.currentUser?.id,
        })
        .returning();
      if (!created) throw new Error("Could not create learning activity.");
      await audit(
        request,
        "learning.activity_created",
        "learning_activity",
        created.id,
        undefined,
        created,
      );
      return reply.status(201).send({ data: presentActivity(created) });
    },
  );

  app.post(
    "/activities/:id/enrollments",
    { preHandler: app.authorize("learning.write") },
    async (request, reply) => {
      const { id } = idParams.parse(request.params);
      const input = adminEnrollmentInput.parse(request.body);
      await Promise.all([
        tenantActivity(request.organization.id, id),
        tenantActiveMember(request.organization.id, input.memberId),
      ]);
      const [saved] = await db
        .insert(learningEnrollments)
        .values({
          organizationId: request.organization.id,
          activityId: id,
          memberId: input.memberId,
          status: input.status,
        })
        .onConflictDoUpdate({
          target: [
            learningEnrollments.activityId,
            learningEnrollments.memberId,
          ],
          set: { status: input.status, updatedAt: new Date() },
        })
        .returning();
      if (!saved) throw new Error("Could not save enrollment.");
      await audit(
        request,
        "learning.enrollment_saved",
        "learning_enrollment",
        saved.id,
        undefined,
        saved,
      );
      return reply.status(201).send({ data: saved });
    },
  );

  app.patch(
    "/activities/:id/attendance",
    { preHandler: app.authorize("learning.write") },
    async (request) => {
      const { id } = idParams.parse(request.params);
      const input = attendanceInput.parse(request.body);
      const [enrollment] = await db
        .select()
        .from(learningEnrollments)
        .where(
          and(
            eq(learningEnrollments.organizationId, request.organization.id),
            eq(learningEnrollments.activityId, id),
            eq(learningEnrollments.memberId, input.memberId),
          ),
        )
        .limit(1);
      if (!enrollment)
        throw new AppError(
          409,
          "LEARNING_ENROLLMENT_REQUIRED",
          "Enroll the member before recording attendance.",
        );
      const [saved] = await db
        .insert(learningAttendance)
        .values({
          ...input,
          checkInAt: input.checkInAt ? new Date(input.checkInAt) : null,
          checkOutAt: input.checkOutAt ? new Date(input.checkOutAt) : null,
          organizationId: request.organization.id,
          activityId: id,
          verifiedBy: request.currentUser?.id,
        })
        .onConflictDoUpdate({
          target: [learningAttendance.activityId, learningAttendance.memberId],
          set: {
            status: input.status,
            checkInAt: input.checkInAt ? new Date(input.checkInAt) : null,
            checkOutAt: input.checkOutAt ? new Date(input.checkOutAt) : null,
            minutesAttended: input.minutesAttended,
            source: input.source,
            evidence: input.evidence,
            verifiedBy: request.currentUser?.id,
            updatedAt: new Date(),
          },
        })
        .returning();
      if (!saved) throw new Error("Could not record attendance.");
      await audit(
        request,
        "learning.attendance_recorded",
        "learning_attendance",
        saved.id,
        undefined,
        saved,
      );
      return { data: saved };
    },
  );

  app.post(
    "/activities/:id/complete",
    { preHandler: app.authorize("learning.award") },
    async (request) => {
      const { id } = idParams.parse(request.params);
      const activity = await tenantActivity(request.organization.id, id);
      if (activity.status === "cancelled")
        throw new AppError(
          409,
          "LEARNING_ACTIVITY_CANCELLED",
          "A cancelled activity cannot issue credit.",
        );
      const result = await db.transaction(async (tx) => {
        const eligible = await tx
          .select({
            enrollment: learningEnrollments,
            attendance: learningAttendance,
          })
          .from(learningEnrollments)
          .innerJoin(
            learningAttendance,
            and(
              eq(learningAttendance.activityId, learningEnrollments.activityId),
              eq(learningAttendance.memberId, learningEnrollments.memberId),
            ),
          )
          .where(
            and(
              eq(learningEnrollments.organizationId, request.organization.id),
              eq(learningEnrollments.activityId, id),
              inArray(learningEnrollments.status, ["registered", "confirmed"]),
              inArray(learningAttendance.status, ["present", "late"]),
            ),
          );
        let awarded = 0;
        if (
          activity.creditSchemeId &&
          activity.creditAmountHundredths > 0 &&
          eligible.length
        ) {
          const inserted = await tx
            .insert(creditLedger)
            .values(
              eligible.map(({ enrollment }) => ({
                organizationId: request.organization.id,
                memberId: enrollment.memberId,
                creditSchemeId: activity.creditSchemeId as string,
                activityId: activity.id,
                enrollmentId: enrollment.id,
                entryType: "earned" as const,
                amountHundredths: activity.creditAmountHundredths,
                reason: `Completed ${activity.title}`,
                postedBy: request.currentUser?.id,
                metadata: { activityCode: activity.code },
              })),
            )
            .onConflictDoNothing()
            .returning({ id: creditLedger.id });
          awarded = inserted.length;
        }
        if (eligible.length)
          await tx
            .update(learningEnrollments)
            .set({
              status: "completed",
              completedAt: new Date(),
              updatedAt: new Date(),
            })
            .where(
              inArray(
                learningEnrollments.id,
                eligible.map(({ enrollment }) => enrollment.id),
              ),
            );
        const [updated] = await tx
          .update(learningActivities)
          .set({ status: "completed", updatedAt: new Date() })
          .where(
            and(
              eq(learningActivities.id, id),
              eq(learningActivities.organizationId, request.organization.id),
            ),
          )
          .returning();
        return { activity: updated, eligible: eligible.length, awarded };
      });
      await audit(
        request,
        "learning.activity_completed",
        "learning_activity",
        id,
        activity,
        result,
      );
      return { data: result };
    },
  );

  app.post(
    "/ledger",
    { preHandler: app.authorize("learning.award") },
    async (request, reply) => {
      const input = adjustmentInput.parse(request.body);
      await Promise.all([
        tenantActiveMember(request.organization.id, input.memberId),
        tenantCreditScheme(request.organization.id, input.creditSchemeId),
      ]);
      const [created] = await db
        .insert(creditLedger)
        .values({
          organizationId: request.organization.id,
          memberId: input.memberId,
          creditSchemeId: input.creditSchemeId,
          entryType: "adjustment",
          amountHundredths: creditToHundredths(input.amount),
          reason: input.reason,
          postedBy: request.currentUser?.id,
        })
        .returning();
      if (!created) throw new Error("Could not post credit adjustment.");
      await audit(
        request,
        "learning.credit_adjusted",
        "credit_ledger_entry",
        created.id,
        undefined,
        created,
      );
      return reply.status(201).send({
        data: {
          ...created,
          amount: creditFromHundredths(created.amountHundredths),
        },
      });
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
      const organizationId = request.organization.id;
      const [catalogRows, enrollmentRows, ledgerRows, balanceRows] =
        await Promise.all([
          db
            .select({ activity: learningActivities, scheme: creditSchemes })
            .from(learningActivities)
            .leftJoin(
              creditSchemes,
              eq(learningActivities.creditSchemeId, creditSchemes.id),
            )
            .where(
              and(
                eq(learningActivities.organizationId, organizationId),
                eq(learningActivities.status, "open"),
              ),
            )
            .orderBy(asc(learningActivities.startsAt)),
          db
            .select({
              enrollment: learningEnrollments,
              activity: learningActivities,
              scheme: creditSchemes,
              attendance: learningAttendance,
            })
            .from(learningEnrollments)
            .innerJoin(
              learningActivities,
              eq(learningEnrollments.activityId, learningActivities.id),
            )
            .leftJoin(
              creditSchemes,
              eq(learningActivities.creditSchemeId, creditSchemes.id),
            )
            .leftJoin(
              learningAttendance,
              and(
                eq(
                  learningAttendance.activityId,
                  learningEnrollments.activityId,
                ),
                eq(learningAttendance.memberId, learningEnrollments.memberId),
              ),
            )
            .where(
              and(
                eq(learningEnrollments.organizationId, organizationId),
                eq(learningEnrollments.memberId, member.id),
              ),
            )
            .orderBy(desc(learningActivities.startsAt)),
          db
            .select({
              entry: creditLedger,
              scheme: creditSchemes,
              activityTitle: learningActivities.title,
            })
            .from(creditLedger)
            .innerJoin(
              creditSchemes,
              eq(creditLedger.creditSchemeId, creditSchemes.id),
            )
            .leftJoin(
              learningActivities,
              eq(creditLedger.activityId, learningActivities.id),
            )
            .where(
              and(
                eq(creditLedger.organizationId, organizationId),
                eq(creditLedger.memberId, member.id),
              ),
            )
            .orderBy(desc(creditLedger.postedAt)),
          db
            .select({
              scheme: creditSchemes,
              amountHundredths: sql<number>`coalesce(sum(${creditLedger.amountHundredths}), 0)::int`,
            })
            .from(creditLedger)
            .innerJoin(
              creditSchemes,
              eq(creditLedger.creditSchemeId, creditSchemes.id),
            )
            .where(
              and(
                eq(creditLedger.organizationId, organizationId),
                eq(creditLedger.memberId, member.id),
              ),
            )
            .groupBy(creditSchemes.id),
        ]);
      return {
        data: {
          catalog: catalogRows.map((row) => ({
            ...presentActivity(row.activity),
            scheme: row.scheme,
          })),
          enrollments: enrollmentRows.map((row) => ({
            ...row.enrollment,
            activity: presentActivity(row.activity),
            scheme: row.scheme,
            attendance: row.attendance,
          })),
          balances: balanceRows.map((row) => ({
            scheme: row.scheme,
            amount: creditFromHundredths(row.amountHundredths),
          })),
          ledger: ledgerRows.map((row) => ({
            ...row.entry,
            amount: creditFromHundredths(row.entry.amountHundredths),
            scheme: row.scheme,
            activityTitle: row.activityTitle,
          })),
        },
      };
    },
  );

  app.post(
    "/learning/activities/:id/enroll",
    { preHandler: app.authenticateMember },
    async (request, reply) => {
      const member = request.currentMember;
      if (!member)
        throw new AppError(401, "MEMBER_UNAUTHENTICATED", "Sign in required.");
      if (member.status !== "active")
        throw new AppError(
          409,
          "ACTIVE_MEMBERSHIP_REQUIRED",
          "An active membership is required to enroll.",
        );
      const { id } = idParams.parse(request.params);
      const activity = await tenantActivity(request.organization.id, id);
      const now = new Date();
      if (
        activity.status !== "open" ||
        (activity.enrollmentOpensAt && activity.enrollmentOpensAt > now) ||
        (activity.enrollmentClosesAt && activity.enrollmentClosesAt < now)
      )
        throw new AppError(
          409,
          "LEARNING_ENROLLMENT_CLOSED",
          "Enrollment is not currently open for this activity.",
        );
      const [existing] = await db
        .select()
        .from(learningEnrollments)
        .where(
          and(
            eq(learningEnrollments.activityId, id),
            eq(learningEnrollments.memberId, member.id),
          ),
        )
        .limit(1);
      if (existing)
        throw new AppError(
          409,
          "LEARNING_ALREADY_ENROLLED",
          "You are already enrolled in this activity.",
        );
      const countRows = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(learningEnrollments)
        .where(
          and(
            eq(learningEnrollments.activityId, id),
            or(
              eq(learningEnrollments.status, "registered"),
              eq(learningEnrollments.status, "confirmed"),
              eq(learningEnrollments.status, "completed"),
            ),
          ),
        );
      const status = resolveEnrollmentStatus(
        activity.capacity,
        countRows[0]?.count ?? 0,
      );
      const [created] = await db
        .insert(learningEnrollments)
        .values({
          organizationId: request.organization.id,
          activityId: id,
          memberId: member.id,
          status,
        })
        .returning();
      if (!created) throw new Error("Could not create enrollment.");
      return reply.status(201).send({ data: created });
    },
  );
};
