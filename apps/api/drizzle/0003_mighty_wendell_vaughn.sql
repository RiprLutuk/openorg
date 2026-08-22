CREATE TABLE "lender_registries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"brand_name" varchar(160) NOT NULL,
	"company_name" varchar(220) NOT NULL,
	"license_number" varchar(120) NOT NULL,
	"sector_type" varchar(80) DEFAULT 'P2P Lending Produktif' NOT NULL,
	"ojk_status" varchar(60) DEFAULT 'Berizin OJK' NOT NULL,
	"website_url" text,
	"is_afpi_member" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "lender_registries_license_number_unique" UNIQUE("license_number")
);
--> statement-breakpoint
CREATE TABLE "registered_clubs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"club_name" varchar(180) NOT NULL,
	"code_tkt" varchar(80) NOT NULL,
	"province" varchar(100) NOT NULL,
	"category" varchar(80) DEFAULT 'Mobility & Community' NOT NULL,
	"chair_name" varchar(160),
	"active_members" integer DEFAULT 1 NOT NULL,
	"status" varchar(40) DEFAULT 'verified' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "registered_clubs_code_tkt_unique" UNIQUE("code_tkt")
);
--> statement-breakpoint
CREATE TABLE "technician_directories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(160) NOT NULL,
	"kta_number" varchar(80) NOT NULL,
	"skill_level" varchar(80) DEFAULT 'Level 3 Residensial' NOT NULL,
	"province" varchar(100) NOT NULL,
	"city" varchar(100) NOT NULL,
	"phone" varchar(40),
	"workshop_name" varchar(160),
	"rating" varchar(10) DEFAULT '4.9',
	"certified_bnsp" boolean DEFAULT true NOT NULL,
	"is_available" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "technician_directories_kta_number_unique" UNIQUE("kta_number")
);
--> statement-breakpoint
CREATE TABLE "working_groups" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(180) NOT NULL,
	"slug" varchar(160) NOT NULL,
	"chair_name" varchar(160),
	"category" varchar(80) DEFAULT 'advocacy' NOT NULL,
	"description" text,
	"member_count" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "working_groups_slug_unique" UNIQUE("slug")
);
