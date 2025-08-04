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
  id: varchar("id", { length: 128 }).primaryKey(),
  groupId: integer("group_id")
    .references(() => groups.id, { onDelete: "cascade" })
    .notNull(),
  label: varchar({ length: 128 }),
  url: text("url").notNull(),
  description: varchar({ length: 255 }),
  mediaType: varchar("media_type", { length: 20 }).notNull().default("image"), // "image" or "video"
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

export const mediaSelectSchema = createSelectSchema(media);
export const mediaInsertSchema = createInsertSchema(media);
export const mediaUpdateSchema = createUpdateSchema(media);
