import { z } from "zod";
import { protectedProcedure, router } from "@/trpc/server/trpc";
import { products } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createProductSchema, updateProductSchema } from "./validation";
import { revalidatePath } from "next/cache";

export const productsRouter = router({
  createProduct: protectedProcedure
    .input(createProductSchema)
    .mutation(async ({ ctx, input }) => {
      const [newProduct] = await ctx.db
        .insert(products)
        .values({
          groupId: input.groupId,
          isActive: input.isActive ?? true,
        })
        .returning();

      // Revalidate affected admin product pages
      revalidatePath("/admin/products");
      revalidatePath("/admin/products/[...slug]");

      return newProduct;
    }),

  updateProduct: protectedProcedure
    .input(updateProductSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;
      const updateValues: {
        groupId?: number;
        isActive?: boolean;
      } = {};

      if (updateData.groupId !== undefined)
        updateValues.groupId = updateData.groupId;
      if (updateData.isActive !== undefined)
        updateValues.isActive = updateData.isActive;

      const [updatedProduct] = await ctx.db
        .update(products)
        .set({ ...updateValues, updatedAt: new Date() })
        .where(eq(products.id, id))
        .returning();

      // Revalidate affected admin product pages
      revalidatePath("/admin/products");
      revalidatePath("/admin/products/[...slug]");

      return updatedProduct;
    }),

  deleteProduct: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(products).where(eq(products.id, input.id));

      // Revalidate affected admin product pages
      revalidatePath("/admin/products");
      revalidatePath("/admin/products/[...slug]");

      return { success: true };
    }),

  getProductsByGroup: protectedProcedure
    .input(z.object({ groupId: z.number() }))
    .query(async ({ ctx, input }) => {
      const productsList = await ctx.db
        .select()
        .from(products)
        .where(eq(products.groupId, input.groupId));
      return productsList;
    }),

  getAllProducts: protectedProcedure.query(async ({ ctx }) => {
    const productsList = await ctx.db.select().from(products);
    return productsList;
  }),
});
