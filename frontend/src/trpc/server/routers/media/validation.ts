import { createInsertSchema } from "drizzle-zod";
import { media } from "@/db/schema";
import { z } from "zod";

// Schema for inserting a new image
export const insertMediaSchema = createInsertSchema(media, {
  label: z.string().min(1),
  description: z.string().min(1),
  url: z.url(),
  id: z.string().length(128),
}).omit({
  createdAt: true,
  updatedAt: true,
});

// Schema for updating an existing image
export const updateMediaSchema = z.object({
  id: z.string().length(128),
  label: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  url: z.url().optional(),
});
