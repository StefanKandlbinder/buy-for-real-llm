ALTER TABLE "groups" ADD COLUMN "slug" text NOT NULL;--> statement-breakpoint
ALTER TABLE "groups" ADD CONSTRAINT "groups_slug_unique" UNIQUE("slug");