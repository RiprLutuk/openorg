import { and, asc, eq, isNull } from "drizzle-orm";
import type { FastifyPluginAsync, FastifyRequest } from "fastify";
import { z } from "zod";
import { db } from "../db/client";
import {
  auditLogs,
  members,
  organizationUnits,
  positionAssignments,
  positions,
} from "../db/schema";
import { AppError } from "../lib/errors";
import { toSlug } from "../lib/slug";

const idParams = z.object({ id: z.string().uuid() });
const unitCreateInput = z.object({
  parentId: z.string().uuid().nullable().optional(),
  name: z.string().trim().min(2).max(160),
  slug: z.string().trim().max(120).optional(),
  type: z.string().trim().min(2).max(60).default("chapter"),
  description: z.string().trim().max(5000).nullable().optional(),
  email: z.string().trim().toLowerCase().email().max(320).nullable().optional(),
  phone: z.string().trim().max(40).nullable().optional(),
  address: z.string().trim().max(2000).nullable().optional(),
  sortOrder: z.number().int().min(0).max(10_000).default(0),
  isActive: z.boolean().default(true),
});
const unitUpdateInput = unitCreateInput.partial().extend({
  type: z.string().trim().min(2).max(60).optional(),
  sortOrder: z.number().int().min(0).max(10_000).optional(),
  isActive: z.boolean().optional(),
});
const positionCreateInput = z.object({
  unitId: z.string().uuid(),
  parentId: z.string().uuid().nullable().optional(),
  title: z.string().trim().min(2).max(160),
  description: z.string().trim().max(5000).nullable().optional(),
  sortOrder: z.number().int().min(0).max(10_000).default(0),
});
const positionUpdateInput = positionCreateInput.partial().extend({
  sortOrder: z.number().int().min(0).max(10_000).optional(),
});
const assignmentCreateInput = z
  .object({
    positionId: z.string().uuid(),
    memberId: z.string().uuid(),
    startsAt: z.coerce.date().nullable().optional(),
    endsAt: z.coerce.date().nullable().optional(),
    isPrimary: z.boolean().default(true),
  })
  .superRefine((value, context) => {
    if (value.startsAt && value.endsAt && value.endsAt < value.startsAt)
      context.addIssue({
        code: "custom",
        path: ["endsAt"],
        message: "The appointment end must be after its start.",
      });
  });
const assignmentUpdateInput = z
  .object({
    startsAt: z.coerce.date().nullable().optional(),
    endsAt: z.coerce.date().nullable().optional(),
    isPrimary: z.boolean().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one appointment field is required.",
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

async function tenantUnit(organizationId: string, id: string) {
  const [unit] = await db
    .select()
    .from(organizationUnits)
    .where(
      and(
        eq(organizationUnits.id, id),
        eq(organizationUnits.organizationId, organizationId),
      ),
    )
    .limit(1);
  if (!unit)
    throw new AppError(
      422,
      "INVALID_ORGANIZATION_UNIT",
      "The organization unit is not available in this workspace.",
    );
  return unit;
}

async function tenantPosition(organizationId: string, id: string) {
  const [position] = await db
    .select()
    .from(positions)
    .where(
      and(eq(positions.id, id), eq(positions.organizationId, organizationId)),
    )
    .limit(1);
  if (!position)
    throw new AppError(
      422,
      "INVALID_POSITION",
      "The position is not available in this workspace.",
    );
  return position;
}

async function assertUnitParent(
  organizationId: string,
  parentId: string | null | undefined,
  currentId?: string,
) {
  if (!parentId) return;
  if (parentId === currentId)
    throw new AppError(
      422,
      "CYCLIC_ORGANIZATION_UNIT",
      "An organization unit cannot be its own parent.",
    );
  await tenantUnit(organizationId, parentId);
  if (!currentId) return;
  const rows = await db
    .select({ id: organizationUnits.id, parentId: organizationUnits.parentId })
    .from(organizationUnits)
    .where(eq(organizationUnits.organizationId, organizationId));
  const parents = new Map(rows.map((row) => [row.id, row.parentId]));
  let cursor: string | null | undefined = parentId;
  while (cursor) {
    if (cursor === currentId)
      throw new AppError(
        422,
        "CYCLIC_ORGANIZATION_UNIT",
        "This parent selection would create a circular organization tree.",
      );
    cursor = parents.get(cursor);
  }
}

export const governanceRoutes: FastifyPluginAsync = async (app) => {
  app.get(
    "/overview",
    { preHandler: app.authorize("governance.read") },
    async (request) => {
      const organizationId = request.organization.id;
      const [units, positionRows, assignmentRows, memberRows] =
        await Promise.all([
          db
            .select()
            .from(organizationUnits)
            .where(eq(organizationUnits.organizationId, organizationId))
            .orderBy(
              asc(organizationUnits.sortOrder),
              asc(organizationUnits.name),
            ),
          db
            .select()
            .from(positions)
            .where(eq(positions.organizationId, organizationId))
            .orderBy(asc(positions.sortOrder), asc(positions.title)),
          db
            .select({
              assignment: positionAssignments,
              member: {
                id: members.id,
                name: members.name,
                memberNumber: members.memberNumber,
                avatarUrl: members.avatarUrl,
              },
            })
            .from(positionAssignments)
            .innerJoin(members, eq(positionAssignments.memberId, members.id))
            .where(eq(positionAssignments.organizationId, organizationId))
            .orderBy(asc(positionAssignments.startsAt)),
          db
            .select({
              id: members.id,
              name: members.name,
              memberNumber: members.memberNumber,
              unitId: members.unitId,
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
          units,
          positions: positionRows,
          assignments: assignmentRows.map((row) => ({
            ...row.assignment,
            member: row.member,
          })),
          members: memberRows,
        },
      };
    },
  );

  app.post(
    "/units",
    { preHandler: app.authorize("governance.write") },
    async (request, reply) => {
      const input = unitCreateInput.parse(request.body);
      await assertUnitParent(request.organization.id, input.parentId);
      const [created] = await db
        .insert(organizationUnits)
        .values({
          ...input,
          slug: toSlug(input.slug || input.name),
          organizationId: request.organization.id,
        })
        .returning();
      if (!created) throw new Error("Could not create organization unit.");
      await audit(
        request,
        "governance.unit_created",
        "organization_unit",
        created.id,
        undefined,
        created,
      );
      return reply.status(201).send({ data: created });
    },
  );

  app.patch(
    "/units/:id",
    { preHandler: app.authorize("governance.write") },
    async (request) => {
      const { id } = idParams.parse(request.params);
      const input = unitUpdateInput.parse(request.body);
      const before = await tenantUnit(request.organization.id, id);
      await assertUnitParent(request.organization.id, input.parentId, id);
      const [updated] = await db
        .update(organizationUnits)
        .set({
          ...input,
          slug: input.slug ? toSlug(input.slug) : undefined,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(organizationUnits.id, id),
            eq(organizationUnits.organizationId, request.organization.id),
          ),
        )
        .returning();
      if (!updated) throw new Error("Could not update organization unit.");
      await audit(
        request,
        "governance.unit_updated",
        "organization_unit",
        id,
        before,
        updated,
      );
      return { data: updated };
    },
  );

  app.post(
    "/positions",
    { preHandler: app.authorize("governance.write") },
    async (request, reply) => {
      const input = positionCreateInput.parse(request.body);
      await tenantUnit(request.organization.id, input.unitId);
      if (input.parentId) {
        const parent = await tenantPosition(
          request.organization.id,
          input.parentId,
        );
        if (parent.unitId !== input.unitId)
          throw new AppError(
            422,
            "INVALID_POSITION_PARENT",
            "A parent position must belong to the same organization unit.",
          );
      }
      const [created] = await db
        .insert(positions)
        .values({ ...input, organizationId: request.organization.id })
        .returning();
      if (!created) throw new Error("Could not create position.");
      await audit(
        request,
        "governance.position_created",
        "position",
        created.id,
        undefined,
        created,
      );
      return reply.status(201).send({ data: created });
    },
  );

  app.patch(
    "/positions/:id",
    { preHandler: app.authorize("governance.write") },
    async (request) => {
      const { id } = idParams.parse(request.params);
      const input = positionUpdateInput.parse(request.body);
      const before = await tenantPosition(request.organization.id, id);
      const unitId = input.unitId ?? before.unitId;
      if (!unitId)
        throw new AppError(
          422,
          "POSITION_UNIT_REQUIRED",
          "The position must belong to an organization unit.",
        );
      await tenantUnit(request.organization.id, unitId);
      if (input.parentId === id)
        throw new AppError(
          422,
          "CYCLIC_POSITION",
          "A position cannot be its own parent.",
        );
      if (input.parentId) {
        const parent = await tenantPosition(
          request.organization.id,
          input.parentId,
        );
        if (parent.unitId !== unitId)
          throw new AppError(
            422,
            "INVALID_POSITION_PARENT",
            "A parent position must belong to the same organization unit.",
          );
      }
      const [updated] = await db
        .update(positions)
        .set({ ...input, updatedAt: new Date() })
        .where(
          and(
            eq(positions.id, id),
            eq(positions.organizationId, request.organization.id),
          ),
        )
        .returning();
      if (!updated) throw new Error("Could not update position.");
      await audit(
        request,
        "governance.position_updated",
        "position",
        id,
        before,
        updated,
      );
      return { data: updated };
    },
  );

  app.post(
    "/assignments",
    { preHandler: app.authorize("governance.write") },
    async (request, reply) => {
      const input = assignmentCreateInput.parse(request.body);
      await tenantPosition(request.organization.id, input.positionId);
      const [member] = await db
        .select({ id: members.id })
        .from(members)
        .where(
          and(
            eq(members.id, input.memberId),
            eq(members.organizationId, request.organization.id),
            eq(members.status, "active"),
            isNull(members.deletedAt),
          ),
        )
        .limit(1);
      if (!member)
        throw new AppError(
          422,
          "INVALID_APPOINTEE",
          "Only an active member in this workspace can hold a position.",
        );
      const [created] = await db
        .insert(positionAssignments)
        .values({ ...input, organizationId: request.organization.id })
        .returning();
      if (!created) throw new Error("Could not create appointment.");
      await audit(
        request,
        "governance.assignment_created",
        "position_assignment",
        created.id,
        undefined,
        created,
      );
      return reply.status(201).send({ data: created });
    },
  );

  app.patch(
    "/assignments/:id",
    { preHandler: app.authorize("governance.write") },
    async (request) => {
      const { id } = idParams.parse(request.params);
      const input = assignmentUpdateInput.parse(request.body);
      const [before] = await db
        .select()
        .from(positionAssignments)
        .where(
          and(
            eq(positionAssignments.id, id),
            eq(positionAssignments.organizationId, request.organization.id),
          ),
        )
        .limit(1);
      if (!before)
        throw new AppError(
          404,
          "APPOINTMENT_NOT_FOUND",
          "The position appointment was not found.",
        );
      const startsAt =
        input.startsAt === undefined ? before.startsAt : input.startsAt;
      const endsAt = input.endsAt === undefined ? before.endsAt : input.endsAt;
      if (startsAt && endsAt && endsAt < startsAt)
        throw new AppError(
          422,
          "INVALID_APPOINTMENT_PERIOD",
          "The appointment end must be after its start.",
        );
      const [updated] = await db
        .update(positionAssignments)
        .set({ ...input, updatedAt: new Date() })
        .where(
          and(
            eq(positionAssignments.id, id),
            eq(positionAssignments.organizationId, request.organization.id),
          ),
        )
        .returning();
      if (!updated) throw new Error("Could not update appointment.");
      await audit(
        request,
        "governance.assignment_updated",
        "position_assignment",
        id,
        before,
        updated,
      );
      return { data: updated };
    },
  );
};
