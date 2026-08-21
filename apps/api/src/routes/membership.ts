import { createHmac, randomBytes, randomUUID } from "node:crypto";
import { hash, verify } from "@node-rs/argon2";
import { paginationSchema } from "@openorg/contracts";
import { and, desc, eq, ilike, inArray, isNull, or, sql } from "drizzle-orm";
import type { FastifyPluginAsync, FastifyRequest } from "fastify";
import { z } from "zod";
import { config } from "../config";
import { db } from "../db/client";
import {
  auditLogs,
  credentialRequirements,
  credentialSchemes,
  memberAccounts,
  memberApplications,
  memberCredentials,
  memberSessions,
  members,
  membershipCards,
  organizationUnits,
} from "../db/schema";
import { evaluateCredentialRequirements } from "../lib/compliance";
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
  password: z
    .string()
    .min(10)
    .max(200)
    .regex(/[a-z]/, "Password must contain a lowercase letter.")
    .regex(/[A-Z]/, "Password must contain an uppercase letter.")
    .regex(/\d/, "Password must contain a number."),
  address: z.string().trim().max(2000).nullable().optional(),
  unitId: z.string().uuid().nullable().optional(),
  dateOfBirth: z.string().date().nullable().optional(),
  companyName: z.string().trim().max(180).nullable().optional(),
  companyDescription: z.string().trim().max(2000).nullable().optional(),
  companyAddress: z.string().trim().max(2000).nullable().optional(),
  companyWebsite: z.string().url().max(2048).nullable().optional(),
  consent: z.literal(true),
});

const verificationInput = z.object({
  email: z.string().trim().toLowerCase().email().max(320),
  token: z.string().min(32).max(200),
});

const loginInput = z.object({
  email: z.string().trim().toLowerCase().email().max(320),
  password: z.string().min(1).max(200),
});

const profileInput = z.object({
  name: z.string().trim().min(2).max(160).optional(),
  phone: z.string().trim().min(8).max(40).optional(),
  address: z.string().trim().max(2000).nullable().optional(),
  biography: z.string().trim().max(5000).nullable().optional(),
  avatarUrl: z.string().url().nullable().optional(),
  isPublic: z.boolean().optional(),
  socialLinks: z
    .array(
      z.object({
        platform: z.string().trim().min(1).max(60),
        url: z.string().url().max(2048),
      }),
    )
    .max(20)
    .optional(),
  customFields: z.record(z.string(), z.unknown()).optional(),
});

const applicationStatus = z.enum([
  "applicant",
  "pending",
  "active",
  "rejected",
]);

const reviewInput = z
  .object({
    decision: z.enum(["approve", "reject"]),
    rejectionReason: z.string().trim().max(2000).nullable().optional(),
    reviewerNotes: z.string().trim().max(5000).nullable().optional(),
    expiresAt: z.string().datetime().nullable().optional(),
  })
  .superRefine((value, context) => {
    if (value.decision === "reject" && !value.rejectionReason)
      context.addIssue({
        code: "custom",
        path: ["rejectionReason"],
        message: "A rejection reason is required.",
      });
  });

function hashVerificationToken(token: string) {
  return createHmac("sha256", config.SESSION_SECRET)
    .update(`member-verification:${token}`)
    .digest();
}

async function membershipAudit(
  request: FastifyRequest,
  action: string,
  resourceType: string,
  resourceId?: string,
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
              eq(organizationUnits.organizationId, request.organization.id),
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
        .leftJoin(memberAccounts, eq(memberAccounts.memberId, members.id))
        .where(
          and(
            eq(members.organizationId, request.organization.id),
            isNull(members.deletedAt),
            or(
              eq(memberAccounts.email, input.email),
              eq(members.phone, input.phone),
            ),
          ),
        )
        .limit(1);
      if (duplicate)
        throw new AppError(
          409,
          "MEMBER_ALREADY_REGISTERED",
          "An account with this email or phone number already exists.",
        );

      const token = randomBytes(32).toString("base64url");
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
            organizationId: request.organization.id,
            unitId: input.unitId ?? null,
            memberNumber: `APP-${randomUUID().slice(0, 8).toUpperCase()}`,
            name: input.name,
            email: input.email,
            phone: input.phone,
            address: input.address ?? null,
            status: "applicant",
            isPublic: false,
            customFields: {
              dateOfBirth: input.dateOfBirth ?? null,
              companyName: input.companyName ?? null,
              companyDescription: input.companyDescription ?? null,
              companyAddress: input.companyAddress ?? null,
              companyWebsite: input.companyWebsite ?? null,
            },
          })
          .returning();
        if (!created) throw new Error("Could not create membership profile.");
        await tx.insert(memberAccounts).values({
          organizationId: request.organization.id,
          memberId: created.id,
          email: input.email,
          passwordHash,
          verificationTokenHash: hashVerificationToken(token),
          verificationExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        });
        await tx.insert(memberApplications).values({
          organizationId: request.organization.id,
          memberId: created.id,
          status: "applicant",
          consent: {
            accepted: true,
            acceptedAt: new Date().toISOString(),
            ip: request.ip,
          },
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
          verificationRequired: true,
          ...(config.NODE_ENV === "development"
            ? { verificationToken: token }
            : {}),
        },
      });
    },
  );

  app.post(
    "/verify-email",
    { config: { rateLimit: { max: 8, timeWindow: "1 hour" } } },
    async (request) => {
      const input = verificationInput.parse(request.body);
      const [account] = await db
        .select()
        .from(memberAccounts)
        .where(
          and(
            eq(memberAccounts.organizationId, request.organization.id),
            eq(memberAccounts.email, input.email),
          ),
        )
        .limit(1);
      if (
        !account?.verificationTokenHash ||
        !account.verificationExpiresAt ||
        account.verificationExpiresAt < new Date() ||
        !hashVerificationToken(input.token).equals(
          account.verificationTokenHash,
        )
      )
        throw new AppError(
          422,
          "INVALID_VERIFICATION_TOKEN",
          "The verification link is invalid or has expired.",
        );
      const verifiedAt = new Date();
      await db.transaction(async (tx) => {
        await tx
          .update(memberAccounts)
          .set({
            emailVerifiedAt: verifiedAt,
            verificationTokenHash: null,
            verificationExpiresAt: null,
            updatedAt: verifiedAt,
          })
          .where(eq(memberAccounts.id, account.id));
        await tx
          .update(members)
          .set({ status: "pending", updatedAt: verifiedAt })
          .where(eq(members.id, account.memberId));
        await tx
          .update(memberApplications)
          .set({ status: "pending", updatedAt: verifiedAt })
          .where(eq(memberApplications.memberId, account.memberId));
      });
      await membershipAudit(
        request,
        "member.email_verified",
        "member",
        account.memberId,
      );
      return { data: { status: "pending" } };
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
        .where(
          and(
            eq(memberAccounts.organizationId, request.organization.id),
            eq(memberAccounts.email, input.email),
            isNull(members.deletedAt),
          ),
        )
        .limit(1);
      if (
        !result ||
        !(await verify(result.account.passwordHash, input.password))
      ) {
        if (result) {
          const failedLoginAttempts = result.account.failedLoginAttempts + 1;
          await db
            .update(memberAccounts)
            .set({
              failedLoginAttempts,
              lockedUntil:
                failedLoginAttempts >= 5
                  ? new Date(Date.now() + 15 * 60 * 1000)
                  : null,
              updatedAt: new Date(),
            })
            .where(eq(memberAccounts.id, result.account.id));
        }
        throw new AppError(
          401,
          "INVALID_MEMBER_CREDENTIALS",
          "Email or password is incorrect.",
        );
      }
      if (result.account.lockedUntil && result.account.lockedUntil > new Date())
        throw new AppError(
          429,
          "MEMBER_ACCOUNT_LOCKED",
          "This account is temporarily locked. Please try again later.",
        );
      const token = newMemberSessionToken();
      const now = new Date();
      await db.transaction(async (tx) => {
        await tx.insert(memberSessions).values({
          organizationId: request.organization.id,
          memberId: result.member.id,
          tokenHash: hashMemberSessionToken(token),
          ipAddress: request.ip,
          userAgent: request.headers["user-agent"]?.slice(0, 500),
          expiresAt: new Date(Date.now() + MEMBER_SESSION_TTL_SECONDS * 1000),
        });
        await tx
          .update(memberAccounts)
          .set({
            failedLoginAttempts: 0,
            lockedUntil: null,
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
          },
          emailVerified: Boolean(result.account.emailVerifiedAt),
        },
      };
    },
  );

  app.get("/cards/:code", async (request) => {
    const { code } = z
      .object({ code: z.string().uuid() })
      .parse(request.params);
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
          eq(membershipCards.verificationCode, code),
          eq(membershipCards.organizationId, request.organization.id),
          eq(members.status, "active"),
          isNull(membershipCards.revokedAt),
          isNull(members.deletedAt),
        ),
      )
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
          name: request.organization.name,
          logoUrl: request.organization.logoUrl,
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
      const [application, card, account] = await Promise.all([
        db
          .select()
          .from(memberApplications)
          .where(eq(memberApplications.memberId, member.id))
          .limit(1)
          .then((rows) => rows[0] ?? null),
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
          .select({ emailVerifiedAt: memberAccounts.emailVerifiedAt })
          .from(memberAccounts)
          .where(eq(memberAccounts.memberId, member.id))
          .limit(1)
          .then((rows) => rows[0] ?? null),
      ]);
      return {
        data: {
          member,
          application,
          card,
          emailVerified: Boolean(account?.emailVerifiedAt),
          organization: {
            id: request.organization.id,
            name: request.organization.name,
            logoUrl: request.organization.logoUrl,
            theme: request.organization.theme,
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
        .where(
          and(
            eq(members.id, member.id),
            eq(members.organizationId, request.organization.id),
          ),
        )
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
      const query = paginationSchema
        .extend({ status: applicationStatus.optional() })
        .parse(request.query);
      const conditions = [
        eq(memberApplications.organizationId, request.organization.id),
        isNull(members.deletedAt),
      ];
      if (query.status)
        conditions.push(eq(memberApplications.status, query.status));
      if (query.search)
        conditions.push(
          or(
            ilike(members.name, `%${query.search}%`),
            ilike(members.email, `%${query.search}%`),
            ilike(members.phone, `%${query.search}%`),
          ) as ReturnType<typeof ilike>,
        );
      const where = and(...conditions);
      const [rows, countRows] = await Promise.all([
        db
          .select({
            application: memberApplications,
            member: members,
            unitName: organizationUnits.name,
          })
          .from(memberApplications)
          .innerJoin(members, eq(memberApplications.memberId, members.id))
          .leftJoin(organizationUnits, eq(members.unitId, organizationUnits.id))
          .where(where)
          .orderBy(desc(memberApplications.submittedAt))
          .limit(query.limit)
          .offset((query.page - 1) * query.limit),
        db
          .select({ count: sql<number>`count(*)::int` })
          .from(memberApplications)
          .innerJoin(members, eq(memberApplications.memberId, members.id))
          .where(where),
      ]);
      return {
        data: rows.map((row) => ({
          ...row.application,
          member: row.member,
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
      const [before] = await db
        .select({ application: memberApplications, member: members })
        .from(memberApplications)
        .innerJoin(members, eq(memberApplications.memberId, members.id))
        .where(
          and(
            eq(memberApplications.id, id),
            eq(memberApplications.organizationId, request.organization.id),
            isNull(members.deletedAt),
          ),
        )
        .limit(1);
      if (!before)
        throw new AppError(
          404,
          "MEMBERSHIP_APPLICATION_NOT_FOUND",
          "The membership application was not found.",
        );
      if (before.application.status === "active")
        throw new AppError(
          409,
          "MEMBERSHIP_ALREADY_APPROVED",
          "This application is already approved.",
        );

      if (input.decision === "approve") {
        const membershipType =
          typeof before.member.customFields.membershipType === "string"
            ? before.member.customFields.membershipType
            : "default";
        const [requirements, credentials] = await Promise.all([
          db
            .select({
              requirement: credentialRequirements,
              schemeName: credentialSchemes.name,
            })
            .from(credentialRequirements)
            .innerJoin(
              credentialSchemes,
              eq(credentialRequirements.schemeId, credentialSchemes.id),
            )
            .where(
              and(
                eq(
                  credentialRequirements.organizationId,
                  request.organization.id,
                ),
                eq(credentialRequirements.membershipType, membershipType),
                eq(credentialRequirements.blocksApproval, true),
                eq(credentialSchemes.isActive, true),
              ),
            ),
          db
            .select()
            .from(memberCredentials)
            .where(
              and(
                eq(memberCredentials.organizationId, request.organization.id),
                eq(memberCredentials.memberId, before.member.id),
                eq(memberCredentials.status, "verified"),
              ),
            ),
        ]);
        const compliance = evaluateCredentialRequirements(
          requirements.map(({ requirement }) => requirement),
          credentials,
        );
        if (compliance.blockers.length) {
          const blockersById = new Set(
            compliance.blockers.map((requirement) => requirement.id),
          );
          const blockerRows = requirements.filter(({ requirement }) =>
            blockersById.has(requirement.id),
          );
          throw new AppError(
            409,
            "MEMBERSHIP_COMPLIANCE_BLOCKED",
            "This application cannot be approved until its compliance requirements are satisfied.",
            {
              membershipType,
              blockers: blockerRows.map(({ requirement, schemeName }) => ({
                requirementId: requirement.id,
                schemeId: requirement.schemeId,
                schemeName,
                rule: requirement.rule,
                groupKey: requirement.groupKey,
                requiredVerificationLevel:
                  requirement.requiredVerificationLevel,
              })),
            },
          );
        }
      }

      const reviewedAt = new Date();
      const result = await db.transaction(async (tx) => {
        if (input.decision === "reject") {
          const [application] = await tx
            .update(memberApplications)
            .set({
              status: "rejected",
              rejectionReason: input.rejectionReason,
              reviewerNotes: input.reviewerNotes,
              reviewedAt,
              reviewedBy: request.currentUser?.id,
              updatedAt: reviewedAt,
            })
            .where(eq(memberApplications.id, id))
            .returning();
          await tx
            .update(members)
            .set({ status: "rejected", updatedAt: reviewedAt })
            .where(eq(members.id, before.member.id));
          return {
            application,
            card: null,
            memberNumber: before.member.memberNumber,
          };
        }

        await tx.execute(
          sql`select pg_advisory_xact_lock(hashtext(${request.organization.id}))`,
        );
        const existingNumbers = await tx
          .select({ memberNumber: members.memberNumber })
          .from(members)
          .where(
            and(
              eq(members.organizationId, request.organization.id),
              inArray(members.status, ["active", "inactive"]),
            ),
          );
        const highest = existingNumbers.reduce((current, row) => {
          const match = row.memberNumber.match(/(\d+)$/);
          return Math.max(current, match ? Number(match[1]) : 0);
        }, 0);
        const prefix = request.organization.slug
          .replace(/[^a-z0-9]/gi, "")
          .slice(0, 8)
          .toUpperCase();
        const memberNumber = `${prefix}-${String(highest + 1).padStart(6, "0")}`;
        const [updatedMember] = await tx
          .update(members)
          .set({
            memberNumber,
            status: "active",
            joinedAt: before.member.joinedAt ?? reviewedAt,
            updatedAt: reviewedAt,
          })
          .where(eq(members.id, before.member.id))
          .returning();
        await tx
          .update(membershipCards)
          .set({ revokedAt: reviewedAt, updatedAt: reviewedAt })
          .where(
            and(
              eq(membershipCards.memberId, before.member.id),
              isNull(membershipCards.revokedAt),
            ),
          );
        const [card] = await tx
          .insert(membershipCards)
          .values({
            organizationId: request.organization.id,
            memberId: before.member.id,
            cardNumber: memberNumber,
            expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
            snapshot: {
              memberName: updatedMember?.name,
              memberNumber,
              organizationName: request.organization.name,
              organizationLogoUrl: request.organization.logoUrl,
              theme: request.organization.theme,
            },
          })
          .returning();
        const [application] = await tx
          .update(memberApplications)
          .set({
            status: "active",
            rejectionReason: null,
            reviewerNotes: input.reviewerNotes,
            reviewedAt,
            reviewedBy: request.currentUser?.id,
            updatedAt: reviewedAt,
          })
          .where(eq(memberApplications.id, id))
          .returning();
        return { application, card, memberNumber };
      });
      await membershipAudit(
        request,
        input.decision === "approve"
          ? "member.application_approved"
          : "member.application_rejected",
        "member_application",
        id,
        before,
        result,
      );
      return { data: result };
    },
  );
};
