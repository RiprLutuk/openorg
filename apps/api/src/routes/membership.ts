import { randomBytes, randomUUID } from "node:crypto";
import { hash, verify } from "@node-rs/argon2";
import { paginationSchema } from "@openorg/contracts";
import { and, desc, eq, gt, ilike, isNull, or, sql } from "drizzle-orm";
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
import {
  sendApplicationApprovedNotification,
  sendEmailVerificationNotification,
} from "../services/notification";

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

      const rawVerificationToken = randomBytes(24).toString("hex");
      const verificationTokenHash =
        hashMemberSessionToken(rawVerificationToken);
      const verificationExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

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
            verificationTokenHash,
            verificationTokenExpiresAt: verificationExpiresAt,
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

      // Dispatch Email & WhatsApp (WAHA) Verification Notification
      const verificationUrl = `${config.WEB_ORIGIN}/member/verify-email?token=${rawVerificationToken}`;
      void sendEmailVerificationNotification({
        name: input.name,
        email: input.email,
        phone: input.phone,
        token: rawVerificationToken,
        verificationUrl,
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
          emailVerificationSent: true,
          verificationUrl:
            config.NODE_ENV !== "production" ? verificationUrl : undefined,
        },
      });
    },
  );

  app.get("/verify-email", async (request, reply) => {
    const { token } = z
      .object({ token: z.string().min(10) })
      .parse(request.query);

    const tokenHash = hashMemberSessionToken(token);
    const [account] = await db
      .select({
        id: memberAccounts.id,
        email: memberAccounts.email,
        memberId: memberAccounts.memberId,
      })
      .from(memberAccounts)
      .where(
        and(
          eq(memberAccounts.verificationTokenHash, tokenHash),
          gt(memberAccounts.verificationTokenExpiresAt, new Date()),
        ),
      )
      .limit(1);

    if (!account) {
      throw new AppError(
        400,
        "INVALID_OR_EXPIRED_TOKEN",
        "Tautan verifikasi tidak valid atau sudah kedaluwarsa. Silakan minta tautan verifikasi baru.",
      );
    }

    const now = new Date();
    await db
      .update(memberAccounts)
      .set({
        emailVerifiedAt: now,
        verificationTokenHash: null,
        verificationTokenExpiresAt: null,
        updatedAt: now,
      })
      .where(eq(memberAccounts.id, account.id));

    return reply.send({
      data: {
        email: account.email,
        verified: true,
        verifiedAt: now.toISOString(),
      },
    });
  });

  app.post("/verify-email", async (request, reply) => {
    const { token } = z
      .object({ token: z.string().min(10) })
      .parse(request.body);

    const tokenHash = hashMemberSessionToken(token);
    const [account] = await db
      .select({
        id: memberAccounts.id,
        email: memberAccounts.email,
        memberId: memberAccounts.memberId,
      })
      .from(memberAccounts)
      .where(
        and(
          eq(memberAccounts.verificationTokenHash, tokenHash),
          gt(memberAccounts.verificationTokenExpiresAt, new Date()),
        ),
      )
      .limit(1);

    if (!account) {
      throw new AppError(
        400,
        "INVALID_OR_EXPIRED_TOKEN",
        "Tautan verifikasi tidak valid atau sudah kedaluwarsa.",
      );
    }

    const now = new Date();
    await db
      .update(memberAccounts)
      .set({
        emailVerifiedAt: now,
        verificationTokenHash: null,
        verificationTokenExpiresAt: null,
        updatedAt: now,
      })
      .where(eq(memberAccounts.id, account.id));

    return reply.send({
      data: {
        email: account.email,
        verified: true,
        verifiedAt: now.toISOString(),
      },
    });
  });

  app.post(
    "/resend-verification",
    { config: { rateLimit: { max: 3, timeWindow: "15 minutes" } } },
    async (request, reply) => {
      const { email } = z
        .object({ email: z.string().email() })
        .parse(request.body);

      const [result] = await db
        .select({
          account: memberAccounts,
          member: members,
        })
        .from(memberAccounts)
        .innerJoin(members, eq(memberAccounts.memberId, members.id))
        .where(eq(memberAccounts.email, email.toLowerCase()))
        .limit(1);

      if (!result) {
        // Return success even if not found to prevent user enumeration
        return reply.send({
          data: {
            message:
              "Jika email terdaftar, tautan verifikasi baru telah dikirimkan.",
          },
        });
      }

      if (result.account.emailVerifiedAt) {
        return reply.send({
          data: {
            message: "Email akun Anda sudah terverifikasi sebelumnya.",
            alreadyVerified: true,
          },
        });
      }

      const rawToken = randomBytes(24).toString("hex");
      const tokenHash = hashMemberSessionToken(rawToken);
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

      await db
        .update(memberAccounts)
        .set({
          verificationTokenHash: tokenHash,
          verificationTokenExpiresAt: expiresAt,
          updatedAt: new Date(),
        })
        .where(eq(memberAccounts.id, result.account.id));

      const verificationUrl = `${config.WEB_ORIGIN}/member/verify-email?token=${rawToken}`;
      void sendEmailVerificationNotification({
        name: result.member.name,
        email: result.account.email,
        phone: result.member.phone,
        token: rawToken,
        verificationUrl,
      });

      return reply.send({
        data: {
          message: "Tautan verifikasi baru berhasil dikirimkan.",
          email: result.account.email,
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

  const getCardHandler = async (request: FastifyRequest) => {
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
          or(eq(membershipCards.code, code), eq(members.memberNumber, code)),
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
          id: result.member.id,
          name: result.member.name,
          memberNumber: result.member.memberNumber,
          avatarUrl: result.member.avatarUrl,
          unitName: result.unit?.name ?? null,
          joinedAt: result.member.joinedAt,
          phone: result.member.phone,
          email: result.member.email,
        },
        card: {
          code: result.card.code,
          issuedAt: result.card.issuedAt,
          expiresAt: result.card.expiresAt,
          version: result.card.version,
        },
        organization: {
          name: site?.name ?? "APTI Indonesia",
          logoUrl: site?.logoUrl ?? null,
        },
      },
    };
  };

  app.get("/cards/:code", getCardHandler);
  app.get("/card/:code", getCardHandler);
};

export const memberPortalRoutes: FastifyPluginAsync = async (app) => {
  app.get(
    "/session",
    { preHandler: app.authenticateMember },
    async (request) => {
      const member = request.currentMember;
      if (!member)
        throw new AppError(401, "MEMBER_UNAUTHENTICATED", "Sign in required.");

      const [card, site, account] = await Promise.all([
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
        db
          .select({
            id: memberAccounts.id,
            emailVerifiedAt: memberAccounts.emailVerifiedAt,
          })
          .from(memberAccounts)
          .where(eq(memberAccounts.memberId, member.id))
          .limit(1)
          .then((rows) => rows[0] ?? null),
      ]);

      return {
        data: {
          member,
          card,
          emailVerified: Boolean(account?.emailVerifiedAt),
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
          submittedAt: row.application.createdAt.toISOString(),
          reviewerNotes: row.application.reviewNotes,
          member: {
            id: row.application.createdMemberId ?? row.application.id,
            name: row.application.fullName,
            email: row.application.email,
            phone: row.application.phone,
            address:
              (row.application.payload as Record<string, unknown> | null)
                ?.address != null
                ? String(
                    (row.application.payload as Record<string, unknown>)
                      .address,
                  )
                : null,
            memberNumber:
              (row.application.payload as Record<string, unknown> | null)
                ?.memberNumber != null
                ? String(
                    (row.application.payload as Record<string, unknown>)
                      .memberNumber,
                  )
                : "PENDING",
            customFields:
              (row.application.payload as Record<string, unknown> | null) ?? {},
          },
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

      if (input.decision === "approve" && result.card) {
        const cardCode = result.card.code;
        const cardUrl = `${config.WEB_ORIGIN}/verify?code=${encodeURIComponent(cardCode)}`;
        const portalUrl = `${config.WEB_ORIGIN}/member/login`;
        void sendApplicationApprovedNotification({
          name: application.fullName,
          email: application.email,
          phone: application.phone,
          memberNumber: result.memberNumber,
          cardCode,
          cardUrl,
          portalUrl,
        });
      }

      return { data: result };
    },
  );

  app.get(
    "/members/:id/card",
    { preHandler: app.authorize("members.read") },
    async (request) => {
      const { id } = z.object({ id: z.string().uuid() }).parse(request.params);
      const [member] = await db
        .select({
          member: members,
          unit: organizationUnits,
        })
        .from(members)
        .leftJoin(organizationUnits, eq(members.unitId, organizationUnits.id))
        .where(eq(members.id, id))
        .limit(1);

      if (!member)
        throw new AppError(404, "MEMBER_NOT_FOUND", "Member not found.");

      let [card] = await db
        .select()
        .from(membershipCards)
        .where(
          and(
            eq(membershipCards.memberId, id),
            isNull(membershipCards.revokedAt),
          ),
        )
        .orderBy(desc(membershipCards.version))
        .limit(1);

      if (!card) {
        const cardCode = `KTA-${randomUUID().slice(0, 8).toUpperCase()}`;
        const [created] = await db
          .insert(membershipCards)
          .values({
            memberId: id,
            code: cardCode,
            version: 1,
            isActive: true,
          })
          .returning();
        card = created;
      }

      const [site] = await db
        .select()
        .from(siteSettings)
        .where(eq(siteSettings.id, "default"))
        .limit(1);

      return {
        data: {
          member: {
            ...member.member,
            unitName: member.unit?.name ?? null,
          },
          card,
          organization: {
            name: site?.name ?? "APTI Indonesia",
            logoUrl: site?.logoUrl ?? null,
          },
        },
      };
    },
  );

  app.post(
    "/members/:id/card/generate",
    { preHandler: app.authorize("members.write") },
    async (request) => {
      const { id } = z.object({ id: z.string().uuid() }).parse(request.params);
      const [member] = await db
        .select()
        .from(members)
        .where(eq(members.id, id))
        .limit(1);

      if (!member)
        throw new AppError(404, "MEMBER_NOT_FOUND", "Member not found.");

      const [existing] = await db
        .select()
        .from(membershipCards)
        .where(
          and(
            eq(membershipCards.memberId, id),
            isNull(membershipCards.revokedAt),
          ),
        )
        .orderBy(desc(membershipCards.version))
        .limit(1);

      const nextVersion = (existing?.version ?? 0) + 1;
      if (existing) {
        await db
          .update(membershipCards)
          .set({ revokedAt: new Date(), isActive: false })
          .where(eq(membershipCards.id, existing.id));
      }

      const cardCode = `KTA-${randomUUID().slice(0, 8).toUpperCase()}`;
      const [newCard] = await db
        .insert(membershipCards)
        .values({
          memberId: id,
          code: cardCode,
          version: nextVersion,
          isActive: true,
        })
        .returning();

      return { data: newCard };
    },
  );

  app.post(
    "/members/:id/notify-card",
    { preHandler: app.authorize("members.write") },
    async (request) => {
      const { id } = z.object({ id: z.string().uuid() }).parse(request.params);
      const [member] = await db
        .select()
        .from(members)
        .where(eq(members.id, id))
        .limit(1);

      if (!member)
        throw new AppError(404, "MEMBER_NOT_FOUND", "Member not found.");

      const [card] = await db
        .select()
        .from(membershipCards)
        .where(
          and(
            eq(membershipCards.memberId, id),
            isNull(membershipCards.revokedAt),
          ),
        )
        .orderBy(desc(membershipCards.version))
        .limit(1);

      if (!card) {
        throw new AppError(
          400,
          "CARD_NOT_ISSUED",
          "Member does not have an active KTA Digital card.",
        );
      }

      if (!member.email) {
        throw new AppError(
          400,
          "MEMBER_NO_EMAIL",
          "Anggota tidak memiliki alamat email yang valid.",
        );
      }

      const cardUrl = `${config.WEB_ORIGIN}/verify?code=${encodeURIComponent(card.code)}`;
      const portalUrl = `${config.WEB_ORIGIN}/member/login`;

      await sendApplicationApprovedNotification({
        name: member.name,
        email: member.email,
        phone: member.phone,
        memberNumber: member.memberNumber,
        cardCode: card.code,
        cardUrl,
        portalUrl,
      });

      return {
        data: {
          sent: true,
          email: member.email,
          phone: member.phone,
          cardCode: card.code,
        },
      };
    },
  );
};
