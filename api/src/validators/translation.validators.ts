import { z } from "zod";
import { LANGUAGE_CODES } from "../types/language.types";

export const languageCodeSchema = z.enum(LANGUAGE_CODES);

export const translateTextSchema = z.object({
  text: z.string().trim().min(1).max(500),
  spokenLanguage: languageCodeSchema,
  targetLanguage: languageCodeSchema,
});

/** Validated separately in the controller since multer must populate req.body first. */
export const translateAudioFieldsSchema = z.object({
  spokenLanguage: languageCodeSchema,
  targetLanguage: languageCodeSchema,
});
