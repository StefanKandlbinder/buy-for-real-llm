import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { groups, media } from "@/db/schema";
import { z } from "zod";

// Schema for inserting a new group
export const insertGroupSchema = createInsertSchema(groups, {
  name: z
    .string()
    .min(3, { message: "Group name must be at least 3 characters." }),
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
  })
  .extend({
    name: z
      .string()
      .min(3, { message: "Group name must be at least 3 characters." }),
  });

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
