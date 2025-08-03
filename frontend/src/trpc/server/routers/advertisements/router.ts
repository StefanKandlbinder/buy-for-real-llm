import { z } from "zod";
import { protectedProcedure, router } from "@/trpc/server/trpc";
import { advertisements } from "@/db/schema";
import { eq } from "drizzle-orm";
import {
  createAdvertisementSchema,
  updateAdvertisementSchema,
} from "./validation";

export const advertisementsRouter = router({
  createAdvertisement: protectedProcedure
    .input(createAdvertisementSchema)
    .mutation(async ({ ctx, input }) => {
      const [newAdvertisement] = await ctx.db
        .insert(advertisements)
        .values({
          groupId: input.groupId,
          isActive: input.isActive ?? true,
        })
        .returning();
      return newAdvertisement;
    }),

  updateAdvertisement: protectedProcedure
    .input(updateAdvertisementSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;
      const updateValues: {
        groupId?: number;
        isActive?: boolean;
      } = {};

      // Manually assign each field to avoid type issues
      if (updateData.groupId !== undefined)
        updateValues.groupId = updateData.groupId;
      if (updateData.isActive !== undefined)
        updateValues.isActive = updateData.isActive;

      const [updatedAdvertisement] = await ctx.db
        .update(advertisements)
        .set({ ...updateValues, updatedAt: new Date() })
        .where(eq(advertisements.id, id))
        .returning();
      return updatedAdvertisement;
    }),

  deleteAdvertisement: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(advertisements)
        .where(eq(advertisements.id, input.id));
      return { success: true };
    }),

  getAdvertisementsByGroup: protectedProcedure
    .input(z.object({ groupId: z.number() }))
    .query(async ({ ctx, input }) => {
      const advertisementsList = await ctx.db
        .select()
        .from(advertisements)
        .where(eq(advertisements.groupId, input.groupId));
      return advertisementsList;
    }),

  getAllAdvertisements: protectedProcedure.query(async ({ ctx }) => {
    const advertisementsList = await ctx.db.select().from(advertisements);
    return advertisementsList;
  }),
});
