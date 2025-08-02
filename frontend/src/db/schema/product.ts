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

// Products Table: Represents a product that belongs to a group
export const products = pgTable("products", {
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
export const productsRelations = relations(products, ({ one }) => ({
  // A product belongs to one group
  group: one(groups, {
    fields: [products.groupId],
    references: [groups.id],
  }),
}));

// Zod schemas for validation
export const productSelectSchema = createSelectSchema(products);
export const productInsertSchema = createInsertSchema(products);
export const productUpdateSchema = createUpdateSchema(products);

// Custom validation schemas
export const createProductSchema = z.object({
  groupId: z.number().positive("Group ID is required"),
  isActive: z.boolean().optional(),
});

export const updateProductSchema = z.object({
  id: z.number().positive("Product ID is required"),
  groupId: z.number().positive("Group ID is required").optional(),
  isActive: z.boolean().optional(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type Product = z.infer<typeof productSelectSchema>;
