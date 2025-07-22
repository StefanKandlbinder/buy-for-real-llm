import {
  integer,
  pgTable,
  varchar,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { groups } from "./group";
import { relations } from "drizzle-orm";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";

export const media = pgTable("media", {
  id: varchar({ length: 128 }).notNull().primaryKey(),
  groupId: integer("group_id")
    .references(() => groups.id, { onDelete: "cascade" })
    .notNull(),
  label: varchar({ length: 128 }).notNull(),
  url: text("url").notNull(),
  description: varchar({ length: 255 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const mediaRelations = relations(media, ({ one }) => ({
  // A media belongs to one group
  group: one(groups, {
    fields: [media.groupId],
    references: [groups.id],
  }),
}));

export const mediaelectSchema = createSelectSchema(media);
export const imageInsertSchema = createInsertSchema(media);
export const imageUpdateSchema = createUpdateSchema(media);
