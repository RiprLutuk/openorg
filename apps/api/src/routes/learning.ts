import { creditSchemeInputSchema } from "@openorg/contracts";
import { asc, desc, eq } from "drizzle-orm";
import type { FastifyPluginAsync, FastifyRequest } from "fastify";
import { z } from "zod";
import { db } from "../db/client";
import {
  auditLogs,
  learningActivities,
  learningCreditLedger,
  learningCreditSchemes,
  learningEnrollments,
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
};

export const memberLearningRoutes: FastifyPluginAsync = async (app) => {
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

  app.post(
    "/learning/enroll",
    { preHandler: app.authenticateMember },
    async (request, reply) => {
      const input = enrollmentInput.parse(request.body);
      const member = request.currentMember;
      if (!member)
        throw new AppError(401, "MEMBER_UNAUTHENTICATED", "Sign in required.");

      const [created] = await db
        .insert(learningEnrollments)
        .values({
          activityId: input.activityId,
          memberId: member.id,
          status: "registered",
        })
        .returning();

      return reply.status(201).send({ data: created });
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
