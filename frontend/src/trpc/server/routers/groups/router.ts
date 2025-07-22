import { z } from "zod";
import { protectedProcedure, router } from "@/trpc/server/trpc";
import { groups, media } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { insertGroupSchema, updateGroupSchema } from "./validation";

export type NestedGroup = {
  id: number;
  name: string;
  parent_id: number | null;
  level: number;
  path: string;
  media: Array<{ id: string; label: string; url: string }>;
};

export const groupsRouter = router({
  getNestedGroups: protectedProcedure.query(async ({ ctx }) => {
    // This query uses a recursive Common Table Expression (CTE) to fetch
    // the entire hierarchy of groups and their associated images.
    const query = sql`
      WITH RECURSIVE group_hierarchy AS (
        -- Anchor member: select root groups (those with no parent)
        SELECT 
          g.id, g.name, g.parent_id, g.created_at, g.updated_at, 0 as level,
          CAST(g.id AS VARCHAR) as path
        FROM ${groups} g
        WHERE g.parent_id IS NULL

        UNION ALL

        -- Recursive member: select child groups
        SELECT 
          g.id, g.name, g.parent_id, g.created_at, g.updated_at, gh.level + 1,
          gh.path || '->' || CAST(g.id AS VARCHAR)
        FROM ${groups} g
        JOIN group_hierarchy gh ON g.parent_id = gh.id
      )
      SELECT 
        gh.id, gh.name, gh.parent_id, gh.level, gh.path,
        COALESCE(
          json_agg(
            json_build_object('id', i.id, 'label', i.label, 'url', i.url)
          ) FILTER (WHERE i.id IS NOT NULL),
          '[]'::json
        ) as media
      FROM group_hierarchy gh
      LEFT JOIN ${media} i ON gh.id = i.group_id
      GROUP BY gh.id, gh.name, gh.parent_id, gh.level, gh.path
      ORDER BY gh.path;
    `;

    const result = await ctx.db.execute<NestedGroup>(query);
    return result.rows as NestedGroup[];
  }),

  createGroup: protectedProcedure
    .input(insertGroupSchema)
    .mutation(async ({ ctx, input }) => {
      const [newGroup] = await ctx.db
        .insert(groups)
        .values({
          name: input.name,
          parentId: input.parentId ?? null,
        })
        .returning();
      return newGroup;
    }),

  updateGroup: protectedProcedure
    .input(updateGroupSchema)
    .mutation(async ({ ctx, input }) => {
      const [updatedGroup] = await ctx.db
        .update(groups)
        .set({ name: input.name, updatedAt: new Date() })
        .where(eq(groups.id, input.id))
        .returning();
      return updatedGroup;
    }),

  deleteGroup: protectedProcedure
    .input(z.object({ id: z.int() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(groups).where(eq(groups.id, input.id));
      return { success: true };
    }),
});
