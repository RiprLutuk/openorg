CREATE TYPE "public"."billing_interval" AS ENUM('one_time', 'monthly', 'quarterly', 'annual');--> statement-breakpoint
CREATE TYPE "public"."campaign_channel" AS ENUM('email', 'whatsapp', 'sms', 'in_app');--> statement-breakpoint
CREATE TYPE "public"."campaign_recipient_status" AS ENUM('queued', 'sent', 'failed', 'skipped');--> statement-breakpoint
CREATE TYPE "public"."campaign_status" AS ENUM('draft', 'scheduled', 'queued', 'sent', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."credential_requirement_rule" AS ENUM('required', 'one_of', 'optional');--> statement-breakpoint
CREATE TYPE "public"."credential_status" AS ENUM('draft', 'submitted', 'verified', 'rejected', 'expired', 'revoked');--> statement-breakpoint
CREATE TYPE "public"."credential_subject_type" AS ENUM('person', 'organization');--> statement-breakpoint
CREATE TYPE "public"."credit_ledger_entry_type" AS ENUM('earned', 'adjustment', 'reversal');--> statement-breakpoint
CREATE TYPE "public"."entitlement_status" AS ENUM('active', 'expired', 'revoked');--> statement-breakpoint
CREATE TYPE "public"."invoice_status" AS ENUM('draft', 'open', 'paid', 'void');--> statement-breakpoint
CREATE TYPE "public"."learning_activity_status" AS ENUM('draft', 'open', 'in_progress', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."learning_attendance_status" AS ENUM('present', 'late', 'absent', 'excused');--> statement-breakpoint
CREATE TYPE "public"."learning_delivery_mode" AS ENUM('onsite', 'online', 'hybrid', 'self_paced');--> statement-breakpoint
CREATE TYPE "public"."learning_enrollment_status" AS ENUM('registered', 'waitlisted', 'confirmed', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."media_kind" AS ENUM('image', 'video', 'document', 'audio');--> statement-breakpoint
CREATE TYPE "public"."member_document_kind" AS ENUM('identity', 'background_check', 'certificate', 'license', 'other');--> statement-breakpoint
CREATE TYPE "public"."member_status" AS ENUM('applicant', 'pending', 'active', 'inactive', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."organization_kind" AS ENUM('association', 'nonprofit', 'foundation', 'community', 'professional', 'financial', 'animal_welfare', 'humanitarian', 'other');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('confirmed', 'failed', 'refunded');--> statement-breakpoint
CREATE TYPE "public"."publication_status" AS ENUM('draft', 'review', 'scheduled', 'published', 'archived');--> statement-breakpoint
CREATE TYPE "public"."revenue_product_type" AS ENUM('membership_dues', 'event_ticket', 'donation', 'service', 'sponsorship', 'other');--> statement-breakpoint
CREATE TYPE "public"."review_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."submission_status" AS ENUM('new', 'in_progress', 'resolved', 'spam');--> statement-breakpoint
CREATE TYPE "public"."user_status" AS ENUM('invited', 'active', 'suspended');--> statement-breakpoint
CREATE TYPE "public"."verification_level" AS ENUM('self_declared', 'document_checked', 'issuer_confirmed', 'api_verified', 'cryptographically_verified');--> statement-breakpoint
CREATE TABLE "audience_segments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(180) NOT NULL,
	"description" text,
	"criteria" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor_id" uuid,
	"action" varchar(100) NOT NULL,
	"resource_type" varchar(80) NOT NULL,
	"resource_id" varchar(100),
	"before" jsonb,
	"after" jsonb,
	"ip_address" varchar(64),
	"user_agent" varchar(500),
	"request_id" varchar(80),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "campaign_recipients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
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
CREATE TABLE "categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(120) NOT NULL,
	"slug" varchar(120) NOT NULL,
	"description" varchar(240),
	"parent_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "contact_submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(160) NOT NULL,
	"email" varchar(320) NOT NULL,
	"subject" varchar(200),
	"message" text NOT NULL,
	"status" "submission_status" DEFAULT 'new' NOT NULL,
	"ip_address" varchar(64),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(200) NOT NULL,
	"slug" varchar(180) NOT NULL,
	"type" varchar(40) DEFAULT 'post' NOT NULL,
	"excerpt" text,
	"body" text DEFAULT '' NOT NULL,
	"cover_url" text,
	"author_name" varchar(120),
	"source_url" text,
	"status" "publication_status" DEFAULT 'draft' NOT NULL,
	"category_id" uuid,
	"seo" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"published_at" timestamp with time zone,
	"author_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "contents_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "credential_requirements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"scheme_id" uuid NOT NULL,
	"prerequisite_scheme_id" uuid NOT NULL,
	"rule_group" varchar(80) DEFAULT 'primary' NOT NULL,
	"rule_type" "credential_requirement_rule" DEFAULT 'required' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "credential_schemes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(80) NOT NULL,
	"name" varchar(180) NOT NULL,
	"subject_type" "credential_subject_type" DEFAULT 'person' NOT NULL,
	"minimum_verification_level" "verification_level" DEFAULT 'document_checked' NOT NULL,
	"validity_period_days" integer,
	"renewal_grace_period_days" integer DEFAULT 30 NOT NULL,
	"json_schema" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "credential_schemes_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "engagement_campaigns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
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
CREATE TABLE "events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(200) NOT NULL,
	"slug" varchar(180) NOT NULL,
	"description" text,
	"cover_url" text,
	"location_name" varchar(200),
	"address" text,
	"meeting_url" text,
	"registration_url" text,
	"starts_at" timestamp with time zone NOT NULL,
	"ends_at" timestamp with time zone,
	"timezone" varchar(60) DEFAULT 'Asia/Jakarta' NOT NULL,
	"capacity" integer,
	"status" "publication_status" DEFAULT 'published' NOT NULL,
	"seo" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"published_at" timestamp with time zone,
	"organizer_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "events_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "invoice_lines" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
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
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "invoices_invoice_number_unique" UNIQUE("invoice_number")
);
--> statement-breakpoint
CREATE TABLE "learning_activities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid,
	"credit_scheme_id" uuid,
	"title" varchar(200) NOT NULL,
	"code" varchar(80) NOT NULL,
	"delivery_mode" "learning_delivery_mode" DEFAULT 'onsite' NOT NULL,
	"credit_amount_hundredths" integer DEFAULT 100 NOT NULL,
	"capacity" integer,
	"status" "learning_activity_status" DEFAULT 'open' NOT NULL,
	"starts_at" timestamp with time zone NOT NULL,
	"ends_at" timestamp with time zone,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "learning_activities_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "learning_attendance" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"enrollment_id" uuid NOT NULL,
	"status" "learning_attendance_status" DEFAULT 'present' NOT NULL,
	"checked_in_at" timestamp with time zone DEFAULT now() NOT NULL,
	"verified_by" uuid,
	"notes" text,
	CONSTRAINT "learning_attendance_enrollment_id_unique" UNIQUE("enrollment_id")
);
--> statement-breakpoint
CREATE TABLE "learning_credit_ledger" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"member_id" uuid NOT NULL,
	"scheme_id" uuid NOT NULL,
	"activity_id" uuid,
	"entry_type" "credit_ledger_entry_type" DEFAULT 'earned' NOT NULL,
	"credit_amount_hundredths" integer NOT NULL,
	"notes" text,
	"issued_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "learning_credit_schemes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(80) NOT NULL,
	"name" varchar(180) NOT NULL,
	"unit_name" varchar(40) DEFAULT 'SKP' NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "learning_credit_schemes_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "learning_enrollments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"activity_id" uuid NOT NULL,
	"member_id" uuid NOT NULL,
	"status" "learning_enrollment_status" DEFAULT 'registered' NOT NULL,
	"registered_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "media" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kind" "media_kind" DEFAULT 'image' NOT NULL,
	"filename" varchar(255) NOT NULL,
	"url" text NOT NULL,
	"mime_type" varchar(120) NOT NULL,
	"size_bytes" integer NOT NULL,
	"checksum_sha256" varchar(64) NOT NULL,
	"width" integer,
	"height" integer,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"uploaded_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "member_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"member_id" uuid NOT NULL,
	"email" varchar(320) NOT NULL,
	"password_hash" text NOT NULL,
	"status" "user_status" DEFAULT 'active' NOT NULL,
	"last_login_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "member_accounts_member_id_unique" UNIQUE("member_id"),
	CONSTRAINT "member_accounts_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "member_applications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"full_name" varchar(160) NOT NULL,
	"email" varchar(320) NOT NULL,
	"phone" varchar(40),
	"requested_unit_id" uuid,
	"payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"status" "member_status" DEFAULT 'applicant' NOT NULL,
	"reviewed_by" uuid,
	"reviewed_at" timestamp with time zone,
	"review_notes" text,
	"created_member_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "member_credentials" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"member_id" uuid NOT NULL,
	"scheme_id" uuid NOT NULL,
	"credential_number" varchar(100) NOT NULL,
	"verification_level" "verification_level" DEFAULT 'document_checked' NOT NULL,
	"status" "credential_status" DEFAULT 'verified' NOT NULL,
	"issued_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone,
	"revoked_at" timestamp with time zone,
	"revoked_reason" text,
	"payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"issued_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "member_credentials_credential_number_unique" UNIQUE("credential_number")
);
--> statement-breakpoint
CREATE TABLE "member_documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"member_id" uuid NOT NULL,
	"media_id" uuid NOT NULL,
	"kind" "member_document_kind" DEFAULT 'other' NOT NULL,
	"title" varchar(180) NOT NULL,
	"review_status" "review_status" DEFAULT 'pending' NOT NULL,
	"review_notes" text,
	"reviewed_by" uuid,
	"reviewed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "member_entitlements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
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
CREATE TABLE "member_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"member_account_id" uuid NOT NULL,
	"token_hash" "bytea" NOT NULL,
	"ip_address" varchar(64),
	"user_agent" varchar(500),
	"expires_at" timestamp with time zone NOT NULL,
	"last_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "member_sessions_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
CREATE TABLE "members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"member_number" varchar(60) NOT NULL,
	"name" varchar(160) NOT NULL,
	"email" varchar(320),
	"phone" varchar(40),
	"status" "member_status" DEFAULT 'active' NOT NULL,
	"joined_at" timestamp with time zone,
	"unit_id" uuid,
	"avatar_url" text,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "members_member_number_unique" UNIQUE("member_number")
);
--> statement-breakpoint
CREATE TABLE "membership_cards" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"member_id" uuid NOT NULL,
	"code" varchar(80) NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"issued_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone,
	"revoked_at" timestamp with time zone,
	"revoked_reason" text,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "membership_cards_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "organization_units" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"parent_id" uuid,
	"name" varchar(160) NOT NULL,
	"code" varchar(40),
	"type" varchar(60) DEFAULT 'unit' NOT NULL,
	"description" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(180) NOT NULL,
	"slug" varchar(160) NOT NULL,
	"excerpt" text,
	"sections" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"status" "publication_status" DEFAULT 'draft' NOT NULL,
	"is_homepage" boolean DEFAULT false NOT NULL,
	"seo" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"published_at" timestamp with time zone,
	"author_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "pages_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
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
CREATE TABLE "permissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" varchar(120) NOT NULL,
	"description" varchar(240),
	CONSTRAINT "permissions_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "position_assignments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"position_id" uuid NOT NULL,
	"member_id" uuid NOT NULL,
	"starts_at" timestamp with time zone,
	"ends_at" timestamp with time zone,
	"is_primary" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "positions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"unit_id" uuid,
	"parent_id" uuid,
	"title" varchar(160) NOT NULL,
	"code" varchar(40),
	"description" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "revenue_products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(180) NOT NULL,
	"code" varchar(80) NOT NULL,
	"type" "revenue_product_type" DEFAULT 'membership_dues' NOT NULL,
	"description" text,
	"amount_minor" integer NOT NULL,
	"currency" varchar(3) DEFAULT 'IDR' NOT NULL,
	"billing_interval" "billing_interval" DEFAULT 'annual' NOT NULL,
	"grants_entitlement_key" varchar(100),
	"entitlement_duration_days" integer,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "revenue_products_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "role_permissions" (
	"role_id" uuid NOT NULL,
	"permission_id" uuid NOT NULL,
	CONSTRAINT "role_permissions_role_id_permission_id_pk" PRIMARY KEY("role_id","permission_id")
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(80) NOT NULL,
	"description" varchar(240),
	"is_system" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "roles_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token_hash" "bytea" NOT NULL,
	"ip_address" varchar(64),
	"user_agent" varchar(500),
	"expires_at" timestamp with time zone NOT NULL,
	"last_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sessions_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
CREATE TABLE "site_settings" (
	"id" varchar(64) PRIMARY KEY DEFAULT 'default' NOT NULL,
	"name" varchar(160) DEFAULT 'OpenOrg Association' NOT NULL,
	"slug" varchar(80) DEFAULT 'openorg' NOT NULL,
	"kind" "organization_kind" DEFAULT 'association' NOT NULL,
	"tagline" varchar(240) DEFAULT 'Platform Resmi Organisasi',
	"description" text DEFAULT 'Platform terpadu keanggotaan, tata kelola organisasi, kredit akademi SKP/CPD, dan verifikasi kredensial.',
	"logo_url" text,
	"favicon_url" text,
	"email" varchar(320),
	"phone" varchar(40),
	"address" text,
	"locale" varchar(12) DEFAULT 'id-ID' NOT NULL,
	"timezone" varchar(60) DEFAULT 'Asia/Jakarta' NOT NULL,
	"primary_color" text DEFAULT '#6941C6',
	"secondary_color" text DEFAULT '#12B76A',
	"quick_contact" jsonb,
	"social_links" jsonb DEFAULT '[]'::jsonb,
	"navigation" jsonb DEFAULT '[]'::jsonb,
	"footer" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_roles" (
	"user_id" uuid NOT NULL,
	"role_id" uuid NOT NULL,
	CONSTRAINT "user_roles_user_id_role_id_pk" PRIMARY KEY("user_id","role_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(160) NOT NULL,
	"email" varchar(320) NOT NULL,
	"password_hash" text NOT NULL,
	"avatar_url" text,
	"status" "user_status" DEFAULT 'invited' NOT NULL,
	"email_verified_at" timestamp with time zone,
	"last_login_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaign_recipients" ADD CONSTRAINT "campaign_recipients_campaign_id_engagement_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."engagement_campaigns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaign_recipients" ADD CONSTRAINT "campaign_recipients_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contents" ADD CONSTRAINT "contents_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contents" ADD CONSTRAINT "contents_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credential_requirements" ADD CONSTRAINT "credential_requirements_scheme_id_credential_schemes_id_fk" FOREIGN KEY ("scheme_id") REFERENCES "public"."credential_schemes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credential_requirements" ADD CONSTRAINT "credential_requirements_prerequisite_scheme_id_credential_schemes_id_fk" FOREIGN KEY ("prerequisite_scheme_id") REFERENCES "public"."credential_schemes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "engagement_campaigns" ADD CONSTRAINT "engagement_campaigns_segment_id_audience_segments_id_fk" FOREIGN KEY ("segment_id") REFERENCES "public"."audience_segments"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "engagement_campaigns" ADD CONSTRAINT "engagement_campaigns_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_organizer_id_users_id_fk" FOREIGN KEY ("organizer_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice_lines" ADD CONSTRAINT "invoice_lines_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice_lines" ADD CONSTRAINT "invoice_lines_product_id_revenue_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."revenue_products"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learning_activities" ADD CONSTRAINT "learning_activities_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learning_activities" ADD CONSTRAINT "learning_activities_credit_scheme_id_learning_credit_schemes_id_fk" FOREIGN KEY ("credit_scheme_id") REFERENCES "public"."learning_credit_schemes"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learning_attendance" ADD CONSTRAINT "learning_attendance_enrollment_id_learning_enrollments_id_fk" FOREIGN KEY ("enrollment_id") REFERENCES "public"."learning_enrollments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learning_attendance" ADD CONSTRAINT "learning_attendance_verified_by_users_id_fk" FOREIGN KEY ("verified_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learning_credit_ledger" ADD CONSTRAINT "learning_credit_ledger_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learning_credit_ledger" ADD CONSTRAINT "learning_credit_ledger_scheme_id_learning_credit_schemes_id_fk" FOREIGN KEY ("scheme_id") REFERENCES "public"."learning_credit_schemes"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learning_credit_ledger" ADD CONSTRAINT "learning_credit_ledger_activity_id_learning_activities_id_fk" FOREIGN KEY ("activity_id") REFERENCES "public"."learning_activities"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learning_credit_ledger" ADD CONSTRAINT "learning_credit_ledger_issued_by_users_id_fk" FOREIGN KEY ("issued_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learning_enrollments" ADD CONSTRAINT "learning_enrollments_activity_id_learning_activities_id_fk" FOREIGN KEY ("activity_id") REFERENCES "public"."learning_activities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learning_enrollments" ADD CONSTRAINT "learning_enrollments_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media" ADD CONSTRAINT "media_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member_accounts" ADD CONSTRAINT "member_accounts_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member_applications" ADD CONSTRAINT "member_applications_requested_unit_id_organization_units_id_fk" FOREIGN KEY ("requested_unit_id") REFERENCES "public"."organization_units"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member_applications" ADD CONSTRAINT "member_applications_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member_applications" ADD CONSTRAINT "member_applications_created_member_id_members_id_fk" FOREIGN KEY ("created_member_id") REFERENCES "public"."members"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member_credentials" ADD CONSTRAINT "member_credentials_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member_credentials" ADD CONSTRAINT "member_credentials_scheme_id_credential_schemes_id_fk" FOREIGN KEY ("scheme_id") REFERENCES "public"."credential_schemes"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member_credentials" ADD CONSTRAINT "member_credentials_issued_by_users_id_fk" FOREIGN KEY ("issued_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member_documents" ADD CONSTRAINT "member_documents_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member_documents" ADD CONSTRAINT "member_documents_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member_documents" ADD CONSTRAINT "member_documents_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member_entitlements" ADD CONSTRAINT "member_entitlements_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member_entitlements" ADD CONSTRAINT "member_entitlements_source_invoice_id_invoices_id_fk" FOREIGN KEY ("source_invoice_id") REFERENCES "public"."invoices"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member_entitlements" ADD CONSTRAINT "member_entitlements_source_product_id_revenue_products_id_fk" FOREIGN KEY ("source_product_id") REFERENCES "public"."revenue_products"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member_sessions" ADD CONSTRAINT "member_sessions_member_account_id_member_accounts_id_fk" FOREIGN KEY ("member_account_id") REFERENCES "public"."member_accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "members" ADD CONSTRAINT "members_unit_id_organization_units_id_fk" FOREIGN KEY ("unit_id") REFERENCES "public"."organization_units"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "membership_cards" ADD CONSTRAINT "membership_cards_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pages" ADD CONSTRAINT "pages_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_recorded_by_users_id_fk" FOREIGN KEY ("recorded_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "position_assignments" ADD CONSTRAINT "position_assignments_position_id_positions_id_fk" FOREIGN KEY ("position_id") REFERENCES "public"."positions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "position_assignments" ADD CONSTRAINT "position_assignments_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "positions" ADD CONSTRAINT "positions_unit_id_organization_units_id_fk" FOREIGN KEY ("unit_id") REFERENCES "public"."organization_units"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_permissions_id_fk" FOREIGN KEY ("permission_id") REFERENCES "public"."permissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "contents_type_status_idx" ON "contents" USING btree ("type","status");--> statement-breakpoint
CREATE INDEX "events_starts_at_idx" ON "events" USING btree ("starts_at");--> statement-breakpoint
CREATE UNIQUE INDEX "enrollments_activity_member_unique" ON "learning_enrollments" USING btree ("activity_id","member_id");--> statement-breakpoint
CREATE INDEX "members_status_idx" ON "members" USING btree ("status");--> statement-breakpoint
CREATE INDEX "sessions_user_idx" ON "sessions" USING btree ("user_id");