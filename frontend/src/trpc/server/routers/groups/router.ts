import { z } from "zod";
import { protectedProcedure, router } from "@/trpc/server/trpc";
import { groups, media, advertisements, products } from "@/db/schema";
import { eq, sql, inArray } from "drizzle-orm";
import {
  insertGroupSchema,
  updateGroupSchema,
  generateSlug,
} from "./validation";
import { Context } from "@/trpc/server/context";
import { deleteImagesFromPinata } from "../media/router";
import { revalidatePath } from "next/cache";

// Helper to recursively collect all child group IDs
async function getAllChildGroupIds(
  db: Context["db"],
  parentId: number
): Promise<number[]> {
  const query = sql`
    WITH RECURSIVE descendant_groups AS (
      -- Start with the direct children of the given parent
      SELECT id
      FROM ${groups}
      WHERE parent_id = ${parentId}

      UNION ALL

      -- Recursively find children of the groups found above
      SELECT g.id
      FROM ${groups} g
      JOIN descendant_groups dg ON g.parent_id = dg.id
    )
    SELECT id FROM descendant_groups;
  `;

  const result = await db.execute<{ id: number }>(query);
  return result.rows.map((row) => row.id);
}

export type NestedGroup = {
  id: number;
  name: string;
  slug: string;
  parent_id: number | null;
  level: number;
  path: string;
  media: Array<{ id: string; label: string; url: string; description: string }>;
};

export const groupsRouter = router({
  getNestedGroups: protectedProcedure.query(async ({ ctx }) => {
    // This query uses a recursive Common Table Expression (CTE) to fetch
    // the entire hierarchy of groups and their associated images.
    const query = sql`
      WITH RECURSIVE group_hierarchy AS (
        -- Anchor member: select root groups (those with no parent)
        SELECT 
          g.id, g.name, g.slug, g.parent_id, g.created_at, g.updated_at, 0 as level,
          CAST(g.id AS VARCHAR) as path
        FROM ${groups} g
        WHERE g.parent_id IS NULL

        UNION ALL

        -- Recursive member: select child groups
        SELECT 
          g.id, g.name, g.slug, g.parent_id, g.created_at, g.updated_at, gh.level + 1,
          gh.path || '->' || CAST(g.id AS VARCHAR)
        FROM ${groups} g
        JOIN group_hierarchy gh ON g.parent_id = gh.id
      )
      SELECT 
        gh.id, gh.name, gh.slug, gh.parent_id, gh.level, gh.path,
        COALESCE(
          json_agg(
            json_build_object('id', i.id, 'label', i.label, 'url', i.url, 'description', i.description)
          ) FILTER (WHERE i.id IS NOT NULL),
          '[]'::json
        ) as media
      FROM group_hierarchy gh
      LEFT JOIN ${media} i ON gh.id = i.group_id
      GROUP BY gh.id, gh.name, gh.slug, gh.parent_id, gh.level, gh.path
      ORDER BY gh.path;
    `;

    const result = await ctx.db.execute<NestedGroup>(query);
    return result.rows as NestedGroup[];
  }),

  getGroupsWithAdvertisements: protectedProcedure.query(async ({ ctx }) => {
    const query = sql`
      WITH RECURSIVE group_hierarchy AS (
        -- Anchor member: select root groups that have advertisements
        SELECT 
          g.id, g.name, g.slug, g.parent_id, g.created_at, g.updated_at, 0 as level,
          CAST(g.id AS VARCHAR) as path
        FROM ${groups} g
        WHERE g.parent_id IS NULL
        AND EXISTS (SELECT 1 FROM ${advertisements} a WHERE a.group_id = g.id)

        UNION ALL

        -- Recursive member: select child groups that have advertisements
        SELECT 
          g.id, g.name, g.slug, g.parent_id, g.created_at, g.updated_at, gh.level + 1,
          gh.path || '->' || CAST(g.id AS VARCHAR)
        FROM ${groups} g
        JOIN group_hierarchy gh ON g.parent_id = gh.id
        WHERE EXISTS (SELECT 1 FROM ${advertisements} a WHERE a.group_id = g.id)
      )
      SELECT 
        gh.id, gh.name, gh.slug, gh.parent_id, gh.level, gh.path,
        COALESCE(
          json_agg(
            json_build_object('id', i.id, 'label', i.label, 'url', i.url, 'description', i.description)
          ) FILTER (WHERE i.id IS NOT NULL),
          '[]'::json
        ) as media
      FROM group_hierarchy gh
      LEFT JOIN ${media} i ON gh.id = i.group_id
      GROUP BY gh.id, gh.name, gh.slug, gh.parent_id, gh.level, gh.path
      ORDER BY gh.path;
    `;

    const result = await ctx.db.execute<NestedGroup>(query);
    return result.rows as NestedGroup[];
  }),

  getGroupsWithProducts: protectedProcedure.query(async ({ ctx }) => {
    const query = sql`
      WITH RECURSIVE group_hierarchy AS (
        -- Anchor member: select root groups that have products
        SELECT 
          g.id, g.name, g.slug, g.parent_id, g.created_at, g.updated_at, 0 as level,
          CAST(g.id AS VARCHAR) as path
        FROM ${groups} g
        WHERE g.parent_id IS NULL
        AND EXISTS (SELECT 1 FROM ${products} p WHERE p.group_id = g.id)

        UNION ALL

        -- Recursive member: select child groups that have products
        SELECT 
          g.id, g.name, g.slug, g.parent_id, g.created_at, g.updated_at, gh.level + 1,
          gh.path || '->' || CAST(g.id AS VARCHAR)
        FROM ${groups} g
        JOIN group_hierarchy gh ON g.parent_id = gh.id
        WHERE EXISTS (SELECT 1 FROM ${products} p WHERE p.group_id = g.id)
      )
      SELECT 
        gh.id, gh.name, gh.slug, gh.parent_id, gh.level, gh.path,
        COALESCE(
          json_agg(
            json_build_object('id', i.id, 'label', i.label, 'url', i.url, 'description', i.description)
          ) FILTER (WHERE i.id IS NOT NULL),
          '[]'::json
        ) as media
      FROM group_hierarchy gh
      LEFT JOIN ${media} i ON gh.id = i.group_id
      GROUP BY gh.id, gh.name, gh.slug, gh.parent_id, gh.level, gh.path
      ORDER BY gh.path;
    `;

    const result = await ctx.db.execute<NestedGroup>(query);
    return result.rows as NestedGroup[];
  }),

  createGroup: protectedProcedure
    .input(insertGroupSchema)
    .mutation(async ({ ctx, input }) => {
      const slug = input.slug || generateSlug(input.name);
      const [newGroup] = await ctx.db
        .insert(groups)
        .values({
          name: input.name,
          slug: slug,
          parentId: input.parentId ?? null,
        })
        .returning();

      // Revalidate admin layout and dependent pages (sidebar/breadcrumb + lists)
      revalidatePath("/admin");
      revalidatePath("/admin/products");
      revalidatePath("/admin/advertisements");

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

      // Revalidate admin layout and dependent pages
      revalidatePath("/admin");
      revalidatePath("/admin/products");
      revalidatePath("/admin/advertisements");

      return updatedGroup;
    }),

  deleteGroup: protectedProcedure
    .input(z.object({ id: z.int() }))
    .mutation(async ({ ctx, input }) => {
      // Get all child group IDs recursively
      const childGroupIds = await getAllChildGroupIds(ctx.db, input.id);

      // Include the main group ID and all child group IDs
      const allGroupIds = [input.id, ...childGroupIds];

      // Fetch all media IDs from the main group and all child groups
      const images = await ctx.db
        .select({ id: media.id })
        .from(media)
        .where(inArray(media.groupId, allGroupIds));

      const imageIds = images.map((img) => img.id);
      const pinataDelete = await deleteImagesFromPinata(imageIds);

      if (!pinataDelete.allSucceeded) {
        return {
          success: false,
          pinataDeleteResult: pinataDelete.result,
          pinataDeleteError: pinataDelete.error
            ? String(pinataDelete.error)
            : null,
          message: pinataDelete.message,
        };
      }

      // Only delete the parent group if all Pinata deletions succeeded
      // Database cascade will handle deleting child groups and their media
      await ctx.db.delete(groups).where(eq(groups.id, input.id));

      // Revalidate admin layout and dependent pages
      revalidatePath("/admin");
      revalidatePath("/admin/products");
      revalidatePath("/admin/advertisements");

      return {
        success: true,
        pinataDeleteResult: pinataDelete.result,
        pinataDeleteError: null,
        message: null,
        deletedGroupsCount: allGroupIds.length,
        deletedImagesCount: imageIds.length,
      };
    }),
});
