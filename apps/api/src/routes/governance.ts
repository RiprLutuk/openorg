import { asc, eq } from "drizzle-orm";
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

async function getUnit(id: string) {
  const [unit] = await db
    .select()
    .from(organizationUnits)
    .where(eq(organizationUnits.id, id))
    .limit(1);
  if (!unit)
    throw new AppError(
      404,
      "UNIT_NOT_FOUND",
      "Organization unit was not found.",
    );
  return unit;
}

async function getPosition(id: string) {
  const [position] = await db
    .select()
    .from(positions)
    .where(eq(positions.id, id))
    .limit(1);
  if (!position)
    throw new AppError(
      404,
      "POSITION_NOT_FOUND",
      "Governance position was not found.",
    );
  return position;
}

async function assertParentUnitValid(unitId: string, parentId: string | null) {
  if (!parentId) return;
  if (parentId === unitId)
    throw new AppError(
      422,
      "CYCLIC_UNIT_PARENT",
      "An organization unit cannot be its own parent.",
    );
  await getUnit(parentId);
  const rows = await db
    .select({ id: organizationUnits.id, parentId: organizationUnits.parentId })
    .from(organizationUnits);
  let cursor: string | null = parentId;
  while (cursor) {
    if (cursor === unitId)
      throw new AppError(
        422,
        "CYCLIC_UNIT_PARENT",
        "Setting this parent creates a loop in the unit hierarchy.",
      );
    const parentRow = rows.find((row) => row.id === cursor);
    cursor = parentRow?.parentId ?? null;
  }
}

export const governanceRoutes: FastifyPluginAsync = async (app) => {
  app.get(
    "/units",
    { preHandler: app.authorize("governance.read") },
    async () => {
      const [units, positionRows, assignments] = await Promise.all([
        db
          .select()
          .from(organizationUnits)
          .orderBy(
            asc(organizationUnits.sortOrder),
            asc(organizationUnits.name),
          ),
        db
          .select()
          .from(positions)
          .orderBy(asc(positions.sortOrder), asc(positions.title)),
        db
          .select({
            assignment: positionAssignments,
            member: {
              id: members.id,
              name: members.name,
              avatarUrl: members.avatarUrl,
              memberNumber: members.memberNumber,
            },
          })
          .from(positionAssignments)
          .innerJoin(members, eq(positionAssignments.memberId, members.id)),
      ]);

      return {
        data: {
          units: units.map((unit) => ({
            ...unit,
            positions: positionRows
              .filter((pos) => pos.unitId === unit.id)
              .map((pos) => ({
                ...pos,
                assignments: assignments.filter(
                  (item) => item.assignment.positionId === pos.id,
                ),
              })),
          })),
        },
      };
    },
  );

  app.post(
    "/units",
    { preHandler: app.authorize("governance.write") },
    async (request, reply) => {
      const input = unitCreateInput.parse(request.body);
      if (input.parentId) await getUnit(input.parentId);
      const slug = toSlug(input.slug ?? input.name);
      const [created] = await db
        .insert(organizationUnits)
        .values({
          ...input,
          slug,
        })
        .returning();
      await audit(
        request,
        "unit.create",
        "organization_unit",
        created?.id ?? "",
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
      const before = await getUnit(id);
      if (input.parentId !== undefined) {
        await assertParentUnitValid(id, input.parentId);
      }
      const [updated] = await db
        .update(organizationUnits)
        .set({
          ...input,
          ...(input.slug ? { slug: toSlug(input.slug) } : {}),
          updatedAt: new Date(),
        })
        .where(eq(organizationUnits.id, id))
        .returning();
      await audit(
        request,
        "unit.update",
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
      await getUnit(input.unitId);
      const [created] = await db.insert(positions).values(input).returning();
      await audit(
        request,
        "position.create",
        "position",
        created?.id ?? "",
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
      const before = await getPosition(id);
      if (input.unitId) await getUnit(input.unitId);
      const [updated] = await db
        .update(positions)
        .set({ ...input, updatedAt: new Date() })
        .where(eq(positions.id, id))
        .returning();
      await audit(request, "position.update", "position", id, before, updated);
      return { data: updated };
    },
  );

  app.post(
    "/appointments",
    { preHandler: app.authorize("governance.write") },
    async (request, reply) => {
      const input = assignmentCreateInput.parse(request.body);
      await getPosition(input.positionId);
      const [member] = await db
        .select({ id: members.id })
        .from(members)
        .where(eq(members.id, input.memberId))
        .limit(1);
      if (!member)
        throw new AppError(404, "MEMBER_NOT_FOUND", "Member was not found.");
      const [created] = await db
        .insert(positionAssignments)
        .values(input)
        .returning();
      await audit(
        request,
        "appointment.create",
        "position_assignment",
        created?.id ?? "",
        undefined,
        created,
      );
      return reply.status(201).send({ data: created });
    },
  );

  app.patch(
    "/appointments/:id",
    { preHandler: app.authorize("governance.write") },
    async (request) => {
      const { id } = idParams.parse(request.params);
      const input = assignmentUpdateInput.parse(request.body);
      const [before] = await db
        .select()
        .from(positionAssignments)
        .where(eq(positionAssignments.id, id))
        .limit(1);
      if (!before)
        throw new AppError(
          404,
          "APPOINTMENT_NOT_FOUND",
          "Governance appointment was not found.",
        );
      const [updated] = await db
        .update(positionAssignments)
        .set({ ...input, updatedAt: new Date() })
        .where(eq(positionAssignments.id, id))
        .returning();
      await audit(
        request,
        "appointment.update",
        "position_assignment",
        id,
        before,
        updated,
      );
      return { data: updated };
    },
  );

  app.delete(
    "/appointments/:id",
    { preHandler: app.authorize("governance.write") },
    async (request, reply) => {
      const { id } = idParams.parse(request.params);
      const [deleted] = await db
        .delete(positionAssignments)
        .where(eq(positionAssignments.id, id))
        .returning();
      if (!deleted)
        throw new AppError(
          404,
          "APPOINTMENT_NOT_FOUND",
          "Governance appointment was not found.",
        );
      await audit(
        request,
        "appointment.delete",
        "position_assignment",
        id,
        deleted,
        undefined,
      );
      return reply.status(204).send();
    },
  );
};
