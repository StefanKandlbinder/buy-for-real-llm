import { z } from "zod";
import { protectedProcedure, router } from "../../trpc";
import { media } from "@/db/schema";
import { eq } from "drizzle-orm";

import { insertMediaSchema, updateMediaSchema } from "./validation";

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
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(media).where(eq(media.id, input.id));
      return { success: true };
    }),
});
