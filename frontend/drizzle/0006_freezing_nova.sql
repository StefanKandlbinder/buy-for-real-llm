ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "width" integer;
ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "height" integer;
ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "file_size" integer;
ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "thumbnail_id" varchar(128);