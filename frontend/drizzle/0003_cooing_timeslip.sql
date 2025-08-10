ALTER TABLE "media" ADD COLUMN "media_type" varchar(20) DEFAULT 'image' NOT NULL;--> statement-breakpoint
ALTER TABLE "media" ADD COLUMN "is_active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "media" DROP COLUMN "mime_type";