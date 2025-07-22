import { relations } from "drizzle-orm";
import { text, timestamp, serial, integer, pgTable } from "drizzle-orm/pg-core";
import { media } from "./media";

// Groups Table: Represents a folder that can contain images and other groups.
export const groups = pgTable("groups", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  // eslint-disable-line @typescript-eslint/no-explicit-any
  parentId: integer("parent_id").references((): any => groups.id, {
    onDelete: "cascade",
  }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Drizzle Relations for enabling the Relational Query API
export const groupsRelations = relations(groups, ({ one, many }) => ({
  // A group can have one parent group
  parent: one(groups, {
    fields: [groups.parentId],
    references: [groups.id],
    relationName: "parent",
  }),
  // A group can have many child groups
  children: many(groups, {
    relationName: "parent",
  }),
  // A group can have many media
  media: many(media),
}));
