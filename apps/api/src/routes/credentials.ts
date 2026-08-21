import {
  type CredentialField,
  credentialSchemeInputSchema,
  credentialStatusSchema,
  paginationSchema,
  verificationLevelSchema,
} from "@openorg/contracts";
import { and, asc, desc, eq, ilike, isNull, or } from "drizzle-orm";
import type { FastifyPluginAsync, FastifyRequest } from "fastify";
import { z } from "zod";
import { db } from "../db/client";
import {
  auditLogs,
  credentialEvidence,
  credentialRequirements,
  credentialSchemes,
  credentialVerificationEvents,
  memberCredentials,
  members,
  organizationUnits,
} from "../db/schema";
import {
  evaluateCredentialRequirements,
  meetsVerificationLevel,
} from "../lib/compliance";
import { AppError } from "../lib/errors";

const idParams = z.object({ id: z.string().uuid() });
const requirementInput = z
  .object({
    schemeId: z.string().uuid(),
    membershipType: z.string().trim().min(1).max(80).default("default"),
    rule: z.enum(["required", "one_of", "optional"]).default("required"),
    groupKey: z.string().trim().max(80).nullable().optional(),
    requiredVerificationLevel:
      verificationLevelSchema.default("document_checked"),
    gracePeriodDays: z.number().int().min(0).max(3650).default(0),
    blocksApproval: z.boolean().default(false),
    sortOrder: z.number().int().min(0).max(10_000).default(0),
  })
  .superRefine((value, context) => {
    if (value.rule === "one_of" && !value.groupKey)
      context.addIssue({
        code: "custom",
        path: ["groupKey"],
        message: "A group key is required for one-of requirements.",
      });
  });
const credentialInput = z.object({
  schemeId: z.string().uuid(),
  credentialNumber: z.string().trim().max(180).nullable().optional(),
  issuerName: z.string().trim().max(180).nullable().optional(),
  issuedAt: z.string().datetime().nullable().optional(),
  expiresAt: z.string().datetime().nullable().optional(),
  sourceUrl: z.string().url().max(2048).nullable().optional(),
  evidenceLabel: z.string().trim().max(180).nullable().optional(),
  evidenceUrl: z.string().url().max(2048).nullable().optional(),
  data: z.record(z.string(), z.unknown()).default({}),
});
const adminCredentialInput = credentialInput.extend({
  memberId: z.string().uuid(),
});
const verificationInput = z
  .object({
    decision: z.enum(["verify", "reject", "revoke"]),
    verificationLevel: verificationLevelSchema,
    method: z
      .enum([
        "document_review",
        "issuer_confirmation",
        "api",
        "digital_signature",
      ])
      .default("document_review"),
    source: z.string().trim().max(180).nullable().optional(),
    notes: z.string().trim().max(5000).nullable().optional(),
    result: z.record(z.string(), z.unknown()).default({}),
  })
  .superRefine((value, context) => {
    if (value.decision !== "verify" && !value.notes)
      context.addIssue({
        code: "custom",
        path: ["notes"],
        message: "A reason is required for rejection or revocation.",
      });
  });

function effectiveStatus(credential: typeof memberCredentials.$inferSelect) {
  if (
    credential.status === "verified" &&
    credential.expiresAt &&
    credential.expiresAt < new Date()
  )
    return "expired" as const;
  return credential.status;
}

function validateDynamicData(
  fields: CredentialField[],
  data: Record<string, unknown>,
) {
  const allowed = new Set(fields.map((field) => field.key));
  const unknown = Object.keys(data).filter((key) => !allowed.has(key));
  if (unknown.length)
    throw new AppError(
      422,
      "UNKNOWN_CREDENTIAL_FIELDS",
      `Unsupported credential fields: ${unknown.join(", ")}.`,
    );
  const missing = fields
    .filter(
      (field) =>
        field.required &&
        (data[field.key] === undefined || data[field.key] === ""),
    )
    .map((field) => field.label);
  if (missing.length)
    throw new AppError(
      422,
      "MISSING_CREDENTIAL_FIELDS",
      `Required credential fields are missing: ${missing.join(", ")}.`,
    );
  for (const field of fields) {
    const value = data[field.key];
    if (value === undefined || value === null || value === "") continue;
    if (field.type === "number" && typeof value !== "number")
      throw new AppError(
        422,
        "INVALID_CREDENTIAL_FIELD",
        `${field.label} must be a number.`,
      );
    if (field.type === "date" && !z.string().date().safeParse(value).success)
      throw new AppError(
        422,
        "INVALID_CREDENTIAL_FIELD",
        `${field.label} must be a date.`,
      );
    if (field.type === "url" && !z.string().url().safeParse(value).success)
      throw new AppError(
        422,
        "INVALID_CREDENTIAL_FIELD",
        `${field.label} must be a URL.`,
      );
    if (
      field.type === "select" &&
      field.options?.length &&
      !field.options.includes(String(value))
    )
      throw new AppError(
        422,
        "INVALID_CREDENTIAL_FIELD",
        `${field.label} contains an unsupported option.`,
      );
  }
}

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

async function tenantScheme(organizationId: string, schemeId: string) {
  const [scheme] = await db
    .select()
    .from(credentialSchemes)
    .where(
      and(
        eq(credentialSchemes.id, schemeId),
        eq(credentialSchemes.organizationId, organizationId),
      ),
    )
    .limit(1);
  if (!scheme)
    throw new AppError(
      404,
      "CREDENTIAL_SCHEME_NOT_FOUND",
      "The credential scheme was not found.",
    );
  return scheme;
}

export const adminCredentialRoutes: FastifyPluginAsync = async (app) => {
  app.get(
    "/schemes",
    { preHandler: app.authorize("credentials.read") },
    async (request) => {
      const rows = await db
        .select()
        .from(credentialSchemes)
        .where(eq(credentialSchemes.organizationId, request.organization.id))
        .orderBy(asc(credentialSchemes.category), asc(credentialSchemes.name));
      return { data: rows };
    },
  );

  app.post(
    "/schemes",
    { preHandler: app.authorize("credentials.write") },
    async (request, reply) => {
      const input = credentialSchemeInputSchema.parse(request.body);
      const [duplicate] = await db
        .select({ id: credentialSchemes.id })
        .from(credentialSchemes)
        .where(
          and(
            eq(credentialSchemes.organizationId, request.organization.id),
            eq(credentialSchemes.code, input.code),
          ),
        )
        .limit(1);
      if (duplicate)
        throw new AppError(
          409,
          "CREDENTIAL_SCHEME_CODE_EXISTS",
          "A credential scheme with this code already exists.",
        );
      const [created] = await db
        .insert(credentialSchemes)
        .values({ organizationId: request.organization.id, ...input })
        .returning();
      if (!created) throw new Error("Could not create credential scheme.");
      await audit(
        request,
        "credential.scheme_created",
        "credential_scheme",
        created.id,
        undefined,
        created,
      );
      return reply.status(201).send({ data: created });
    },
  );

  app.patch(
    "/schemes/:id",
    { preHandler: app.authorize("credentials.write") },
    async (request) => {
      const { id } = idParams.parse(request.params);
      const before = await tenantScheme(request.organization.id, id);
      const input = credentialSchemeInputSchema.partial().parse(request.body);
      const [updated] = await db
        .update(credentialSchemes)
        .set({ ...input, updatedAt: new Date() })
        .where(
          and(
            eq(credentialSchemes.id, id),
            eq(credentialSchemes.organizationId, request.organization.id),
          ),
        )
        .returning();
      await audit(
        request,
        "credential.scheme_updated",
        "credential_scheme",
        id,
        before,
        updated,
      );
      return { data: updated };
    },
  );

  app.get(
    "/requirements",
    { preHandler: app.authorize("credentials.read") },
    async (request) => {
      const query = z
        .object({ membershipType: z.string().trim().max(80).optional() })
        .parse(request.query);
      const conditions = [
        eq(credentialRequirements.organizationId, request.organization.id),
      ];
      if (query.membershipType)
        conditions.push(
          eq(credentialRequirements.membershipType, query.membershipType),
        );
      const rows = await db
        .select({
          requirement: credentialRequirements,
          scheme: credentialSchemes,
        })
        .from(credentialRequirements)
        .innerJoin(
          credentialSchemes,
          eq(credentialRequirements.schemeId, credentialSchemes.id),
        )
        .where(and(...conditions))
        .orderBy(asc(credentialRequirements.sortOrder));
      return {
        data: rows.map((row) => ({ ...row.requirement, scheme: row.scheme })),
      };
    },
  );

  app.post(
    "/requirements",
    { preHandler: app.authorize("credentials.write") },
    async (request, reply) => {
      const input = requirementInput.parse(request.body);
      await tenantScheme(request.organization.id, input.schemeId);
      const [existing] = await db
        .select()
        .from(credentialRequirements)
        .where(
          and(
            eq(credentialRequirements.organizationId, request.organization.id),
            eq(credentialRequirements.schemeId, input.schemeId),
            eq(credentialRequirements.membershipType, input.membershipType),
          ),
        )
        .limit(1);
      const [saved] = existing
        ? await db
            .update(credentialRequirements)
            .set({ ...input, updatedAt: new Date() })
            .where(eq(credentialRequirements.id, existing.id))
            .returning()
        : await db
            .insert(credentialRequirements)
            .values({ organizationId: request.organization.id, ...input })
            .returning();
      if (!saved) throw new Error("Could not save credential requirement.");
      await audit(
        request,
        "credential.requirement_saved",
        "credential_requirement",
        saved.id,
        existing,
        saved,
      );
      return reply.status(existing ? 200 : 201).send({ data: saved });
    },
  );

  app.delete(
    "/requirements/:id",
    { preHandler: app.authorize("credentials.write") },
    async (request, reply) => {
      const { id } = idParams.parse(request.params);
      const [deleted] = await db
        .delete(credentialRequirements)
        .where(
          and(
            eq(credentialRequirements.id, id),
            eq(credentialRequirements.organizationId, request.organization.id),
          ),
        )
        .returning();
      if (!deleted)
        throw new AppError(
          404,
          "CREDENTIAL_REQUIREMENT_NOT_FOUND",
          "The requirement was not found.",
        );
      await audit(
        request,
        "credential.requirement_deleted",
        "credential_requirement",
        id,
        deleted,
      );
      return reply.status(204).send();
    },
  );

  app.get(
    "/credentials",
    { preHandler: app.authorize("credentials.read") },
    async (request) => {
      const query = paginationSchema
        .extend({
          status: credentialStatusSchema.optional(),
          schemeId: z.string().uuid().optional(),
          memberId: z.string().uuid().optional(),
        })
        .parse(request.query);
      const conditions = [
        eq(memberCredentials.organizationId, request.organization.id),
        isNull(members.deletedAt),
      ];
      if (query.status)
        conditions.push(eq(memberCredentials.status, query.status));
      if (query.schemeId)
        conditions.push(eq(memberCredentials.schemeId, query.schemeId));
      if (query.memberId)
        conditions.push(eq(memberCredentials.memberId, query.memberId));
      if (query.search)
        conditions.push(
          or(
            ilike(members.name, `%${query.search}%`),
            ilike(members.memberNumber, `%${query.search}%`),
            ilike(memberCredentials.credentialNumber, `%${query.search}%`),
          ) as ReturnType<typeof ilike>,
        );
      const rows = await db
        .select({
          credential: memberCredentials,
          scheme: credentialSchemes,
          member: {
            id: members.id,
            name: members.name,
            memberNumber: members.memberNumber,
            status: members.status,
          },
          unitName: organizationUnits.name,
        })
        .from(memberCredentials)
        .innerJoin(
          credentialSchemes,
          eq(memberCredentials.schemeId, credentialSchemes.id),
        )
        .innerJoin(members, eq(memberCredentials.memberId, members.id))
        .leftJoin(organizationUnits, eq(members.unitId, organizationUnits.id))
        .where(and(...conditions))
        .orderBy(desc(memberCredentials.updatedAt))
        .limit(query.limit)
        .offset((query.page - 1) * query.limit);
      return {
        data: rows.map((row) => ({
          ...row.credential,
          effectiveStatus: effectiveStatus(row.credential),
          scheme: row.scheme,
          member: row.member,
          unitName: row.unitName,
        })),
      };
    },
  );

  app.post(
    "/credentials",
    { preHandler: app.authorize("credentials.write") },
    async (request, reply) => {
      const input = adminCredentialInput.parse(request.body);
      const scheme = await tenantScheme(
        request.organization.id,
        input.schemeId,
      );
      const [member] = await db
        .select({ id: members.id })
        .from(members)
        .where(
          and(
            eq(members.id, input.memberId),
            eq(members.organizationId, request.organization.id),
            isNull(members.deletedAt),
          ),
        )
        .limit(1);
      if (!member)
        throw new AppError(
          404,
          "MEMBER_NOT_FOUND",
          "The member was not found.",
        );
      validateDynamicData(scheme.fields, input.data);
      const { memberId, evidenceLabel, evidenceUrl, ...values } = input;
      const [created] = await db.transaction(async (tx) => {
        const [credential] = await tx
          .insert(memberCredentials)
          .values({
            organizationId: request.organization.id,
            memberId,
            ...values,
            issuedAt: values.issuedAt ? new Date(values.issuedAt) : null,
            expiresAt: values.expiresAt ? new Date(values.expiresAt) : null,
            status: "submitted",
          })
          .returning();
        if (!credential) throw new Error("Could not create credential.");
        if (evidenceUrl)
          await tx.insert(credentialEvidence).values({
            organizationId: request.organization.id,
            credentialId: credential.id,
            label: evidenceLabel || "Supporting evidence",
            sourceUrl: evidenceUrl,
            createdBy: request.currentUser?.id,
          });
        return [credential];
      });
      await audit(
        request,
        "credential.submitted",
        "member_credential",
        created.id,
        undefined,
        created,
      );
      return reply.status(201).send({ data: created });
    },
  );

  app.get(
    "/credentials/:id",
    { preHandler: app.authorize("credentials.read") },
    async (request) => {
      const { id } = idParams.parse(request.params);
      const [row, evidence, timeline] = await Promise.all([
        db
          .select({
            credential: memberCredentials,
            scheme: credentialSchemes,
            member: members,
          })
          .from(memberCredentials)
          .innerJoin(
            credentialSchemes,
            eq(memberCredentials.schemeId, credentialSchemes.id),
          )
          .innerJoin(members, eq(memberCredentials.memberId, members.id))
          .where(
            and(
              eq(memberCredentials.id, id),
              eq(memberCredentials.organizationId, request.organization.id),
            ),
          )
          .limit(1)
          .then((rows) => rows[0]),
        db
          .select()
          .from(credentialEvidence)
          .where(
            and(
              eq(credentialEvidence.credentialId, id),
              eq(credentialEvidence.organizationId, request.organization.id),
            ),
          ),
        db
          .select()
          .from(credentialVerificationEvents)
          .where(
            and(
              eq(credentialVerificationEvents.credentialId, id),
              eq(
                credentialVerificationEvents.organizationId,
                request.organization.id,
              ),
            ),
          )
          .orderBy(desc(credentialVerificationEvents.createdAt)),
      ]);
      if (!row)
        throw new AppError(
          404,
          "CREDENTIAL_NOT_FOUND",
          "The credential was not found.",
        );
      return {
        data: {
          ...row.credential,
          effectiveStatus: effectiveStatus(row.credential),
          scheme: row.scheme,
          member: row.member,
          evidence,
          timeline,
        },
      };
    },
  );

  app.patch(
    "/credentials/:id/verify",
    { preHandler: app.authorize("credentials.verify") },
    async (request) => {
      const { id } = idParams.parse(request.params);
      const input = verificationInput.parse(request.body);
      const [before] = await db
        .select({ credential: memberCredentials, scheme: credentialSchemes })
        .from(memberCredentials)
        .innerJoin(
          credentialSchemes,
          eq(memberCredentials.schemeId, credentialSchemes.id),
        )
        .where(
          and(
            eq(memberCredentials.id, id),
            eq(memberCredentials.organizationId, request.organization.id),
          ),
        )
        .limit(1);
      if (!before)
        throw new AppError(
          404,
          "CREDENTIAL_NOT_FOUND",
          "The credential was not found.",
        );
      if (
        input.decision === "verify" &&
        !meetsVerificationLevel(
          input.verificationLevel,
          before.scheme.minimumVerificationLevel,
        )
      )
        throw new AppError(
          422,
          "VERIFICATION_LEVEL_TOO_LOW",
          `This scheme requires at least ${before.scheme.minimumVerificationLevel.replaceAll("_", " ")}.`,
        );
      const nextStatus =
        input.decision === "verify"
          ? "verified"
          : input.decision === "reject"
            ? "rejected"
            : "revoked";
      const now = new Date();
      const [updated] = await db.transaction(async (tx) => {
        const [credential] = await tx
          .update(memberCredentials)
          .set({
            status: nextStatus,
            verificationLevel: input.verificationLevel,
            verifiedAt: input.decision === "verify" ? now : null,
            verifiedBy: request.currentUser?.id,
            revokedAt: input.decision === "revoke" ? now : null,
            revokeReason: input.decision === "revoke" ? input.notes : null,
            updatedAt: now,
          })
          .where(eq(memberCredentials.id, id))
          .returning();
        await tx.insert(credentialVerificationEvents).values({
          organizationId: request.organization.id,
          credentialId: id,
          fromStatus: before.credential.status,
          toStatus: nextStatus,
          verificationLevel: input.verificationLevel,
          method: input.method,
          source: input.source,
          notes: input.notes,
          result: input.result,
          actorId: request.currentUser?.id,
        });
        return [credential];
      });
      await audit(
        request,
        `credential.${nextStatus}`,
        "member_credential",
        id,
        before.credential,
        updated,
      );
      return { data: updated };
    },
  );
};

export const memberCredentialRoutes: FastifyPluginAsync = async (app) => {
  app.get(
    "/credentials",
    { preHandler: app.authenticateMember },
    async (request) => {
      const member = request.currentMember;
      if (!member)
        throw new AppError(401, "MEMBER_UNAUTHENTICATED", "Sign in required.");
      const membershipType =
        typeof member.customFields.membershipType === "string"
          ? member.customFields.membershipType
          : "default";
      const [requirements, credentials] = await Promise.all([
        db
          .select({
            requirement: credentialRequirements,
            scheme: credentialSchemes,
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
              eq(credentialSchemes.isActive, true),
            ),
          )
          .orderBy(asc(credentialRequirements.sortOrder)),
        db
          .select({ credential: memberCredentials, scheme: credentialSchemes })
          .from(memberCredentials)
          .innerJoin(
            credentialSchemes,
            eq(memberCredentials.schemeId, credentialSchemes.id),
          )
          .where(
            and(
              eq(memberCredentials.organizationId, request.organization.id),
              eq(memberCredentials.memberId, member.id),
            ),
          )
          .orderBy(desc(memberCredentials.updatedAt)),
      ]);
      const items = credentials.map((row) => ({
        ...row.credential,
        effectiveStatus: effectiveStatus(row.credential),
        scheme: row.scheme,
      }));
      const compliance = evaluateCredentialRequirements(
        requirements.map(({ requirement }) => requirement),
        items,
      );
      return {
        data: {
          membershipType,
          requirements: requirements.map((row) => {
            return {
              ...row.requirement,
              scheme: row.scheme,
              satisfied: compliance.satisfiedById[row.requirement.id] ?? false,
            };
          }),
          credentials: items,
        },
      };
    },
  );

  app.post(
    "/credentials",
    { preHandler: app.authenticateMember },
    async (request, reply) => {
      const member = request.currentMember;
      if (!member)
        throw new AppError(401, "MEMBER_UNAUTHENTICATED", "Sign in required.");
      const input = credentialInput.parse(request.body);
      const scheme = await tenantScheme(
        request.organization.id,
        input.schemeId,
      );
      if (!scheme.isActive)
        throw new AppError(
          422,
          "CREDENTIAL_SCHEME_INACTIVE",
          "This credential scheme is not accepting submissions.",
        );
      validateDynamicData(scheme.fields, input.data);
      const { evidenceLabel, evidenceUrl, ...values } = input;
      const [created] = await db.transaction(async (tx) => {
        const [credential] = await tx
          .insert(memberCredentials)
          .values({
            organizationId: request.organization.id,
            memberId: member.id,
            ...values,
            issuedAt: values.issuedAt ? new Date(values.issuedAt) : null,
            expiresAt: values.expiresAt ? new Date(values.expiresAt) : null,
            issuerName: values.issuerName ?? scheme.issuerName,
            status: "submitted",
            verificationLevel: "self_declared",
          })
          .returning();
        if (!credential) throw new Error("Could not submit credential.");
        if (evidenceUrl)
          await tx.insert(credentialEvidence).values({
            organizationId: request.organization.id,
            credentialId: credential.id,
            label: evidenceLabel || "Member-provided evidence",
            sourceUrl: evidenceUrl,
          });
        return [credential];
      });
      await audit(
        request,
        "credential.member_submitted",
        "member_credential",
        created.id,
        undefined,
        created,
      );
      return reply.status(201).send({ data: created });
    },
  );
};
