import { z } from "zod";
import { paginationQuerySchema } from "./pagination.validators";

const unknownPhraseStatusSchema = z.enum(["pending", "approved", "rejected"]);

export const listUnknownPhrasesQuerySchema = paginationQuerySchema.extend({
  status: unknownPhraseStatusSchema.optional(),
});

export const updateUnknownPhraseStatusSchema = z.object({
  status: unknownPhraseStatusSchema,
});

export const unknownPhraseIdParamSchema = z.object({
  id: z.uuid(),
});
