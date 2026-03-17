ALTER TABLE "goals" ADD COLUMN "category_id" uuid REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
