import { revenueProductInputSchema } from "@openorg/contracts";
import { asc, desc, eq } from "drizzle-orm";
import type { FastifyPluginAsync, FastifyRequest } from "fastify";
import { z } from "zod";
import { db } from "../db/client";
import {
  auditLogs,
  invoiceLines,
  invoices,
  memberEntitlements,
  members,
  revenueProducts,
} from "../db/schema";
import { AppError } from "../lib/errors";

const _idParams = z.object({ id: z.string().uuid() });
const invoiceCreateInput = z.object({
  memberId: z.string().uuid(),
  productId: z.string().uuid(),
  quantity: z.number().int().min(1).default(1),
  dueAt: z.string().datetime().nullable().optional(),
  notes: z.string().trim().max(5000).nullable().optional(),
});

async function audit(
  request: FastifyRequest,
  action: string,
  resourceType: string,
  resourceId: string,
  after: unknown,
) {
  await db.insert(auditLogs).values({
    actorId: request.currentUser?.id,
    action,
    resourceType,
    resourceId,
    after: after as Record<string, unknown>,
    ipAddress: request.ip,
    userAgent: request.headers["user-agent"]?.slice(0, 500),
    requestId: request.id,
  });
}

export const adminRevenueRoutes: FastifyPluginAsync = async (app) => {
  app.get(
    "/products",
    { preHandler: app.authorize("revenue.read") },
    async () => {
      const rows = await db
        .select()
        .from(revenueProducts)
        .orderBy(asc(revenueProducts.name));
      return { data: rows };
    },
  );

  app.post(
    "/products",
    { preHandler: app.authorize("revenue.write") },
    async (request, reply) => {
      const input = revenueProductInputSchema.parse(request.body);
      const amountMinor = Math.round(input.price * 100);
      const [created] = await db
        .insert(revenueProducts)
        .values({
          ...input,
          amountMinor,
          grantsEntitlementKey: input.entitlementKey ?? null,
          entitlementDurationDays: input.entitlementDurationMonths
            ? input.entitlementDurationMonths * 30
            : null,
        })
        .returning();

      await audit(
        request,
        "revenue_product.create",
        "revenue_product",
        created?.id ?? "",
        created,
      );
      return reply.status(201).send({ data: created });
    },
  );

  app.get(
    "/invoices",
    { preHandler: app.authorize("revenue.read") },
    async () => {
      const rows = await db
        .select({
          invoice: invoices,
          memberName: members.name,
          memberNumber: members.memberNumber,
        })
        .from(invoices)
        .innerJoin(members, eq(invoices.memberId, members.id))
        .orderBy(desc(invoices.issuedAt));
      return { data: rows };
    },
  );

  app.post(
    "/invoices",
    { preHandler: app.authorize("revenue.write") },
    async (request, reply) => {
      const input = invoiceCreateInput.parse(request.body);
      const [product] = await db
        .select()
        .from(revenueProducts)
        .where(eq(revenueProducts.id, input.productId))
        .limit(1);
      if (!product)
        throw new AppError(404, "PRODUCT_NOT_FOUND", "Product not found.");

      const invoiceNumber = `INV-${Date.now()}`;
      const lineTotalMinor = product.amountMinor * input.quantity;

      const [created] = await db.transaction(async (tx) => {
        const [inv] = await tx
          .insert(invoices)
          .values({
            memberId: input.memberId,
            invoiceNumber,
            status: "open",
            currency: product.currency,
            subtotalMinor: lineTotalMinor,
            totalMinor: lineTotalMinor,
            paidMinor: 0,
            notes: input.notes ?? null,
            createdBy: request.currentUser?.id,
          })
          .returning();

        if (inv) {
          await tx.insert(invoiceLines).values({
            invoiceId: inv.id,
            productId: product.id,
            description: product.name,
            quantity: input.quantity,
            unitAmountMinor: product.amountMinor,
            lineTotalMinor,
          });
        }
        return [inv];
      });

      return reply.status(201).send({ data: created });
    },
  );
};

export const memberRevenueRoutes: FastifyPluginAsync = async (app) => {
  app.get(
    "/billing/invoices",
    { preHandler: app.authenticateMember },
    async (request) => {
      const member = request.currentMember;
      if (!member)
        throw new AppError(401, "MEMBER_UNAUTHENTICATED", "Sign in required.");

      const rows = await db
        .select()
        .from(invoices)
        .where(eq(invoices.memberId, member.id))
        .orderBy(desc(invoices.issuedAt));

      return { data: rows };
    },
  );

  app.get(
    "/billing/entitlements",
    { preHandler: app.authenticateMember },
    async (request) => {
      const member = request.currentMember;
      if (!member)
        throw new AppError(401, "MEMBER_UNAUTHENTICATED", "Sign in required.");

      const rows = await db
        .select()
        .from(memberEntitlements)
        .where(eq(memberEntitlements.memberId, member.id))
        .orderBy(desc(memberEntitlements.createdAt));

      return { data: rows };
    },
  );
};
