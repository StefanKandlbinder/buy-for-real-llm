import { createInsertSchema } from "drizzle-zod";
import { media } from "@/db/schema";
import { z } from "zod";

// Schema for inserting a new image
export const insertMediaSchema = createInsertSchema(media, {
  id: z.string(),
  groupId: z.number(),
  url: z.url(),
  label: z.string(),
  description: z.string().optional(),
  mediaType: z.enum(["image", "video"]).default("image"),
}).omit({
  createdAt: true,
  updatedAt: true,
});

// Schema for updating an existing image
export const updateMediaSchema = z.object({
  id: z.string(),
  label: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  url: z.string().url().optional(),
  mediaType: z.enum(["image", "video"]).optional(),
});
