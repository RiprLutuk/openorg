CREATE TYPE "public"."billing_interval" AS ENUM('one_time', 'monthly', 'quarterly', 'annual');--> statement-breakpoint
CREATE TYPE "public"."campaign_channel" AS ENUM('email', 'whatsapp', 'sms', 'in_app');--> statement-breakpoint
CREATE TYPE "public"."campaign_recipient_status" AS ENUM('queued', 'sent', 'failed', 'skipped');--> statement-breakpoint
CREATE TYPE "public"."campaign_status" AS ENUM('draft', 'scheduled', 'queued', 'sent', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."entitlement_status" AS ENUM('active', 'expired', 'revoked');--> statement-breakpoint
CREATE TYPE "public"."invoice_status" AS ENUM('draft', 'open', 'paid', 'void');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('confirmed', 'failed', 'refunded');--> statement-breakpoint
CREATE TYPE "public"."revenue_product_type" AS ENUM('membership_dues', 'event_ticket', 'donation', 'service', 'sponsorship', 'other');--> statement-breakpoint
CREATE TABLE "audience_segments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"name" varchar(180) NOT NULL,
	"description" text,
	"criteria" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "campaign_recipients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"campaign_id" uuid NOT NULL,
	"member_id" uuid NOT NULL,
	"destination" varchar(320),
	"status" "campaign_recipient_status" DEFAULT 'queued' NOT NULL,
	"queued_at" timestamp with time zone DEFAULT now() NOT NULL,
	"sent_at" timestamp with time zone,
	"error" text,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "engagement_campaigns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"segment_id" uuid NOT NULL,
	"name" varchar(180) NOT NULL,
	"channel" "campaign_channel" NOT NULL,
	"subject" varchar(240),
	"message" text NOT NULL,
	"status" "campaign_status" DEFAULT 'draft' NOT NULL,
	"scheduled_at" timestamp with time zone,
	"sent_at" timestamp with time zone,
	"metrics" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invoice_lines" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"invoice_id" uuid NOT NULL,
	"product_id" uuid,
	"description" varchar(300) NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"unit_amount_minor" integer NOT NULL,
	"line_total_minor" integer NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"member_id" uuid NOT NULL,
	"invoice_number" varchar(80) NOT NULL,
	"status" "invoice_status" DEFAULT 'open' NOT NULL,
	"currency" varchar(3) DEFAULT 'IDR' NOT NULL,
	"issued_at" timestamp with time zone DEFAULT now() NOT NULL,
	"due_at" timestamp with time zone,
	"subtotal_minor" integer NOT NULL,
	"total_minor" integer NOT NULL,
	"paid_minor" integer DEFAULT 0 NOT NULL,
	"notes" text,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "member_entitlements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"member_id" uuid NOT NULL,
	"entitlement_key" varchar(100) NOT NULL,
	"label" varchar(180) NOT NULL,
	"source_invoice_id" uuid,
	"source_product_id" uuid,
	"status" "entitlement_status" DEFAULT 'active' NOT NULL,
	"starts_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ends_at" timestamp with time zone,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"invoice_id" uuid NOT NULL,
	"amount_minor" integer NOT NULL,
	"currency" varchar(3) NOT NULL,
	"method" varchar(80) NOT NULL,
	"reference" varchar(160),
	"status" "payment_status" DEFAULT 'confirmed' NOT NULL,
	"paid_at" timestamp with time zone DEFAULT now() NOT NULL,
	"recorded_by" uuid,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "revenue_products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"code" varchar(80) NOT NULL,
	"name" varchar(180) NOT NULL,
	"description" text,
	"type" "revenue_product_type" NOT NULL,
	"price_minor" integer NOT NULL,
	"currency" varchar(3) DEFAULT 'IDR' NOT NULL,
	"billing_interval" "billing_interval" DEFAULT 'one_time' NOT NULL,
	"entitlement_key" varchar(100),
	"entitlement_label" varchar(180),
	"entitlement_duration_months" integer,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "audience_segments" ADD CONSTRAINT "audience_segments_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaign_recipients" ADD CONSTRAINT "campaign_recipients_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaign_recipients" ADD CONSTRAINT "campaign_recipients_campaign_id_engagement_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."engagement_campaigns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaign_recipients" ADD CONSTRAINT "campaign_recipients_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "engagement_campaigns" ADD CONSTRAINT "engagement_campaigns_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "engagement_campaigns" ADD CONSTRAINT "engagement_campaigns_segment_id_audience_segments_id_fk" FOREIGN KEY ("segment_id") REFERENCES "public"."audience_segments"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "engagement_campaigns" ADD CONSTRAINT "engagement_campaigns_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice_lines" ADD CONSTRAINT "invoice_lines_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice_lines" ADD CONSTRAINT "invoice_lines_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice_lines" ADD CONSTRAINT "invoice_lines_product_id_revenue_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."revenue_products"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member_entitlements" ADD CONSTRAINT "member_entitlements_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member_entitlements" ADD CONSTRAINT "member_entitlements_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member_entitlements" ADD CONSTRAINT "member_entitlements_source_invoice_id_invoices_id_fk" FOREIGN KEY ("source_invoice_id") REFERENCES "public"."invoices"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member_entitlements" ADD CONSTRAINT "member_entitlements_source_product_id_revenue_products_id_fk" FOREIGN KEY ("source_product_id") REFERENCES "public"."revenue_products"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_recorded_by_users_id_fk" FOREIGN KEY ("recorded_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "revenue_products" ADD CONSTRAINT "revenue_products_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "audience_segments_active_idx" ON "audience_segments" USING btree ("organization_id","is_active");--> statement-breakpoint
CREATE UNIQUE INDEX "campaign_recipients_campaign_member_unique" ON "campaign_recipients" USING btree ("campaign_id","member_id");--> statement-breakpoint
CREATE INDEX "campaign_recipients_status_idx" ON "campaign_recipients" USING btree ("organization_id","campaign_id","status");--> statement-breakpoint
CREATE INDEX "engagement_campaigns_status_idx" ON "engagement_campaigns" USING btree ("organization_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "invoices_org_number_unique" ON "invoices" USING btree ("organization_id","invoice_number");--> statement-breakpoint
CREATE INDEX "invoices_member_status_idx" ON "invoices" USING btree ("organization_id","member_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "member_entitlements_source_unique" ON "member_entitlements" USING btree ("member_id","source_invoice_id","source_product_id");--> statement-breakpoint
CREATE INDEX "member_entitlements_active_idx" ON "member_entitlements" USING btree ("organization_id","member_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "payments_org_reference_unique" ON "payments" USING btree ("organization_id","reference") WHERE "payments"."reference" is not null;--> statement-breakpoint
CREATE INDEX "payments_invoice_idx" ON "payments" USING btree ("organization_id","invoice_id","paid_at");--> statement-breakpoint
CREATE UNIQUE INDEX "revenue_products_org_code_unique" ON "revenue_products" USING btree ("organization_id","code");--> statement-breakpoint
CREATE INDEX "revenue_products_active_idx" ON "revenue_products" USING btree ("organization_id","is_active");--> statement-breakpoint
INSERT INTO "permissions" ("key", "description")
VALUES
	('revenue.read', 'View products, invoices, payments, and benefits'),
	('revenue.write', 'Manage revenue products and invoices'),
	('revenue.payment', 'Record and reconcile payments'),
	('engagement.read', 'View audience segments and campaigns'),
	('engagement.write', 'Manage audience segments and campaigns'),
	('engagement.dispatch', 'Queue campaign recipients for delivery')
ON CONFLICT ("key") DO NOTHING;--> statement-breakpoint
INSERT INTO "role_permissions" ("role_id", "permission_id")
SELECT "roles"."id", "permissions"."id"
FROM "roles"
CROSS JOIN "permissions"
WHERE "roles"."is_system" = true
	AND "permissions"."key" IN ('revenue.read', 'revenue.write', 'revenue.payment', 'engagement.read', 'engagement.write', 'engagement.dispatch')
ON CONFLICT DO NOTHING;
