import {
  credentialSchemeInputSchema,
  verificationLevelSchema,
} from "@openorg/contracts";
import { asc, desc, eq } from "drizzle-orm";
import type { FastifyPluginAsync, FastifyRequest } from "fastify";
import { z } from "zod";
import { db } from "../db/client";
import {
  auditLogs,
  credentialRequirements,
  credentialSchemes,
  memberCredentials,
  members,
} from "../db/schema";
import { AppError } from "../lib/errors";

const _idParams = z.object({ id: z.string().uuid() });
const _requirementInput = z.object({
  schemeId: z.string().uuid(),
  ruleGroup: z.string().trim().max(80).default("primary"),
  ruleType: z.enum(["required", "one_of", "optional"]).default("required"),
  prerequisiteSchemeId: z.string().uuid(),
});

const credentialInput = z.object({
  memberId: z.string().uuid(),
  schemeId: z.string().uuid(),
  credentialNumber: z.string().trim().max(100),
  verificationLevel: verificationLevelSchema.default("document_checked"),
  issuedAt: z.string().datetime().optional(),
  expiresAt: z.string().datetime().nullable().optional(),
  payload: z.record(z.string(), z.unknown()).default({}),
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

async function getScheme(schemeId: string) {
  const [scheme] = await db
    .select()
    .from(credentialSchemes)
    .where(eq(credentialSchemes.id, schemeId))
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
    async () => {
      const rows = await db
        .select()
        .from(credentialSchemes)
        .orderBy(asc(credentialSchemes.name));
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
        .where(eq(credentialSchemes.code, input.code))
        .limit(1);
      if (duplicate)
        throw new AppError(
          409,
          "CREDENTIAL_SCHEME_CODE_EXISTS",
          "A credential scheme with this code already exists.",
        );
      const [created] = await db
        .insert(credentialSchemes)
        .values(input)
        .returning();
      if (!created) throw new Error("Could not create credential scheme.");
      await audit(
        request,
        "credential_scheme.create",
        "credential_scheme",
        created.id,
        undefined,
        created,
      );
      return reply.status(201).send({ data: created });
    },
  );

  app.get(
    "/issued",
    { preHandler: app.authorize("credentials.read") },
    async () => {
      const rows = await db
        .select({
          credential: memberCredentials,
          memberName: members.name,
          memberNumber: members.memberNumber,
          schemeName: credentialSchemes.name,
        })
        .from(memberCredentials)
        .innerJoin(members, eq(memberCredentials.memberId, members.id))
        .innerJoin(
          credentialSchemes,
          eq(memberCredentials.schemeId, credentialSchemes.id),
        )
        .orderBy(desc(memberCredentials.issuedAt));
      return { data: rows };
    },
  );

  app.post(
    "/issued",
    { preHandler: app.authorize("credentials.write") },
    async (request, reply) => {
      const input = credentialInput.parse(request.body);
      await getScheme(input.schemeId);
      const [created] = await db
        .insert(memberCredentials)
        .values({
          ...input,
          issuedAt: input.issuedAt ? new Date(input.issuedAt) : new Date(),
          expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
          issuedBy: request.currentUser?.id,
        })
        .returning();
      await audit(
        request,
        "member_credential.issue",
        "member_credential",
        created?.id ?? "",
        undefined,
        created,
      );
      return reply.status(201).send({ data: created });
    },
  );

  app.get(
    "/credentials",
    { preHandler: app.authorize("credentials.read") },
    async (request) => {
      const query = z
        .object({
          limit: z.coerce.number().int().min(1).max(200).default(100),
          search: z.string().optional(),
          status: z.string().optional(),
        })
        .parse(request.query);

      const [rawCredentials, rawSchemes, memberList] = await Promise.all([
        db
          .select()
          .from(memberCredentials)
          .orderBy(desc(memberCredentials.createdAt))
          .limit(query.limit),
        db.select().from(credentialSchemes),
        db.select().from(members),
      ]);

      const schemeMap = new Map(rawSchemes.map((s) => [s.id, s]));
      const memberMap = new Map(memberList.map((m) => [m.id, m]));

      let items = rawCredentials.map((c) => {
        const member = memberMap.get(c.memberId) ?? {
          id: c.memberId,
          name: "Anggota",
          memberNumber: "MEM-0000",
        };
        const scheme = schemeMap.get(c.schemeId) ?? {
          id: c.schemeId,
          name: "Sertifikat",
          code: "CERT",
          category: "legal",
          issuerName: null,
          minimumVerificationLevel: "document_checked",
          fields: [],
        };
        return {
          ...c,
          effectiveStatus: c.status,
          verificationLevel: c.verificationLevel ?? "document_checked",
          data: (c.payload ?? {}) as Record<string, unknown>,
          scheme,
          member,
        };
      });

      if (query.status) {
        items = items.filter((item) => item.status === query.status);
      }
      if (query.search) {
        const s = query.search.toLowerCase();
        items = items.filter(
          (item) =>
            item.member.name.toLowerCase().includes(s) ||
            item.member.memberNumber.toLowerCase().includes(s) ||
            item.scheme.name.toLowerCase().includes(s) ||
            (item.credentialNumber &&
              item.credentialNumber.toLowerCase().includes(s)),
        );
      }

      return { data: items };
    },
  );

  app.patch(
    "/credentials/:id/verify",
    { preHandler: app.authorize("credentials.write") },
    async (request) => {
      const { id } = z.object({ id: z.string().uuid() }).parse(request.params);
      const input = z
        .object({
          decision: z.enum(["verify", "reject", "revoke"]),
          verificationLevel: z.string().optional(),
          method: z.string().optional(),
          source: z.string().nullable().optional(),
          notes: z.string().nullable().optional(),
        })
        .parse(request.body);

      const nextStatus =
        input.decision === "verify"
          ? "verified"
          : input.decision === "revoke"
            ? "revoked"
            : "rejected";

      const [updated] = await db
        .update(memberCredentials)
        .set({
          status: nextStatus,
          verificationLevel: (input.verificationLevel ?? "document_checked") as
            | "document_checked"
            | "api_verified"
            | "cryptographically_verified"
            | "issuer_confirmed"
            | "self_declared",
          updatedAt: new Date(),
        })
        .where(eq(memberCredentials.id, id))
        .returning();

      if (!updated)
        throw new AppError(
          404,
          "CREDENTIAL_NOT_FOUND",
          "Kredensial tidak ditemukan.",
        );

      await audit(
        request,
        `member_credential.${input.decision}`,
        "member_credential",
        id,
        undefined,
        updated,
      );

      return { data: updated };
    },
  );

  app.patch(
    "/credentials/:id/review",
    { preHandler: app.authorize("credentials.write") },
    async (request) => {
      const { id } = z.object({ id: z.string().uuid() }).parse(request.params);
      const input = z
        .object({
          decision: z.enum(["approve", "reject"]),
          notes: z.string().optional(),
        })
        .parse(request.body);

      const [updated] = await db
        .update(memberCredentials)
        .set({
          status: input.decision === "approve" ? "verified" : "rejected",
          updatedAt: new Date(),
        })
        .where(eq(memberCredentials.id, id))
        .returning();

      if (!updated)
        throw new AppError(
          404,
          "CREDENTIAL_NOT_FOUND",
          "Sertifikat tidak ditemukan.",
        );

      return { data: updated };
    },
  );

  app.get(
    "/requirements",
    { preHandler: app.authorize("credentials.read") },
    async () => {
      const rows = await db.select().from(credentialRequirements);
      return { data: rows };
    },
  );

  app.post(
    "/requirements",
    { preHandler: app.authorize("credentials.write") },
    async (request) => {
      const input = z
        .object({
          schemeId: z.string().uuid(),
          prerequisiteSchemeId: z.string().uuid().optional(),
          ruleType: z.enum(["required", "one_of", "optional"]).optional(),
        })
        .parse(request.body);

      const [created] = await db
        .insert(credentialRequirements)
        .values({
          schemeId: input.schemeId,
          prerequisiteSchemeId: input.prerequisiteSchemeId ?? input.schemeId,
          ruleType: input.ruleType ?? "required",
        })
        .returning();

      return { data: created };
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

      const [rawCredentials, rawSchemes, rawRequirements] = await Promise.all([
        db
          .select()
          .from(memberCredentials)
          .where(eq(memberCredentials.memberId, member.id))
          .orderBy(desc(memberCredentials.issuedAt)),
        db.select().from(credentialSchemes),
        db.select().from(credentialRequirements),
      ]);

      const schemeMap = new Map(rawSchemes.map((s) => [s.id, s]));

      const credentials = rawCredentials.map((c) => {
        const scheme = schemeMap.get(c.schemeId) ?? {
          id: c.schemeId,
          name: "Sertifikat",
          code: "CERT",
          description: null,
          issuerName: null,
          fields: [],
        };
        const payloadData = (c.payload ?? {}) as Record<string, unknown>;
        return {
          id: c.id,
          schemeId: c.schemeId,
          credentialNumber: c.credentialNumber,
          issuerName: (payloadData.issuerName as string) ?? null,
          issuedAt: c.issuedAt?.toISOString() ?? null,
          expiresAt: c.expiresAt?.toISOString() ?? null,
          effectiveStatus: c.status,
          verificationLevel: c.verificationLevel ?? "document_checked",
          scheme,
        };
      });

      const requirements = rawRequirements.map((r) => {
        const scheme = schemeMap.get(r.schemeId) ?? {
          id: r.schemeId,
          name: "Sertifikat",
          code: "CERT",
          description: null,
          issuerName: null,
          minimumVerificationLevel: "document_checked" as const,
          fields: [],
        };
        return {
          id: r.id,
          schemeId: r.schemeId,
          rule: r.ruleType,
          requiredVerificationLevel: scheme.minimumVerificationLevel,
          blocksApproval: r.ruleType === "required",
          satisfied: credentials.some(
            (c) =>
              c.schemeId === r.schemeId &&
              ["verified", "active"].includes(c.effectiveStatus),
          ),
          scheme,
        };
      });

      return {
        data: {
          membershipType: "regular",
          requirements,
          credentials,
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

      const input = z
        .object({
          schemeId: z.string().uuid(),
          credentialNumber: z.string().trim().min(1),
          issuerName: z.string().trim().min(1).nullable().optional(),
          issuedAt: z.string().optional(),
          expiresAt: z.string().nullable().optional(),
          sourceUrl: z.string().url().nullable().optional(),
          payload: z.record(z.string(), z.unknown()).default({}),
        })
        .parse(request.body);

      const [created] = await db
        .insert(memberCredentials)
        .values({
          memberId: member.id,
          schemeId: input.schemeId,
          credentialNumber: input.credentialNumber,
          issuedAt: input.issuedAt ? new Date(input.issuedAt) : new Date(),
          expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
          payload: {
            ...input.payload,
            issuerName: input.issuerName ?? null,
            sourceUrl: input.sourceUrl ?? null,
          },
          status: "verified",
        })
        .returning();

      return reply.status(201).send({ data: created });
    },
  );
};
