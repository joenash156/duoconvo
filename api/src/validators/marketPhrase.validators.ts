import { z } from "zod";
import { paginationQuerySchema } from "./pagination.validators";

export const listMarketPhrasesQuerySchema = paginationQuerySchema.extend({
  intentId: z.uuid().optional(),
});

export const createMarketPhraseSchema = z.object({
  conceptCode: z.string().trim().min(1).max(50),
  englishText: z.string().trim().min(1),
  twiText: z.string().trim().optional(),
  gaText: z.string().trim().optional(),
  eweText: z.string().trim().optional(),
  frenchText: z.string().trim().optional(),
  intentId: z.uuid(),
  isActive: z.boolean().optional(),
});

export const updateMarketPhraseSchema = createMarketPhraseSchema.partial();

export const marketPhraseIdParamSchema = z.object({
  id: z.uuid(),
});
