CREATE TYPE "public"."credit_ledger_entry_type" AS ENUM('earned', 'adjustment', 'reversal');--> statement-breakpoint
CREATE TYPE "public"."learning_activity_status" AS ENUM('draft', 'open', 'in_progress', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."learning_attendance_status" AS ENUM('present', 'late', 'absent', 'excused');--> statement-breakpoint
CREATE TYPE "public"."learning_delivery_mode" AS ENUM('onsite', 'online', 'hybrid', 'self_paced');--> statement-breakpoint
CREATE TYPE "public"."learning_enrollment_status" AS ENUM('registered', 'waitlisted', 'confirmed', 'completed', 'cancelled');--> statement-breakpoint
CREATE TABLE "credit_ledger" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"member_id" uuid NOT NULL,
	"credit_scheme_id" uuid NOT NULL,
	"activity_id" uuid,
	"enrollment_id" uuid,
	"entry_type" "credit_ledger_entry_type" NOT NULL,
	"amount_hundredths" integer NOT NULL,
	"reason" text NOT NULL,
	"reversal_of" uuid,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"posted_by" uuid,
	"posted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "credit_schemes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"code" varchar(60) NOT NULL,
	"name" varchar(160) NOT NULL,
	"unit_label" varchar(60) NOT NULL,
	"description" text,
	"validity_months" integer,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "learning_activities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"credit_scheme_id" uuid,
	"code" varchar(80) NOT NULL,
	"title" varchar(200) NOT NULL,
	"description" text,
	"category" varchar(80) DEFAULT 'general' NOT NULL,
	"delivery_mode" "learning_delivery_mode" DEFAULT 'onsite' NOT NULL,
	"location_name" varchar(200),
	"meeting_url" text,
	"starts_at" timestamp with time zone NOT NULL,
	"ends_at" timestamp with time zone,
	"timezone" varchar(60) DEFAULT 'Asia/Jakarta' NOT NULL,
	"enrollment_opens_at" timestamp with time zone,
	"enrollment_closes_at" timestamp with time zone,
	"capacity" integer,
	"credit_amount_hundredths" integer DEFAULT 0 NOT NULL,
	"status" "learning_activity_status" DEFAULT 'draft' NOT NULL,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "learning_attendance" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"activity_id" uuid NOT NULL,
	"member_id" uuid NOT NULL,
	"status" "learning_attendance_status" NOT NULL,
	"check_in_at" timestamp with time zone,
	"check_out_at" timestamp with time zone,
	"minutes_attended" integer,
	"source" varchar(80) DEFAULT 'admin' NOT NULL,
	"evidence" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"verified_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "learning_enrollments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"activity_id" uuid NOT NULL,
	"member_id" uuid NOT NULL,
	"status" "learning_enrollment_status" DEFAULT 'registered' NOT NULL,
	"registered_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "credit_ledger" ADD CONSTRAINT "credit_ledger_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credit_ledger" ADD CONSTRAINT "credit_ledger_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credit_ledger" ADD CONSTRAINT "credit_ledger_credit_scheme_id_credit_schemes_id_fk" FOREIGN KEY ("credit_scheme_id") REFERENCES "public"."credit_schemes"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credit_ledger" ADD CONSTRAINT "credit_ledger_activity_id_learning_activities_id_fk" FOREIGN KEY ("activity_id") REFERENCES "public"."learning_activities"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credit_ledger" ADD CONSTRAINT "credit_ledger_enrollment_id_learning_enrollments_id_fk" FOREIGN KEY ("enrollment_id") REFERENCES "public"."learning_enrollments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credit_ledger" ADD CONSTRAINT "credit_ledger_posted_by_users_id_fk" FOREIGN KEY ("posted_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credit_schemes" ADD CONSTRAINT "credit_schemes_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learning_activities" ADD CONSTRAINT "learning_activities_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learning_activities" ADD CONSTRAINT "learning_activities_credit_scheme_id_credit_schemes_id_fk" FOREIGN KEY ("credit_scheme_id") REFERENCES "public"."credit_schemes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learning_activities" ADD CONSTRAINT "learning_activities_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learning_attendance" ADD CONSTRAINT "learning_attendance_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learning_attendance" ADD CONSTRAINT "learning_attendance_activity_id_learning_activities_id_fk" FOREIGN KEY ("activity_id") REFERENCES "public"."learning_activities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learning_attendance" ADD CONSTRAINT "learning_attendance_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learning_attendance" ADD CONSTRAINT "learning_attendance_verified_by_users_id_fk" FOREIGN KEY ("verified_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learning_enrollments" ADD CONSTRAINT "learning_enrollments_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learning_enrollments" ADD CONSTRAINT "learning_enrollments_activity_id_learning_activities_id_fk" FOREIGN KEY ("activity_id") REFERENCES "public"."learning_activities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learning_enrollments" ADD CONSTRAINT "learning_enrollments_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "credit_ledger_member_idx" ON "credit_ledger" USING btree ("organization_id","member_id","credit_scheme_id","posted_at");--> statement-breakpoint
CREATE UNIQUE INDEX "credit_ledger_activity_award_unique" ON "credit_ledger" USING btree ("activity_id","member_id","credit_scheme_id") WHERE "credit_ledger"."entry_type" = 'earned';--> statement-breakpoint
CREATE UNIQUE INDEX "credit_schemes_org_code_unique" ON "credit_schemes" USING btree ("organization_id","code");--> statement-breakpoint
CREATE UNIQUE INDEX "learning_activities_org_code_unique" ON "learning_activities" USING btree ("organization_id","code");--> statement-breakpoint
CREATE INDEX "learning_activities_schedule_idx" ON "learning_activities" USING btree ("organization_id","status","starts_at");--> statement-breakpoint
CREATE UNIQUE INDEX "learning_attendance_activity_member_unique" ON "learning_attendance" USING btree ("activity_id","member_id");--> statement-breakpoint
CREATE UNIQUE INDEX "learning_enrollments_activity_member_unique" ON "learning_enrollments" USING btree ("activity_id","member_id");--> statement-breakpoint
CREATE INDEX "learning_enrollments_member_idx" ON "learning_enrollments" USING btree ("organization_id","member_id","status");--> statement-breakpoint
INSERT INTO "permissions" ("key", "description")
VALUES
	('learning.read', 'View learning activities and credit records'),
	('learning.write', 'Manage activities, enrollment, and attendance'),
	('learning.award', 'Complete activities and post credit ledger entries')
ON CONFLICT ("key") DO UPDATE
SET "description" = EXCLUDED."description";--> statement-breakpoint
INSERT INTO "role_permissions" ("role_id", "permission_id")
SELECT "roles"."id", "permissions"."id"
FROM "roles"
CROSS JOIN "permissions"
WHERE "roles"."name" = 'Owner'
	AND "permissions"."key" IN ('learning.read', 'learning.write', 'learning.award')
ON CONFLICT DO NOTHING;
