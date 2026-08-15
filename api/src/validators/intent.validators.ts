import { z } from "zod";

export const createIntentSchema = z.object({
  name: z.string().trim().min(1).max(100),
  description: z.string().trim().optional(),
});

export const updateIntentSchema = createIntentSchema.partial();

export const intentIdParamSchema = z.object({
  id: z.uuid(),
});
