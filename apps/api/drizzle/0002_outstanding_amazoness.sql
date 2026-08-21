CREATE TYPE "public"."credential_requirement_rule" AS ENUM('required', 'one_of', 'optional');--> statement-breakpoint
CREATE TYPE "public"."credential_status" AS ENUM('draft', 'submitted', 'verified', 'rejected', 'expired', 'revoked');--> statement-breakpoint
CREATE TYPE "public"."credential_subject_type" AS ENUM('person', 'organization');--> statement-breakpoint
CREATE TYPE "public"."verification_level" AS ENUM('self_declared', 'document_checked', 'issuer_confirmed', 'api_verified', 'cryptographically_verified');--> statement-breakpoint
CREATE TABLE "credential_evidence" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"credential_id" uuid NOT NULL,
	"media_id" uuid,
	"label" varchar(180) NOT NULL,
	"source_url" text,
	"file_hash" varchar(128),
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "credential_requirements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"scheme_id" uuid NOT NULL,
	"membership_type" varchar(80) DEFAULT 'default' NOT NULL,
	"rule" "credential_requirement_rule" DEFAULT 'required' NOT NULL,
	"group_key" varchar(80),
	"required_verification_level" "verification_level" DEFAULT 'document_checked' NOT NULL,
	"grace_period_days" integer DEFAULT 0 NOT NULL,
	"blocks_approval" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "credential_schemes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"code" varchar(80) NOT NULL,
	"name" varchar(180) NOT NULL,
	"description" text,
	"subject_type" "credential_subject_type" DEFAULT 'person' NOT NULL,
	"category" varchar(80) DEFAULT 'general' NOT NULL,
	"issuer_name" varchar(180),
	"validity_months" integer,
	"renewal_window_days" integer DEFAULT 30 NOT NULL,
	"minimum_verification_level" "verification_level" DEFAULT 'document_checked' NOT NULL,
	"fields" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"verification_config" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "credential_verification_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"credential_id" uuid NOT NULL,
	"from_status" "credential_status",
	"to_status" "credential_status" NOT NULL,
	"verification_level" "verification_level" NOT NULL,
	"method" varchar(80) NOT NULL,
	"source" varchar(180),
	"notes" text,
	"result" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"actor_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "member_credentials" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"member_id" uuid NOT NULL,
	"scheme_id" uuid NOT NULL,
	"credential_number" varchar(180),
	"issuer_name" varchar(180),
	"issued_at" timestamp with time zone,
	"expires_at" timestamp with time zone,
	"status" "credential_status" DEFAULT 'draft' NOT NULL,
	"verification_level" "verification_level" DEFAULT 'self_declared' NOT NULL,
	"verified_at" timestamp with time zone,
	"verified_by" uuid,
	"revoked_at" timestamp with time zone,
	"revoke_reason" text,
	"source_url" text,
	"data" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "credential_evidence" ADD CONSTRAINT "credential_evidence_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credential_evidence" ADD CONSTRAINT "credential_evidence_credential_id_member_credentials_id_fk" FOREIGN KEY ("credential_id") REFERENCES "public"."member_credentials"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credential_evidence" ADD CONSTRAINT "credential_evidence_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credential_evidence" ADD CONSTRAINT "credential_evidence_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credential_requirements" ADD CONSTRAINT "credential_requirements_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credential_requirements" ADD CONSTRAINT "credential_requirements_scheme_id_credential_schemes_id_fk" FOREIGN KEY ("scheme_id") REFERENCES "public"."credential_schemes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credential_schemes" ADD CONSTRAINT "credential_schemes_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credential_verification_events" ADD CONSTRAINT "credential_verification_events_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credential_verification_events" ADD CONSTRAINT "credential_verification_events_credential_id_member_credentials_id_fk" FOREIGN KEY ("credential_id") REFERENCES "public"."member_credentials"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credential_verification_events" ADD CONSTRAINT "credential_verification_events_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member_credentials" ADD CONSTRAINT "member_credentials_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member_credentials" ADD CONSTRAINT "member_credentials_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member_credentials" ADD CONSTRAINT "member_credentials_scheme_id_credential_schemes_id_fk" FOREIGN KEY ("scheme_id") REFERENCES "public"."credential_schemes"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member_credentials" ADD CONSTRAINT "member_credentials_verified_by_users_id_fk" FOREIGN KEY ("verified_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "credential_evidence_credential_idx" ON "credential_evidence" USING btree ("credential_id");--> statement-breakpoint
CREATE UNIQUE INDEX "credential_requirements_scope_unique" ON "credential_requirements" USING btree ("organization_id","scheme_id","membership_type");--> statement-breakpoint
CREATE INDEX "credential_requirements_type_idx" ON "credential_requirements" USING btree ("organization_id","membership_type","sort_order");--> statement-breakpoint
CREATE UNIQUE INDEX "credential_schemes_org_code_unique" ON "credential_schemes" USING btree ("organization_id","code");--> statement-breakpoint
CREATE INDEX "credential_schemes_category_idx" ON "credential_schemes" USING btree ("organization_id","category","is_active");--> statement-breakpoint
CREATE INDEX "credential_verification_timeline_idx" ON "credential_verification_events" USING btree ("credential_id","created_at");--> statement-breakpoint
CREATE INDEX "member_credentials_member_idx" ON "member_credentials" USING btree ("organization_id","member_id","status");--> statement-breakpoint
CREATE INDEX "member_credentials_expiry_idx" ON "member_credentials" USING btree ("organization_id","expires_at","status");