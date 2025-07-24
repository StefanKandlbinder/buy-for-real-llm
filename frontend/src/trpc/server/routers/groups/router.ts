import { z } from "zod";
import { protectedProcedure, router } from "@/trpc/server/trpc";
import { groups, media } from "@/db/schema";
import { eq, sql, inArray } from "drizzle-orm";
import { insertGroupSchema, updateGroupSchema } from "./validation";
import { pinata } from "@/lib/config";

// Helper to delete images from Pinata and return status
async function deleteImagesFromPinata(imageIds: string[]) {
  let result = null;
  let error = null;
  let message = null;
  let allSucceeded = true;
  if (imageIds.length > 0) {
    try {
      result = await pinata.files.public.delete(imageIds);
      if (Array.isArray(result)) {
        const failed = result.filter((res) => res.status !== "OK");
        if (failed.length > 0) {
          allSucceeded = false;
          message =
            "Some images could not be deleted from Pinata. Group was not deleted. Please try again or check your Pinata dashboard.";
        }
      }
    } catch (err) {
      error = err;
      allSucceeded = false;
      message =
        "Failed to delete images from Pinata. Group was not deleted. Please try again or check your Pinata dashboard.";
      console.error("Failed to delete images from Pinata", err);
    }
  }
  return { allSucceeded, result, error, message };
}

// Helper to recursively collect all child group IDs
async function getAllChildGroupIds(
  db: any,
  parentId: number
): Promise<number[]> {
  const directChildren = await db
    .select({ id: groups.id })
    .from(groups)
    .where(eq(groups.parentId, parentId));

  let allChildIds = directChildren.map((child: any) => child.id);

  // Recursively get children of children
  for (const child of directChildren) {
    const grandChildren = await getAllChildGroupIds(db, child.id);
    allChildIds = allChildIds.concat(grandChildren);
  }

  return allChildIds;
}

export type NestedGroup = {
  id: number;
  name: string;
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
            json_build_object('id', i.id, 'label', i.label, 'url', i.url, 'description', i.description)
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
