import { z } from "zod";

export const createProductSchema = z.object({
  groupId: z.number().positive("Group ID is required"),
  isActive: z.boolean().optional(),
});

export const updateProductSchema = z.object({
  id: z.number().positive("Product ID is required"),
  groupId: z.number().positive("Group ID is required").optional(),
  isActive: z.boolean().optional(),
});
