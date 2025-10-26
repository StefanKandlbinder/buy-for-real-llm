ALTER TABLE "groups" ADD COLUMN IF NOT EXISTS "slug" text NOT NULL;--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'groups_slug_unique') THEN
    ALTER TABLE "groups" ADD CONSTRAINT "groups_slug_unique" UNIQUE("slug");
  END IF;
END $$;