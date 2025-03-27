import { z } from "zod";

export const createPackageSchema = z.object({
  name: z.string().trim().min(1).max(255),
  description: z.string().trim().min(1).max(255).optional(),
  num_of_days: z.string().trim().min(1).max(255),
  price: z.string().trim().min(1).max(255),
});
