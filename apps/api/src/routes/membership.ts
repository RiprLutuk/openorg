import { createHash, randomBytes, randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { hash, verify } from "@node-rs/argon2";
import { paginationSchema } from "@openorg/contracts";
import { and, desc, eq, gt, ilike, isNull, or, sql } from "drizzle-orm";
import type { FastifyPluginAsync, FastifyRequest } from "fastify";
import { z } from "zod";
import { config } from "../config";
import { db } from "../db/client";
import {
  auditLogs,
  media,
  memberAccounts,
  memberApplications,
  memberSessions,
  members,
  membershipCards,
  organizationUnits,
  siteSettings,
} from "../db/schema";
import { AppError } from "../lib/errors";
import { generateKtaNumber, generateRegistrationNumber } from "../lib/kta";
import { detectSupportedImage } from "../lib/media";
import { computeProfileCompleteness } from "../lib/profile-completeness";
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
  province: z.string().trim().max(120).nullable().optional(),
  regency: z.string().trim().max(120).nullable().optional(),
  district: z.string().trim().max(120).nullable().optional(),
  village: z.string().trim().max(120).nullable().optional(),
  postalCode: z.string().trim().max(20).nullable().optional(),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
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
  unitId: z.string().uuid().nullable().optional(),
  companyName: z.string().trim().max(180).nullable().optional(),
  biography: z.string().trim().max(2000).nullable().optional(),

  // Mandatory & Additional Member Requirements:
  nik: z
    .string()
    .trim()
    .regex(/^\d{16}$/, "NIK harus terdiri dari 16 digit angka")
    .optional(),
  idCardUrl: z.string().url().nullable().optional(),
  jabatan: z.string().trim().min(2).max(120).optional(),
  korwil: z.string().trim().min(2).max(120).optional(),
  specialization: z.array(z.string().trim()).optional(),
  businessInfo: z
    .object({
      name: z.string().trim().min(1).max(180).optional(),
      specialization: z.array(z.string().trim()).optional(),
      address: z.string().trim().max(2000).optional(),
      staffCount: z.coerce.number().int().min(0).max(1000).optional(),
      phone: z.string().trim().max(40).optional(),
      establishedYear: z.string().trim().max(10).optional(),
    })
    .optional(),
  emergencyContact: z
    .object({
      name: z.string().trim().min(1).max(120).optional(),
      phone: z.string().trim().min(8).max(40).optional(),
      relation: z.string().trim().max(60).optional(),
    })
    .optional(),
  workExperienceYears: z.coerce.number().int().min(0).max(80).optional(),
  certifications: z
    .array(
      z.object({
        title: z.string().trim(),
        issuer: z.string().trim(),
        certificateNumber: z.string().trim().optional(),
        year: z.string().trim().optional(),
        fileUrl: z.string().url().optional(),
      }),
    )
    .optional(),
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
      let unitCode: string | null = null;
      if (input.unitId) {
        const [unit] = await db
          .select({
            id: organizationUnits.id,
            code: organizationUnits.code,
            slug: organizationUnits.slug,
          })
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
        unitCode = unit.code || unit.slug || null;
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

      const memberNumber = generateRegistrationNumber();

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
        const fullAddressFormatted = [
          input.address,
          input.village ? `Kel. ${input.village}` : null,
          input.district ? `Kec. ${input.district}` : null,
          input.regency,
          input.province,
          input.postalCode,
        ]
          .filter(Boolean)
          .join(", ");

        const [created] = await tx
          .insert(members)
          .values({
            unitId: input.unitId ?? null,
            memberNumber,
            name: input.name,
            email: input.email,
            phone: input.phone,
            status: "applicant",
            metadata: {
              dateOfBirth: input.dateOfBirth ?? null,
              companyName: input.companyName ?? null,
              province: input.province ?? null,
              regency: input.regency ?? null,
              district: input.district ?? null,
              village: input.village ?? null,
              postalCode: input.postalCode ?? null,
              addressDetail: input.address ?? null,
              fullAddress: fullAddressFormatted || input.address || null,
              latitude: input.latitude ?? null,
              longitude: input.longitude ?? null,
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
          payload: {
            dateOfBirth: input.dateOfBirth ?? null,
            companyName: input.companyName ?? null,
            province: input.province ?? null,
            regency: input.regency ?? null,
            district: input.district ?? null,
            village: input.village ?? null,
            postalCode: input.postalCode ?? null,
            addressDetail: input.address ?? null,
            fullAddress: fullAddressFormatted || input.address || null,
            latitude: input.latitude ?? null,
            longitude: input.longitude ?? null,
          },
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
        },
      });
    },
  );

  app.post(
    "/verify-email",
    { config: { rateLimit: { max: 10, timeWindow: "15 minutes" } } },
    async (request, reply) => {
      const { token } = z
        .object({ token: z.string().min(10) })
        .parse(request.body);

      const tokenHash = hashMemberSessionToken(token);
      const [result] = await db
        .select({
          account: memberAccounts,
          member: members,
        })
        .from(memberAccounts)
        .innerJoin(members, eq(memberAccounts.memberId, members.id))
        .where(
          and(
            eq(memberAccounts.verificationTokenHash, tokenHash),
            gt(memberAccounts.verificationTokenExpiresAt, new Date()),
          ),
        )
        .limit(1);

      if (!result) {
        throw new AppError(
          400,
          "INVALID_OR_EXPIRED_TOKEN",
          "Tautan verifikasi tidak valid atau sudah kedaluwarsa.",
        );
      }

      const now = new Date();
      const sessionToken = newMemberSessionToken();

      await db.transaction(async (tx) => {
        // 1. Immediately invalidate verification token so it cannot be used again
        await tx
          .update(memberAccounts)
          .set({
            emailVerifiedAt: now,
            verificationTokenHash: null,
            verificationTokenExpiresAt: null,
            lastLoginAt: now,
            updatedAt: now,
          })
          .where(eq(memberAccounts.id, result.account.id));

        // 2. Establish authenticated member session
        await tx.insert(memberSessions).values({
          memberAccountId: result.account.id,
          tokenHash: hashMemberSessionToken(sessionToken),
          ipAddress: request.ip,
          userAgent: request.headers["user-agent"]?.slice(0, 500),
          expiresAt: new Date(Date.now() + MEMBER_SESSION_TTL_SECONDS * 1000),
        });
      });

      // 3. Set member session cookie
      reply.setCookie(config.MEMBER_SESSION_COOKIE_NAME, sessionToken, {
        httpOnly: true,
        secure: config.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: MEMBER_SESSION_TTL_SECONDS,
      });

      return reply.send({
        data: {
          email: result.account.email,
          verified: true,
          verifiedAt: now.toISOString(),
          member: {
            id: result.member.id,
            name: result.member.name,
            status: result.member.status,
            memberNumber: result.member.memberNumber,
          },
          redirectTo: "/member",
        },
      });
    },
  );

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
          theme: site?.theme ?? null,
          primaryColor: site?.primaryColor ?? null,
          secondaryColor: site?.secondaryColor ?? null,
        },
      },
    };
  };

  app.get("/cards/:code", getCardHandler);
  app.get("/card/:code", getCardHandler);
};

export const memberPortalRoutes: FastifyPluginAsync = async (app) => {
  app.get("/session", async (request, reply) => {
    const token = request.cookies[config.MEMBER_SESSION_COOKIE_NAME];
    const [site] = await db
      .select()
      .from(siteSettings)
      .where(eq(siteSettings.id, "default"))
      .limit(1);

    const defaultOrg = {
      id: "default",
      name: site?.name ?? "OpenOrg Association",
      logoUrl: site?.logoUrl ?? null,
      theme: site?.theme ?? null,
      primaryColor: site?.primaryColor ?? null,
      secondaryColor: site?.secondaryColor ?? null,
    };

    if (!token) {
      return {
        data: {
          member: null,
          card: null,
          emailVerified: false,
          organization: defaultOrg,
        },
      };
    }

    const [result] = await db
      .select({ member: members })
      .from(memberSessions)
      .innerJoin(
        memberAccounts,
        eq(memberSessions.memberAccountId, memberAccounts.id),
      )
      .innerJoin(members, eq(memberAccounts.memberId, members.id))
      .where(
        and(
          eq(memberSessions.tokenHash, hashMemberSessionToken(token)),
          gt(memberSessions.expiresAt, new Date()),
        ),
      )
      .limit(1);

    if (!result) {
      reply.clearCookie(config.MEMBER_SESSION_COOKIE_NAME, {
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        secure: config.NODE_ENV === "production",
      });
      return {
        data: {
          member: null,
          card: null,
          emailVerified: false,
          organization: defaultOrg,
        },
      };
    }

    const member = result.member;
    const [card, account] = await Promise.all([
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
        .select({
          id: memberAccounts.id,
          emailVerifiedAt: memberAccounts.emailVerifiedAt,
        })
        .from(memberAccounts)
        .where(eq(memberAccounts.memberId, member.id))
        .limit(1)
        .then((rows) => rows[0] ?? null),
    ]);

    const completeness = computeProfileCompleteness(member);

    return {
      data: {
        member,
        card,
        emailVerified: Boolean(account?.emailVerifiedAt),
        organization: defaultOrg,
        profileCompleteness: completeness,
      },
    };
  });

  app.patch(
    "/profile",
    { preHandler: app.authenticateMember },
    async (request) => {
      const input = profileInput.parse(request.body);
      const member = request.currentMember;
      if (!member)
        throw new AppError(401, "MEMBER_UNAUTHENTICATED", "Sign in required.");

      const {
        name,
        phone,
        address,
        avatarUrl,
        unitId,
        companyName,
        biography,
        nik,
        idCardUrl,
        jabatan,
        korwil,
        specialization,
        businessInfo,
        emergencyContact,
        workExperienceYears,
        certifications,
        metadata: extraMetadata,
      } = input;

      const existingMeta = (member.metadata || {}) as Record<string, unknown>;
      const newMeta: Record<string, unknown> = {
        ...existingMeta,
        ...(extraMetadata || {}),
      };

      if (nik !== undefined) newMeta.nik = nik;
      if (idCardUrl !== undefined) newMeta.idCardUrl = idCardUrl;
      if (jabatan !== undefined) newMeta.jabatan = jabatan;
      if (korwil !== undefined) newMeta.korwil = korwil;
      if (specialization !== undefined) newMeta.specialization = specialization;
      if (businessInfo !== undefined) newMeta.businessInfo = businessInfo;
      if (emergencyContact !== undefined) newMeta.emergencyContact = emergencyContact;
      if (workExperienceYears !== undefined)
        newMeta.workExperienceYears = workExperienceYears;
      if (certifications !== undefined) newMeta.certifications = certifications;
      if (address !== undefined) {
        newMeta.addressDetail = address;
        newMeta.address = address;
      }
      if (companyName !== undefined) newMeta.companyName = companyName;
      if (biography !== undefined) newMeta.biography = biography;

      const updatePayload: Partial<typeof members.$inferInsert> = {
        updatedAt: new Date(),
        metadata: newMeta,
      };

      if (name !== undefined) updatePayload.name = name;
      if (phone !== undefined) updatePayload.phone = phone;
      if (avatarUrl !== undefined) updatePayload.avatarUrl = avatarUrl;
      if (unitId !== undefined) updatePayload.unitId = unitId;

      const [updated] = await db
        .update(members)
        .set(updatePayload)
        .where(eq(members.id, member.id))
        .returning();

      if (!updated) {
        throw new AppError(500, "UPDATE_FAILED", "Failed to update profile.");
      }

      // Also update linked member_applications payload if any
      await db
        .update(memberApplications)
        .set({
          fullName: updated.name,
          phone: updated.phone,
          requestedUnitId: updated.unitId,
          payload: newMeta,
          updatedAt: new Date(),
        })
        .where(eq(memberApplications.createdMemberId, member.id));

      const completeness = computeProfileCompleteness(updated);

      await membershipAudit(
        request,
        "member.profile_updated",
        "member",
        member.id,
        member,
        updated,
      );

      return {
        data: {
          member: updated,
          profileCompleteness: completeness,
        },
      };
    },
  );

  app.post(
    "/upload",
    { preHandler: app.authenticateMember },
    async (request, reply) => {
      const member = request.currentMember;
      if (!member)
        throw new AppError(401, "MEMBER_UNAUTHENTICATED", "Sign in required.");

      const upload = await request.file();
      if (!upload) {
        throw new AppError(
          422,
          "FILE_REQUIRED",
          "Pilih berkas foto profil atau KTP/SIM untuk diunggah.",
        );
      }

      const bytes = await upload.toBuffer();
      if (bytes.length === 0 || bytes.length > 5_242_880) {
        throw new AppError(
          413,
          "FILE_TOO_LARGE",
          "Ukuran berkas maksimal 5 MB.",
        );
      }

      const detected = detectSupportedImage(bytes);
      const isPdf =
        (bytes[0] === 0x25 &&
          bytes[1] === 0x50 &&
          bytes[2] === 0x44 &&
          bytes[3] === 0x46) ||
        upload.mimetype === "application/pdf" ||
        upload.filename.toLowerCase().endsWith(".pdf");

      let extension: string = detected?.extension || "jpg";
      let mimeType: string = detected?.mimeType || upload.mimetype || "image/jpeg";

      if (isPdf) {
        extension = "pdf";
        mimeType = "application/pdf";
      } else if (!detected) {
        const lowerName = upload.filename.toLowerCase();
        if (lowerName.endsWith(".png") || upload.mimetype === "image/png") {
          extension = "png";
          mimeType = "image/png";
        } else if (
          lowerName.endsWith(".webp") ||
          upload.mimetype === "image/webp"
        ) {
          extension = "webp";
          mimeType = "image/webp";
        } else if (
          lowerName.endsWith(".gif") ||
          upload.mimetype === "image/gif"
        ) {
          extension = "gif";
          mimeType = "image/gif";
        } else if (
          lowerName.endsWith(".jpg") ||
          lowerName.endsWith(".jpeg") ||
          upload.mimetype?.startsWith("image/")
        ) {
          extension = "jpg";
          mimeType = "image/jpeg";
        } else {
          throw new AppError(
            415,
            "UNSUPPORTED_MEDIA_TYPE",
            "Format berkas yang didukung: JPG, PNG, WebP, dan PDF.",
          );
        }
      }

      const id = randomUUID();
      const filename = `${id}.${extension}`;
      const target = resolve(config.STORAGE_LOCAL_PATH, filename);
      await mkdir(dirname(target), { recursive: true });
      await writeFile(target, bytes, { flag: "wx" });

      const url = `${config.STORAGE_PUBLIC_URL.replace(/\/$/, "")}/${filename}`;

      const checksumSha256 = createHash("sha256").update(bytes).digest("hex");

      await db
        .insert(media)
        .values({
          id,
          kind: isPdf ? "document" : "image",
          filename,
          mimeType,
          sizeBytes: bytes.length,
          checksumSha256,
          url,
          uploadedBy: null,
          metadata: {
            uploadedByMemberId: member.id,
            originalFilename: upload.filename,
          },
        })
        .returning();

      return reply.status(201).send({
        data: {
          id,
          url,
          filename,
          sizeBytes: bytes.length,
          mimeType,
        },
      });
    },
  );

  app.post("/logout", async (request, reply) => {
    const token = request.cookies[config.MEMBER_SESSION_COOKIE_NAME];
    if (token) {
      await db
        .delete(memberSessions)
        .where(eq(memberSessions.tokenHash, hashMemberSessionToken(token)));
    }
    reply.clearCookie(config.MEMBER_SESSION_COOKIE_NAME, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: config.NODE_ENV === "production",
    });
    return reply.status(200).send({ data: { success: true } });
  });
};

export const adminMembershipRoutes: FastifyPluginAsync = async (app) => {
  app.get(
    "/applications",
    { preHandler: app.authorize("members.read") },
    async (request) => {
      const query = paginationSchema
        .extend({
          limit: z.coerce.number().int().min(1).max(500).default(20),
          status: z.string().optional(),
        })
        .parse(request.query);
      const conditions = [];
      if (query.status)
        conditions.push(eq(memberApplications.status, query.status as any));
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
            createdMember: members,
          })
          .from(memberApplications)
          .leftJoin(
            organizationUnits,
            eq(memberApplications.requestedUnitId, organizationUnits.id),
          )
          .leftJoin(members, eq(memberApplications.createdMemberId, members.id))
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
        data: rows.map((row) => {
          const memberMeta = (row.createdMember?.metadata || {}) as Record<
            string,
            unknown
          >;
          const appPayload = (row.application.payload || {}) as Record<
            string,
            unknown
          >;
          const mergedMeta = { ...appPayload, ...memberMeta };

          const completeness = computeProfileCompleteness(
            row.createdMember || {
              name: row.application.fullName,
              email: row.application.email,
              phone: row.application.phone,
              unitId: row.application.requestedUnitId,
              metadata: mergedMeta,
            },
          );

          return {
            ...row.application,
            unitName: row.unitName,
            submittedAt: row.application.createdAt.toISOString(),
            reviewerNotes: row.application.reviewNotes,
            profileCompleteness: completeness,
            member: {
              id: row.application.createdMemberId ?? row.application.id,
              name: row.createdMember?.name ?? row.application.fullName,
              email: row.createdMember?.email ?? row.application.email,
              phone: row.createdMember?.phone ?? row.application.phone,
              avatarUrl:
                row.createdMember?.avatarUrl ||
                (mergedMeta.avatarUrl as string) ||
                null,
              nik: (mergedMeta.nik as string) || null,
              idCardUrl: (mergedMeta.idCardUrl as string) || null,
              jabatan: (mergedMeta.jabatan as string) || null,
              korwil: (mergedMeta.korwil as string) || null,
              companyName:
                (mergedMeta.companyName as string) ||
                (mergedMeta.businessInfo as any)?.name ||
                null,
              specialization:
                mergedMeta.specialization ||
                (mergedMeta.businessInfo as any)?.specialization ||
                [],
              businessInfo: mergedMeta.businessInfo || null,
              emergencyContact: mergedMeta.emergencyContact || null,
              workExperienceYears: mergedMeta.workExperienceYears || null,
              certifications: mergedMeta.certifications || [],
              address:
                (mergedMeta.address as string | undefined) ??
                (mergedMeta.addressDetail as string | undefined) ??
                null,
              memberNumber:
                row.createdMember?.memberNumber ??
                ((row.application.payload as Record<string, unknown> | null)
                  ?.memberNumber != null
                  ? String(
                      (row.application.payload as Record<string, unknown>)
                        .memberNumber,
                    )
                  : "PENDING"),
              status: row.createdMember?.status ?? row.application.status,
              customFields: mergedMeta,
            },
          };
        }),
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

        // Profile Completeness Gate for Approval
        let targetMember = application.createdMemberId
          ? await tx
              .select()
              .from(members)
              .where(eq(members.id, application.createdMemberId))
              .limit(1)
              .then((r) => r[0])
          : null;

        const completeness = computeProfileCompleteness(
          targetMember || {
            name: application.fullName,
            email: application.email,
            phone: application.phone,
            unitId: application.requestedUnitId,
            metadata: application.payload as Record<string, unknown>,
          },
        );

        if (!completeness.isComplete) {
          throw new AppError(
            422,
            "PROFILE_INCOMPLETE",
            `Permohonan belum dapat disetujui karena berkas wajib belum lengkap: ${completeness.missingFields.join(", ")}.`,
          );
        }

        const [settings] = await tx
          .select({ name: siteSettings.name, slug: siteSettings.slug })
          .from(siteSettings)
          .limit(1);
        const orgName = settings?.name || "APTI";

        let unit:
          | {
              name: string;
              code: string | null;
              slug: string | null;
            }
          | undefined;
        if (application.requestedUnitId) {
          const [u] = await tx
            .select({
              name: organizationUnits.name,
              code: organizationUnits.code,
              slug: organizationUnits.slug,
            })
            .from(organizationUnits)
            .where(eq(organizationUnits.id, application.requestedUnitId))
            .limit(1);
          unit = u;
        }

        let memberId = application.createdMemberId;
        let memberNumber: string;

        if (!memberId) {
          memberNumber = generateKtaNumber({
            orgName,
            unitCode: unit?.code,
            unitName: unit?.name,
            unitSlug: unit?.slug,
            date: reviewedAt,
          });
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
          const [existingMem] = await tx
            .select({ memberNumber: members.memberNumber })
            .from(members)
            .where(eq(members.id, memberId))
            .limit(1);

          if (
            existingMem?.memberNumber &&
            !existingMem.memberNumber.startsWith("REG-") &&
            !existingMem.memberNumber.startsWith("APP-")
          ) {
            memberNumber = existingMem.memberNumber;
          } else {
            memberNumber = generateKtaNumber({
              orgName,
              unitCode: unit?.code,
              unitName: unit?.name,
              unitSlug: unit?.slug,
              date: reviewedAt,
            });
          }

          await tx
            .update(members)
            .set({
              memberNumber,
              status: "active",
              joinedAt: reviewedAt,
            })
            .where(eq(members.id, memberId));
        }

        const cardCode = memberNumber;
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

      const [site] = await db
        .select()
        .from(siteSettings)
        .where(eq(siteSettings.id, "default"))
        .limit(1);

      let memberNumber = member.member.memberNumber;
      if (
        memberNumber.startsWith("REG-") ||
        memberNumber.startsWith("APP-") ||
        memberNumber.startsWith("KTA-")
      ) {
        memberNumber = generateKtaNumber({
          orgName: site?.name,
          unitName: member.unit?.name,
          unitCode: member.unit?.code,
          unitSlug: member.unit?.slug,
          date: new Date(),
        });
        await db
          .update(members)
          .set({
            memberNumber,
            status: "active",
            joinedAt: member.member.joinedAt ?? new Date(),
          })
          .where(eq(members.id, id));
      }

      if (!card || card.code !== memberNumber) {
        if (card) {
          await db
            .update(membershipCards)
            .set({ revokedAt: new Date(), isActive: false })
            .where(eq(membershipCards.id, card.id));
        }
        const [created] = await db
          .insert(membershipCards)
          .values({
            memberId: id,
            code: memberNumber,
            version: (card?.version ?? 0) + 1,
            isActive: true,
          })
          .returning();
        card = created;
      }

      return {
        data: {
          member: {
            ...member.member,
            memberNumber,
            joinedAt: member.member.joinedAt ?? new Date(),
            unitName: member.unit?.name ?? null,
          },
          card,
          organization: {
            name: site?.name ?? "APTI Indonesia",
            logoUrl: site?.logoUrl ?? null,
            theme: site?.theme ?? null,
            primaryColor: site?.primaryColor ?? null,
            secondaryColor: site?.secondaryColor ?? null,
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

      const [site] = await db
        .select()
        .from(siteSettings)
        .where(eq(siteSettings.id, "default"))
        .limit(1);

      let memberNumber = member.member.memberNumber;
      if (
        memberNumber.startsWith("REG-") ||
        memberNumber.startsWith("APP-") ||
        memberNumber.startsWith("KTA-")
      ) {
        memberNumber = generateKtaNumber({
          orgName: site?.name,
          unitName: member.unit?.name,
          unitCode: member.unit?.code,
          unitSlug: member.unit?.slug,
          date: new Date(),
        });
        await db
          .update(members)
          .set({
            memberNumber,
            status: "active",
            joinedAt: member.member.joinedAt ?? new Date(),
          })
          .where(eq(members.id, id));
      }

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

      const [newCard] = await db
        .insert(membershipCards)
        .values({
          memberId: id,
          code: memberNumber,
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
