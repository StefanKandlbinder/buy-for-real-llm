import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { groups, media } from "@/db/schema";
import { z } from "zod";

// Function to generate a slug from a name
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/[\s_-]+/g, "-") // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
}

// Schema for inserting a new group
export const insertGroupSchema = createInsertSchema(groups, {
  name: z
    .string()
    .min(3, { message: "Group name must be at least 3 characters." }),
  slug: z.string().optional(), // Will be auto-generated from name if not provided
  parentId: z.number().nullish,
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Schema for updating an existing group
export const updateGroupSchema = createSelectSchema(groups)
  .pick({
    id: true,
    name: true,
    slug: true,
  })
  .extend({
    name: z
      .string()
      .min(3, { message: "Group name must be at least 3 characters." }),
    slug: z.string().optional(),
  });

// Schema for inserting a new image
export const insertMediaSchema = createInsertSchema(media, {
  label: z.string().min(1),
  description: z.string().min(1),
  url: z.url(),
  id: z.int(),
}).omit({
  createdAt: true,
  updatedAt: true,
});
