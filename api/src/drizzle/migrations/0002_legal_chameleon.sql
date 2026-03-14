ALTER TYPE "public"."frequency_type" ADD VALUE 'custom';--> statement-breakpoint
ALTER TABLE "recurring_transactions" ADD COLUMN "custom_interval_days" numeric;