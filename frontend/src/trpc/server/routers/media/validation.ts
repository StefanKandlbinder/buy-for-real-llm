import { createInsertSchema } from "drizzle-zod";
import { media } from "@/db/schema";
import { z } from "zod";

// Schema for inserting a new image
export const insertMediaSchema = createInsertSchema(media, {
  label: z.string().optional(),
  description: z.string().optional(),
  url: z.string(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Schema for updating an existing image
export const updateMediaSchema = z.object({
  id: z.int(),
  label: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  url: z.url().optional(),
});
