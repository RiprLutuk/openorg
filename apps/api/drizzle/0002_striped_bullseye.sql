CREATE TYPE "public"."complaint_status" AS ENUM('new', 'under_review', 'mediated', 'resolved', 'dismissed');--> statement-breakpoint
CREATE TYPE "public"."regulation_category" AS ENUM('regulasi_pemerintah', 'se_organisasi', 'ad_art', 'posisi_kebijakan');--> statement-breakpoint
CREATE TABLE "championship_standings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"season_year" integer DEFAULT 2026 NOT NULL,
	"category" varchar(120) DEFAULT 'refrigeration_skill' NOT NULL,
	"participant_name" varchar(160) NOT NULL,
	"team_name" varchar(160),
	"unit_name" varchar(160),
	"points" integer DEFAULT 0 NOT NULL,
	"rank" integer DEFAULT 1 NOT NULL,
	"achievements" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "event_registrations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"member_id" uuid,
	"participant_name" varchar(160) NOT NULL,
	"participant_email" varchar(320) NOT NULL,
	"participant_phone" varchar(40),
	"ticket_code" varchar(80) NOT NULL,
	"qr_code_url" text,
	"status" varchar(40) DEFAULT 'registered' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "event_registrations_ticket_code_unique" UNIQUE("ticket_code")
);
--> statement-breakpoint
CREATE TABLE "industry_statistics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"metric_key" varchar(80) NOT NULL,
	"metric_label" varchar(180) NOT NULL,
	"metric_value" varchar(80) NOT NULL,
	"metric_unit" varchar(40),
	"trend_direction" varchar(20) DEFAULT 'up',
	"trend_percentage" varchar(20),
	"category" varchar(80) DEFAULT 'general' NOT NULL,
	"period" varchar(80) DEFAULT '2026 Q1',
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "industry_statistics_metric_key_unique" UNIQUE("metric_key")
);
--> statement-breakpoint
CREATE TABLE "public_complaints" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ticket_number" varchar(60) NOT NULL,
	"complainant_name" varchar(160) NOT NULL,
	"complainant_email" varchar(320) NOT NULL,
	"complainant_phone" varchar(40),
	"target_type" varchar(60) DEFAULT 'member' NOT NULL,
	"target_identifier" varchar(160) NOT NULL,
	"category" varchar(80) DEFAULT 'kode_etik' NOT NULL,
	"description" text NOT NULL,
	"evidence_file_url" text,
	"status" "complaint_status" DEFAULT 'new' NOT NULL,
	"response_notes" text,
	"reviewed_by" uuid,
	"reviewed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "public_complaints_ticket_number_unique" UNIQUE("ticket_number")
);
--> statement-breakpoint
CREATE TABLE "regulations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(220) NOT NULL,
	"slug" varchar(200) NOT NULL,
	"category" "regulation_category" DEFAULT 'regulasi_pemerintah' NOT NULL,
	"number" varchar(120),
	"issued_date" timestamp with time zone,
	"file_url" text,
	"summary" text,
	"download_count" integer DEFAULT 0 NOT NULL,
	"status" "publication_status" DEFAULT 'published' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "regulations_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "event_registrations" ADD CONSTRAINT "event_registrations_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_registrations" ADD CONSTRAINT "event_registrations_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "public_complaints" ADD CONSTRAINT "public_complaints_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;