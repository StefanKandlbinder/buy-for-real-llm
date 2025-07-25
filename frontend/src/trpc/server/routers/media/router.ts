import { z } from "zod";
import { protectedProcedure, router } from "../../trpc";
import { media } from "@/db/schema";
import { eq } from "drizzle-orm";

import { insertMediaSchema, updateMediaSchema } from "./validation";
import { pinata } from "@/lib/config";

// Helper to delete images from Pinata and return status
export async function deleteImagesFromPinata(imageIds: string[]) {
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

export const mediaRouter = router({
  // Procedure to create an image record in the database after upload
  createImage: protectedProcedure
    .input(insertMediaSchema)
    .mutation(async ({ ctx, input }) => {
      const [newImage] = await ctx.db
        .insert(media)
        .values({
          ...input,
        })
        .returning();
      return newImage;
    }),

  // Procedure to update an image's name
  updateImage: protectedProcedure
    .input(updateMediaSchema)
    .mutation(async ({ ctx, input }) => {
      const [updatedImage] = await ctx.db
        .update(media)
        .set({ ...input, updatedAt: new Date() })
        .where(eq(media.id, input.id))
        .returning();
      return updatedImage;
    }),

  // Procedure to delete an image record
  deleteImage: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(media).where(eq(media.id, input.id));
      return { success: true };
    }),

  // Procedure to get all images in a group
  getImagesByGroup: protectedProcedure
    .input(z.object({ groupId: z.number() }))
    .query(async ({ ctx, input }) => {
      const images = await ctx.db
        .select()
        .from(media)
        .where(eq(media.groupId, input.groupId));
      return images;
    }),
});
