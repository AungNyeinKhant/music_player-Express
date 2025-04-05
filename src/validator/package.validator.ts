import { z } from "zod";

export const createPackageSchema = z.object({
  name: z.string().trim().min(1).max(255),
  description: z.string().trim().min(1).max(255).optional(),
  num_of_days: z.number().positive(),
  price: z.number().positive().multipleOf(0.01),
});

export const confirmPurchaseSchema = z.object({
  purchase_id: z.string().trim().min(1),
});
