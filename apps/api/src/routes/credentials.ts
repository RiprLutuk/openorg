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
};

export const memberCredentialRoutes: FastifyPluginAsync = async (app) => {
  app.get(
    "/credentials",
    { preHandler: app.authenticateMember },
    async (request) => {
      const member = request.currentMember;
      if (!member)
        throw new AppError(401, "MEMBER_UNAUTHENTICATED", "Sign in required.");
      const rows = await db
        .select({
          credential: memberCredentials,
          schemeName: credentialSchemes.name,
          schemeCode: credentialSchemes.code,
        })
        .from(memberCredentials)
        .innerJoin(
          credentialSchemes,
          eq(memberCredentials.schemeId, credentialSchemes.id),
        )
        .where(eq(memberCredentials.memberId, member.id))
        .orderBy(desc(memberCredentials.issuedAt));
      return { data: rows };
    },
  );
};
