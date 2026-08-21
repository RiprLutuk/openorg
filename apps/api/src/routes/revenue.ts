import { randomUUID } from "node:crypto";
import {
  audienceSegmentCriteriaSchema,
  engagementCampaignInputSchema,
  invoiceCreateInputSchema,
  revenueProductInputSchema,
} from "@openorg/contracts";
import { and, asc, desc, eq, inArray, isNull } from "drizzle-orm";
import type { FastifyPluginAsync, FastifyRequest } from "fastify";
import { z } from "zod";
import { db } from "../db/client";
import {
  audienceSegments,
  auditLogs,
  campaignRecipients,
  engagementCampaigns,
  invoiceLines,
  invoices,
  memberEntitlements,
  members,
  payments,
  revenueProducts,
} from "../db/schema";
import { AppError } from "../lib/errors";
import {
  addMonths,
  matchSegmentCriteria,
  moneyFromMinor,
  moneyToMinor,
} from "../lib/revenue";

const idParams = z.object({ id: z.string().uuid() });
const paymentInput = z.object({
  amount: z.number().positive().max(10_000_000_000).multipleOf(0.01),
  method: z.string().trim().min(2).max(80),
  reference: z.string().trim().min(1).max(160).nullable().optional(),
  paidAt: z.string().datetime().optional(),
});
const segmentInput = z.object({
  name: z.string().trim().min(2).max(180),
  description: z.string().trim().max(5000).nullable().optional(),
  criteria: audienceSegmentCriteriaSchema,
});

async function audit(
  request: FastifyRequest,
  action: string,
  resourceType: string,
  resourceId: string,
  after: unknown,
) {
  await db.insert(auditLogs).values({
    organizationId: request.organization.id,
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

function presentMoney<
  T extends {
    priceMinor?: number;
    subtotalMinor?: number;
    totalMinor?: number;
    paidMinor?: number;
    amountMinor?: number;
    unitAmountMinor?: number;
    lineTotalMinor?: number;
  },
>(row: T) {
  return {
    ...row,
    ...(row.priceMinor === undefined
      ? {}
      : { price: moneyFromMinor(row.priceMinor) }),
    ...(row.subtotalMinor === undefined
      ? {}
      : { subtotal: moneyFromMinor(row.subtotalMinor) }),
    ...(row.totalMinor === undefined
      ? {}
      : { total: moneyFromMinor(row.totalMinor) }),
    ...(row.paidMinor === undefined
      ? {}
      : { paid: moneyFromMinor(row.paidMinor) }),
    ...(row.amountMinor === undefined
      ? {}
      : { amount: moneyFromMinor(row.amountMinor) }),
    ...(row.unitAmountMinor === undefined
      ? {}
      : { unitAmount: moneyFromMinor(row.unitAmountMinor) }),
    ...(row.lineTotalMinor === undefined
      ? {}
      : { lineTotal: moneyFromMinor(row.lineTotalMinor) }),
  };
}

export const adminRevenueRoutes: FastifyPluginAsync = async (app) => {
  app.get(
    "/overview",
    { preHandler: app.authorize("revenue.read") },
    async (request) => {
      const organizationId = request.organization.id;
      const [
        productRows,
        invoiceRows,
        lineRows,
        paymentRows,
        entitlementRows,
        memberRows,
        segmentRows,
        campaignRows,
        recipientRows,
      ] = await Promise.all([
        db
          .select()
          .from(revenueProducts)
          .where(eq(revenueProducts.organizationId, organizationId))
          .orderBy(asc(revenueProducts.name)),
        db
          .select({
            invoice: invoices,
            member: {
              id: members.id,
              name: members.name,
              memberNumber: members.memberNumber,
            },
          })
          .from(invoices)
          .innerJoin(members, eq(invoices.memberId, members.id))
          .where(eq(invoices.organizationId, organizationId))
          .orderBy(desc(invoices.issuedAt)),
        db
          .select()
          .from(invoiceLines)
          .where(eq(invoiceLines.organizationId, organizationId)),
        db
          .select()
          .from(payments)
          .where(eq(payments.organizationId, organizationId))
          .orderBy(desc(payments.paidAt)),
        db
          .select()
          .from(memberEntitlements)
          .where(eq(memberEntitlements.organizationId, organizationId))
          .orderBy(desc(memberEntitlements.startsAt)),
        db
          .select({
            id: members.id,
            name: members.name,
            memberNumber: members.memberNumber,
            email: members.email,
            phone: members.phone,
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
        db
          .select()
          .from(audienceSegments)
          .where(eq(audienceSegments.organizationId, organizationId))
          .orderBy(asc(audienceSegments.name)),
        db
          .select()
          .from(engagementCampaigns)
          .where(eq(engagementCampaigns.organizationId, organizationId))
          .orderBy(desc(engagementCampaigns.createdAt)),
        db
          .select()
          .from(campaignRecipients)
          .where(eq(campaignRecipients.organizationId, organizationId)),
      ]);
      return {
        data: {
          products: productRows.map(presentMoney),
          invoices: invoiceRows.map(({ invoice, member }) => ({
            ...presentMoney(invoice),
            effectiveStatus:
              invoice.status === "open" &&
              invoice.dueAt &&
              invoice.dueAt < new Date()
                ? "overdue"
                : invoice.status,
            member,
            lines: lineRows
              .filter((line) => line.invoiceId === invoice.id)
              .map(presentMoney),
            payments: paymentRows
              .filter((payment) => payment.invoiceId === invoice.id)
              .map(presentMoney),
          })),
          entitlements: entitlementRows,
          members: memberRows,
          segments: segmentRows,
          campaigns: campaignRows.map((campaign) => ({
            ...campaign,
            recipientCount: recipientRows.filter(
              (recipient) => recipient.campaignId === campaign.id,
            ).length,
          })),
        },
      };
    },
  );

  app.post(
    "/products",
    { preHandler: app.authorize("revenue.write") },
    async (request, reply) => {
      const input = revenueProductInputSchema.parse(request.body);
      const [product] = await db
        .insert(revenueProducts)
        .values({
          organizationId: request.organization.id,
          ...input,
          priceMinor: moneyToMinor(input.price),
          entitlementKey: input.entitlementKey ?? null,
          entitlementLabel: input.entitlementLabel ?? null,
          entitlementDurationMonths: input.entitlementDurationMonths ?? null,
        })
        .returning();
      if (!product)
        throw new AppError(
          500,
          "PRODUCT_CREATE_FAILED",
          "Could not create the product.",
        );
      await audit(
        request,
        "revenue.product_created",
        "revenue_product",
        product.id,
        product,
      );
      return reply.code(201).send({ data: presentMoney(product) });
    },
  );

  app.post(
    "/invoices",
    { preHandler: app.authorize("revenue.write") },
    async (request, reply) => {
      const input = invoiceCreateInputSchema.parse(request.body);
      const organizationId = request.organization.id;
      const [[member], [product]] = await Promise.all([
        db
          .select()
          .from(members)
          .where(
            and(
              eq(members.id, input.memberId),
              eq(members.organizationId, organizationId),
              isNull(members.deletedAt),
            ),
          )
          .limit(1),
        db
          .select()
          .from(revenueProducts)
          .where(
            and(
              eq(revenueProducts.id, input.productId),
              eq(revenueProducts.organizationId, organizationId),
              eq(revenueProducts.isActive, true),
            ),
          )
          .limit(1),
      ]);
      if (!member)
        throw new AppError(
          422,
          "INVALID_INVOICE_MEMBER",
          "The member is not available in this workspace.",
        );
      if (!product)
        throw new AppError(
          422,
          "INVALID_REVENUE_PRODUCT",
          "The product is not available in this workspace.",
        );
      const totalMinor = product.priceMinor * input.quantity;
      const created = await db.transaction(async (tx) => {
        const [invoice] = await tx
          .insert(invoices)
          .values({
            organizationId,
            memberId: member.id,
            invoiceNumber: `INV-${new Date().getUTCFullYear()}-${randomUUID().slice(0, 8).toUpperCase()}`,
            currency: product.currency,
            dueAt: input.dueAt ? new Date(input.dueAt) : null,
            subtotalMinor: totalMinor,
            totalMinor,
            notes: input.notes ?? null,
            createdBy: request.currentUser?.id,
          })
          .returning();
        if (!invoice)
          throw new AppError(
            500,
            "INVOICE_CREATE_FAILED",
            "Could not create the invoice.",
          );
        await tx.insert(invoiceLines).values({
          organizationId,
          invoiceId: invoice.id,
          productId: product.id,
          description: product.name,
          quantity: input.quantity,
          unitAmountMinor: product.priceMinor,
          lineTotalMinor: totalMinor,
        });
        return invoice;
      });
      await audit(
        request,
        "revenue.invoice_created",
        "invoice",
        created.id,
        created,
      );
      return reply.code(201).send({ data: presentMoney(created) });
    },
  );

  app.post(
    "/invoices/:id/payments",
    { preHandler: app.authorize("revenue.payment") },
    async (request, reply) => {
      const { id } = idParams.parse(request.params);
      const input = paymentInput.parse(request.body);
      const organizationId = request.organization.id;
      const amountMinor = moneyToMinor(input.amount);
      const result = await db.transaction(async (tx) => {
        const [invoice] = await tx
          .select()
          .from(invoices)
          .where(
            and(
              eq(invoices.id, id),
              eq(invoices.organizationId, organizationId),
            ),
          )
          .limit(1);
        if (!invoice)
          throw new AppError(
            404,
            "INVOICE_NOT_FOUND",
            "The invoice was not found.",
          );
        if (invoice.status === "paid" || invoice.status === "void")
          throw new AppError(
            409,
            "INVOICE_NOT_PAYABLE",
            "This invoice cannot receive another payment.",
          );
        if (amountMinor > invoice.totalMinor - invoice.paidMinor)
          throw new AppError(
            422,
            "PAYMENT_EXCEEDS_BALANCE",
            "Payment exceeds the remaining invoice balance.",
          );
        const paidAt = input.paidAt ? new Date(input.paidAt) : new Date();
        const [payment] = await tx
          .insert(payments)
          .values({
            organizationId,
            invoiceId: id,
            amountMinor,
            currency: invoice.currency,
            method: input.method,
            reference: input.reference ?? null,
            paidAt,
            recordedBy: request.currentUser?.id,
          })
          .returning();
        const paidMinor = invoice.paidMinor + amountMinor;
        const isPaid = paidMinor === invoice.totalMinor;
        const [updated] = await tx
          .update(invoices)
          .set({
            paidMinor,
            status: isPaid ? "paid" : "open",
            updatedAt: new Date(),
          })
          .where(eq(invoices.id, id))
          .returning();
        if (isPaid) {
          const productRows = await tx
            .select({ product: revenueProducts })
            .from(invoiceLines)
            .innerJoin(
              revenueProducts,
              eq(invoiceLines.productId, revenueProducts.id),
            )
            .where(eq(invoiceLines.invoiceId, id));
          for (const { product } of productRows) {
            if (!product.entitlementKey || !product.entitlementLabel) continue;
            await tx
              .insert(memberEntitlements)
              .values({
                organizationId,
                memberId: invoice.memberId,
                entitlementKey: product.entitlementKey,
                label: product.entitlementLabel,
                sourceInvoiceId: invoice.id,
                sourceProductId: product.id,
                startsAt: paidAt,
                endsAt: product.entitlementDurationMonths
                  ? addMonths(paidAt, product.entitlementDurationMonths)
                  : null,
              })
              .onConflictDoNothing();
          }
        }
        return { payment, invoice: updated };
      });
      if (!result.payment || !result.invoice)
        throw new AppError(
          500,
          "PAYMENT_RECORD_FAILED",
          "Could not record payment.",
        );
      await audit(request, "revenue.payment_recorded", "invoice", id, {
        paymentId: result.payment.id,
        amount: input.amount,
        status: result.invoice.status,
      });
      return reply.code(201).send({
        data: {
          payment: presentMoney(result.payment),
          invoice: presentMoney(result.invoice),
        },
      });
    },
  );

  app.post(
    "/segments",
    { preHandler: app.authorize("engagement.write") },
    async (request, reply) => {
      const input = segmentInput.parse(request.body);
      const values: typeof audienceSegments.$inferInsert = {
        organizationId: request.organization.id,
        name: input.name,
        description: input.description ?? null,
        criteria: JSON.parse(
          JSON.stringify(input.criteria),
        ) as typeof audienceSegments.$inferInsert.criteria,
      };
      const [segment] = await db
        .insert(audienceSegments)
        .values(values)
        .returning();
      if (!segment)
        throw new AppError(
          500,
          "SEGMENT_CREATE_FAILED",
          "Could not create the segment.",
        );
      await audit(
        request,
        "engagement.segment_created",
        "audience_segment",
        segment.id,
        segment,
      );
      return reply.code(201).send({ data: segment });
    },
  );

  app.post(
    "/campaigns",
    { preHandler: app.authorize("engagement.write") },
    async (request, reply) => {
      const input = engagementCampaignInputSchema.parse(request.body);
      const [segment] = await db
        .select()
        .from(audienceSegments)
        .where(
          and(
            eq(audienceSegments.id, input.segmentId),
            eq(audienceSegments.organizationId, request.organization.id),
            eq(audienceSegments.isActive, true),
          ),
        )
        .limit(1);
      if (!segment)
        throw new AppError(
          422,
          "INVALID_AUDIENCE_SEGMENT",
          "The audience segment is not available.",
        );
      const [campaign] = await db
        .insert(engagementCampaigns)
        .values({
          organizationId: request.organization.id,
          ...input,
          subject: input.subject ?? null,
          scheduledAt: input.scheduledAt ? new Date(input.scheduledAt) : null,
          status: input.scheduledAt ? "scheduled" : "draft",
          createdBy: request.currentUser?.id,
        })
        .returning();
      if (!campaign)
        throw new AppError(
          500,
          "CAMPAIGN_CREATE_FAILED",
          "Could not create the campaign.",
        );
      await audit(
        request,
        "engagement.campaign_created",
        "engagement_campaign",
        campaign.id,
        campaign,
      );
      return reply.code(201).send({ data: campaign });
    },
  );

  app.post(
    "/campaigns/:id/queue",
    { preHandler: app.authorize("engagement.dispatch") },
    async (request) => {
      const { id } = idParams.parse(request.params);
      const organizationId = request.organization.id;
      const [row] = await db
        .select({ campaign: engagementCampaigns, segment: audienceSegments })
        .from(engagementCampaigns)
        .innerJoin(
          audienceSegments,
          eq(engagementCampaigns.segmentId, audienceSegments.id),
        )
        .where(
          and(
            eq(engagementCampaigns.id, id),
            eq(engagementCampaigns.organizationId, organizationId),
          ),
        )
        .limit(1);
      if (!row)
        throw new AppError(
          404,
          "CAMPAIGN_NOT_FOUND",
          "The campaign was not found.",
        );
      if (["sent", "cancelled"].includes(row.campaign.status))
        throw new AppError(
          409,
          "CAMPAIGN_NOT_QUEUEABLE",
          "This campaign cannot be queued.",
        );
      const [memberRows, entitlementRows] = await Promise.all([
        db
          .select()
          .from(members)
          .where(
            and(
              eq(members.organizationId, organizationId),
              isNull(members.deletedAt),
            ),
          ),
        db
          .select()
          .from(memberEntitlements)
          .where(
            and(
              eq(memberEntitlements.organizationId, organizationId),
              eq(memberEntitlements.status, "active"),
            ),
          ),
      ]);
      const eligible = memberRows.filter((member) =>
        matchSegmentCriteria(
          {
            ...member,
            entitlementKeys: entitlementRows
              .filter(
                (item) =>
                  item.memberId === member.id &&
                  (!item.endsAt || item.endsAt > new Date()),
              )
              .map((item) => item.entitlementKey),
          },
          audienceSegmentCriteriaSchema.parse(row.segment.criteria),
        ),
      );
      await db.transaction(async (tx) => {
        if (eligible.length)
          await tx
            .insert(campaignRecipients)
            .values(
              eligible.map((member) => ({
                organizationId,
                campaignId: id,
                memberId: member.id,
                destination:
                  row.campaign.channel === "email"
                    ? member.email
                    : row.campaign.channel === "in_app"
                      ? member.id
                      : member.phone,
              })),
            )
            .onConflictDoNothing();
        await tx
          .update(engagementCampaigns)
          .set({
            status: "queued",
            metrics: {
              recipientCount: eligible.length,
              queuedCount: eligible.length,
            },
            updatedAt: new Date(),
          })
          .where(eq(engagementCampaigns.id, id));
      });
      await audit(
        request,
        "engagement.campaign_queued",
        "engagement_campaign",
        id,
        {
          recipientCount: eligible.length,
          deliveryState: "queued_for_adapter",
        },
      );
      return {
        data: {
          campaignId: id,
          recipientCount: eligible.length,
          status: "queued",
          deliveryState: "awaiting_external_adapter",
        },
      };
    },
  );
};

export const memberRevenueRoutes: FastifyPluginAsync = async (app) => {
  app.get(
    "/billing",
    { preHandler: app.authenticateMember },
    async (request) => {
      const member = request.currentMember;
      if (!member)
        throw new AppError(401, "MEMBER_UNAUTHENTICATED", "Sign in required.");
      const organizationId = request.organization.id;
      const invoiceRows = await db
        .select()
        .from(invoices)
        .where(
          and(
            eq(invoices.organizationId, organizationId),
            eq(invoices.memberId, member.id),
          ),
        )
        .orderBy(desc(invoices.issuedAt));
      const ids = invoiceRows.map((invoice) => invoice.id);
      const [lineRows, paymentRows, entitlementRows] = await Promise.all([
        ids.length
          ? db
              .select()
              .from(invoiceLines)
              .where(inArray(invoiceLines.invoiceId, ids))
          : [],
        ids.length
          ? db
              .select()
              .from(payments)
              .where(
                and(
                  eq(payments.organizationId, organizationId),
                  inArray(payments.invoiceId, ids),
                ),
              )
              .orderBy(desc(payments.paidAt))
          : [],
        db
          .select()
          .from(memberEntitlements)
          .where(
            and(
              eq(memberEntitlements.organizationId, organizationId),
              eq(memberEntitlements.memberId, member.id),
            ),
          )
          .orderBy(desc(memberEntitlements.startsAt)),
      ]);
      const now = new Date();
      return {
        data: {
          invoices: invoiceRows.map((invoice) => ({
            ...presentMoney(invoice),
            effectiveStatus:
              invoice.status === "open" && invoice.dueAt && invoice.dueAt < now
                ? "overdue"
                : invoice.status,
            outstanding: moneyFromMinor(invoice.totalMinor - invoice.paidMinor),
            lines: lineRows
              .filter((line) => line.invoiceId === invoice.id)
              .map(presentMoney),
            payments: paymentRows
              .filter((payment) => payment.invoiceId === invoice.id)
              .map(presentMoney),
          })),
          entitlements: entitlementRows.map((item) => ({
            ...item,
            effectiveStatus:
              item.status === "active" && item.endsAt && item.endsAt < now
                ? "expired"
                : item.status,
          })),
        },
      };
    },
  );
};
