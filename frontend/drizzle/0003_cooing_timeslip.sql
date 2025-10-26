ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "media_type" varchar(20) DEFAULT 'image' NOT NULL;--> statement-breakpoint
ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "is_active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "media" DROP COLUMN IF EXISTS "mime_type";