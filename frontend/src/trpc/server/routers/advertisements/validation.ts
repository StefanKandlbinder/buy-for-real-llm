import { z } from "zod";

export const createAdvertisementSchema = z.object({
  groupId: z.number().positive("Group ID is required"),
  isActive: z.boolean().optional(),
});

export const updateAdvertisementSchema = z.object({
  id: z.number().positive("Advertisement ID is required"),
  groupId: z.number().positive("Group ID is required").optional(),
  isActive: z.boolean().optional(),
});
