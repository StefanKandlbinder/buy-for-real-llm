import { relations } from "drizzle-orm";
import {
  timestamp,
  serial,
  integer,
  pgTable,
  boolean,
} from "drizzle-orm/pg-core";
import { groups } from "./group";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";

// Advertisements Table: Represents an advertisement that belongs to a group
export const advertisements = pgTable("advertisements", {
  id: serial("id").primaryKey(),
  groupId: integer("group_id")
    .references(() => groups.id, { onDelete: "cascade" })
    .notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Drizzle Relations for enabling the Relational Query API
export const advertisementsRelations = relations(advertisements, ({ one }) => ({
  // An advertisement belongs to one group
  group: one(groups, {
    fields: [advertisements.groupId],
    references: [groups.id],
  }),
}));

// Zod schemas for validation
export const advertisementSelectSchema = createSelectSchema(advertisements);
export const advertisementInsertSchema = createInsertSchema(advertisements);
export const advertisementUpdateSchema = createUpdateSchema(advertisements);

// Custom validation schemas
export const createAdvertisementSchema = z.object({
  groupId: z.number().positive("Group ID is required"),
  isActive: z.boolean().optional(),
});

export const updateAdvertisementSchema = z.object({
  id: z.number().positive("Advertisement ID is required"),
  groupId: z.number().positive("Group ID is required").optional(),
  isActive: z.boolean().optional(),
});

export type CreateAdvertisementInput = z.infer<
  typeof createAdvertisementSchema
>;
export type UpdateAdvertisementInput = z.infer<
  typeof updateAdvertisementSchema
>;
export type Advertisement = z.infer<typeof advertisementSelectSchema>;
