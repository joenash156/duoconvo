import { z } from "zod";
import { languageCodeSchema } from "./translation.validators";

export const ttsRequestSchema = z.object({
  text: z.string().trim().min(1).max(1000),
  language: languageCodeSchema,
});
