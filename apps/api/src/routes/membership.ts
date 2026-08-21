import { randomUUID } from "node:crypto";
import { hash, verify } from "@node-rs/argon2";
import { paginationSchema } from "@openorg/contracts";
import { and, desc, eq, ilike, isNull, or, sql } from "drizzle-orm";
import type { FastifyPluginAsync, FastifyRequest } from "fastify";
import { z } from "zod";
import { config } from "../config";
import { db } from "../db/client";
import {
  auditLogs,
  memberAccounts,
  memberApplications,
  memberSessions,
  members,
  membershipCards,
  organizationUnits,
  siteSettings,
} from "../db/schema";
import { AppError } from "../lib/errors";
import {
  hashMemberSessionToken,
  MEMBER_SESSION_TTL_SECONDS,
  newMemberSessionToken,
} from "../plugins/member-auth";

const registrationInput = z.object({
  name: z.string().trim().min(2).max(160),
  email: z.string().trim().toLowerCase().email().max(320),
  phone: z
    .string()
    .trim()
    .min(8)
    .max(40)
    .transform((value) => value.replace(/[^+\d]/g, "")),
  password: z.string().min(8).max(200),
  address: z.string().trim().max(2000).nullable().optional(),
  unitId: z.string().uuid().nullable().optional(),
  dateOfBirth: z.string().date().nullable().optional(),
  companyName: z.string().trim().max(180).nullable().optional(),
  consent: z.literal(true).optional(),
});

const loginInput = z.object({
  email: z.string().trim().toLowerCase().email().max(320),
  password: z.string().min(1).max(200),
});

const profileInput = z.object({
  name: z.string().trim().min(2).max(160).optional(),
  phone: z.string().trim().min(8).max(40).optional(),
  address: z.string().trim().max(2000).nullable().optional(),
  avatarUrl: z.string().url().nullable().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

const reviewInput = z.object({
  decision: z.enum(["approve", "reject"]),
  rejectionReason: z.string().trim().max(2000).nullable().optional(),
  reviewerNotes: z.string().trim().max(5000).nullable().optional(),
});

async function membershipAudit(
  request: FastifyRequest,
  action: string,
  resourceType: string,
  resourceId?: string,
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

export const publicMembershipRoutes: FastifyPluginAsync = async (app) => {
  app.post(
    "/register",
    { config: { rateLimit: { max: 5, timeWindow: "1 hour" } } },
    async (request, reply) => {
      const input = registrationInput.parse(request.body);
      if (input.unitId) {
        const [unit] = await db
          .select({ id: organizationUnits.id })
          .from(organizationUnits)
          .where(
            and(
              eq(organizationUnits.id, input.unitId),
              eq(organizationUnits.isActive, true),
            ),
          )
          .limit(1);
        if (!unit)
          throw new AppError(
            422,
            "INVALID_ORGANIZATION_UNIT",
            "The selected organization unit is not available.",
          );
      }
      const [duplicate] = await db
        .select({ id: members.id })
        .from(members)
        .where(
          or(eq(members.email, input.email), eq(members.phone, input.phone)),
        )
        .limit(1);
      if (duplicate)
        throw new AppError(
          409,
          "MEMBER_ALREADY_REGISTERED",
          "An account with this email or phone number already exists.",
        );

      const passwordHash = await hash(input.password, {
        algorithm: 2,
        memoryCost: 19_456,
        timeCost: 3,
        parallelism: 1,
        outputLen: 32,
      });

      const [member] = await db.transaction(async (tx) => {
        const [created] = await tx
          .insert(members)
          .values({
            unitId: input.unitId ?? null,
            memberNumber: `APP-${randomUUID().slice(0, 8).toUpperCase()}`,
            name: input.name,
            email: input.email,
            phone: input.phone,
            status: "applicant",
            metadata: {
              dateOfBirth: input.dateOfBirth ?? null,
              companyName: input.companyName ?? null,
            },
          })
          .returning();
        if (!created) throw new Error("Could not create membership profile.");
        const [_account] = await tx
          .insert(memberAccounts)
          .values({
            memberId: created.id,
            email: input.email,
            passwordHash,
            status: "active",
          })
          .returning();
        await tx.insert(memberApplications).values({
          fullName: input.name,
          email: input.email,
          phone: input.phone,
          requestedUnitId: input.unitId ?? null,
          status: "applicant",
          createdMemberId: created.id,
        });
        return [created];
      });
      await membershipAudit(
        request,
        "member.application_submitted",
        "member_application",
        member?.id,
        undefined,
        { email: input.email, status: "applicant" },
      );
      return reply.status(201).send({
        data: {
          memberId: member?.id,
          status: "applicant",
        },
      });
    },
  );

  app.post(
    "/login",
    { config: { rateLimit: { max: 8, timeWindow: "15 minutes" } } },
    async (request, reply) => {
      const input = loginInput.parse(request.body);
      const [result] = await db
        .select({ account: memberAccounts, member: members })
        .from(memberAccounts)
        .innerJoin(members, eq(memberAccounts.memberId, members.id))
        .where(and(eq(memberAccounts.email, input.email)))
        .limit(1);
      if (
        !result ||
        !(await verify(result.account.passwordHash, input.password))
      ) {
        throw new AppError(
          401,
          "INVALID_MEMBER_CREDENTIALS",
          "Email or password is incorrect.",
        );
      }
      const token = newMemberSessionToken();
      const now = new Date();
      await db.transaction(async (tx) => {
        await tx.insert(memberSessions).values({
          memberAccountId: result.account.id,
          tokenHash: hashMemberSessionToken(token),
          ipAddress: request.ip,
          userAgent: request.headers["user-agent"]?.slice(0, 500),
          expiresAt: new Date(Date.now() + MEMBER_SESSION_TTL_SECONDS * 1000),
        });
        await tx
          .update(memberAccounts)
          .set({
            lastLoginAt: now,
            updatedAt: now,
          })
          .where(eq(memberAccounts.id, result.account.id));
      });
      reply.setCookie(config.MEMBER_SESSION_COOKIE_NAME, token, {
        httpOnly: true,
        secure: config.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: MEMBER_SESSION_TTL_SECONDS,
      });
      return {
        data: {
          member: {
            id: result.member.id,
            name: result.member.name,
            status: result.member.status,
            memberNumber: result.member.memberNumber,
          },
        },
      };
    },
  );

  app.get("/cards/:code", async (request) => {
    const { code } = z.object({ code: z.string() }).parse(request.params);
    const [result] = await db
      .select({
        card: membershipCards,
        member: members,
        unit: organizationUnits,
      })
      .from(membershipCards)
      .innerJoin(members, eq(membershipCards.memberId, members.id))
      .leftJoin(organizationUnits, eq(members.unitId, organizationUnits.id))
      .where(
        and(
          eq(membershipCards.code, code),
          eq(members.status, "active"),
          isNull(membershipCards.revokedAt),
        ),
      )
      .limit(1);

    const [site] = await db
      .select()
      .from(siteSettings)
      .where(eq(siteSettings.id, "default"))
      .limit(1);

    if (!result)
      throw new AppError(
        404,
        "MEMBERSHIP_CARD_NOT_FOUND",
        "This membership card is not active.",
      );

    return {
      data: {
        valid: true,
        member: {
          name: result.member.name,
          memberNumber: result.member.memberNumber,
          avatarUrl: result.member.avatarUrl,
          unitName: result.unit?.name ?? null,
          joinedAt: result.member.joinedAt,
        },
        card: {
          issuedAt: result.card.issuedAt,
          expiresAt: result.card.expiresAt,
          version: result.card.version,
        },
        organization: {
          name: site?.name ?? "OpenOrg Association",
          logoUrl: site?.logoUrl ?? null,
        },
      },
    };
  });
};

export const memberPortalRoutes: FastifyPluginAsync = async (app) => {
  app.get(
    "/session",
    { preHandler: app.authenticateMember },
    async (request) => {
      const member = request.currentMember;
      if (!member)
        throw new AppError(401, "MEMBER_UNAUTHENTICATED", "Sign in required.");

      const [card, site] = await Promise.all([
        db
          .select()
          .from(membershipCards)
          .where(
            and(
              eq(membershipCards.memberId, member.id),
              isNull(membershipCards.revokedAt),
            ),
          )
          .orderBy(desc(membershipCards.version))
          .limit(1)
          .then((rows) => rows[0] ?? null),
        db
          .select()
          .from(siteSettings)
          .where(eq(siteSettings.id, "default"))
          .limit(1)
          .then((rows) => rows[0] ?? null),
      ]);

      return {
        data: {
          member,
          card,
          organization: {
            id: "default",
            name: site?.name ?? "OpenOrg Association",
            logoUrl: site?.logoUrl ?? null,
          },
        },
      };
    },
  );

  app.patch(
    "/profile",
    { preHandler: app.authenticateMember },
    async (request) => {
      const input = profileInput.parse(request.body);
      const member = request.currentMember;
      if (!member)
        throw new AppError(401, "MEMBER_UNAUTHENTICATED", "Sign in required.");
      const [updated] = await db
        .update(members)
        .set({ ...input, updatedAt: new Date() })
        .where(eq(members.id, member.id))
        .returning();
      await membershipAudit(
        request,
        "member.profile_updated",
        "member",
        member.id,
        member,
        updated,
      );
      return { data: updated };
    },
  );

  app.post(
    "/logout",
    { preHandler: app.authenticateMember },
    async (request, reply) => {
      const token = request.cookies[config.MEMBER_SESSION_COOKIE_NAME];
      if (token)
        await db
          .delete(memberSessions)
          .where(eq(memberSessions.tokenHash, hashMemberSessionToken(token)));
      reply.clearCookie(config.MEMBER_SESSION_COOKIE_NAME, { path: "/" });
      return reply.status(204).send();
    },
  );
};

export const adminMembershipRoutes: FastifyPluginAsync = async (app) => {
  app.get(
    "/applications",
    { preHandler: app.authorize("members.read") },
    async (request) => {
      const query = paginationSchema.parse(request.query);
      const conditions = [];
      if (query.search)
        conditions.push(
          or(
            ilike(memberApplications.fullName, `%${query.search}%`),
            ilike(memberApplications.email, `%${query.search}%`),
            ilike(memberApplications.phone, `%${query.search}%`),
          ),
        );
      const where = conditions.length ? and(...conditions) : undefined;
      const [rows, countRows] = await Promise.all([
        db
          .select({
            application: memberApplications,
            unitName: organizationUnits.name,
          })
          .from(memberApplications)
          .leftJoin(
            organizationUnits,
            eq(memberApplications.requestedUnitId, organizationUnits.id),
          )
          .where(where)
          .orderBy(desc(memberApplications.createdAt))
          .limit(query.limit)
          .offset((query.page - 1) * query.limit),
        db
          .select({ count: sql<number>`count(*)::int` })
          .from(memberApplications)
          .where(where),
      ]);
      return {
        data: rows.map((row) => ({
          ...row.application,
          unitName: row.unitName,
        })),
        meta: {
          page: query.page,
          limit: query.limit,
          total: countRows[0]?.count ?? 0,
        },
      };
    },
  );

  app.patch(
    "/applications/:id/review",
    { preHandler: app.authorize("members.write") },
    async (request) => {
      const { id } = z.object({ id: z.string().uuid() }).parse(request.params);
      const input = reviewInput.parse(request.body);
      const [application] = await db
        .select()
        .from(memberApplications)
        .where(eq(memberApplications.id, id))
        .limit(1);
      if (!application)
        throw new AppError(
          404,
          "MEMBERSHIP_APPLICATION_NOT_FOUND",
          "The membership application was not found.",
        );

      const reviewedAt = new Date();
      const result = await db.transaction(async (tx) => {
        if (input.decision === "reject") {
          const [updatedApp] = await tx
            .update(memberApplications)
            .set({
              status: "rejected",
              reviewNotes: input.rejectionReason ?? input.reviewerNotes,
              reviewedAt,
              reviewedBy: request.currentUser?.id,
              updatedAt: reviewedAt,
            })
            .where(eq(memberApplications.id, id))
            .returning();
          return { application: updatedApp, card: null };
        }

        const prefix = "KTA";
        const randomNum = String(Math.floor(100000 + Math.random() * 900000));
        const memberNumber = `${prefix}-${randomNum}`;

        let memberId = application.createdMemberId;
        if (!memberId) {
          const [createdMem] = await tx
            .insert(members)
            .values({
              unitId: application.requestedUnitId,
              memberNumber,
              name: application.fullName,
              email: application.email,
              phone: application.phone,
              status: "active",
              joinedAt: reviewedAt,
            })
            .returning();
          memberId = createdMem?.id ?? "";
        } else {
          await tx
            .update(members)
            .set({
              memberNumber,
              status: "active",
              joinedAt: reviewedAt,
            })
            .where(eq(members.id, memberId));
        }

        const cardCode = `KTA-${randomUUID().slice(0, 8).toUpperCase()}`;
        const [card] = await tx
          .insert(membershipCards)
          .values({
            memberId,
            code: cardCode,
            version: 1,
            isActive: true,
          })
          .returning();

        const [updatedApp] = await tx
          .update(memberApplications)
          .set({
            status: "active",
            reviewNotes: input.reviewerNotes,
            reviewedAt,
            reviewedBy: request.currentUser?.id,
            createdMemberId: memberId,
            updatedAt: reviewedAt,
          })
          .where(eq(memberApplications.id, id))
          .returning();

        return { application: updatedApp, card, memberNumber };
      });

      await membershipAudit(
        request,
        input.decision === "approve"
          ? "member.application_approved"
          : "member.application_rejected",
        "member_application",
        id,
        application,
        result,
      );
      return { data: result };
    },
  );
};
