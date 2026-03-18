ALTER TABLE "budgets" ADD COLUMN "is_recurring" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "budgets" ADD COLUMN "is_active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "budgets" ADD COLUMN "recurring_group_id" uuid;