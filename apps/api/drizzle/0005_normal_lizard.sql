ALTER TABLE "member_accounts" ADD COLUMN "email_verified_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "member_accounts" ADD COLUMN "verification_token_hash" "bytea";--> statement-breakpoint
ALTER TABLE "member_accounts" ADD COLUMN "verification_token_expires_at" timestamp with time zone;