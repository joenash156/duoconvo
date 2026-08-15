import { MarketPhrase } from "../db/schema";
import { LanguageCode } from "../types/language.types";

const FIELD_BY_LANGUAGE: Record<LanguageCode, keyof MarketPhrase> = {
  en: "englishText",
  tw: "twiText",
  ga: "gaText",
  ee: "eweText",
  fr: "frenchText",
};

/** Returns the verified translation for a language, or null if not filled in yet. */
export function getTranslatedField(phrase: MarketPhrase, language: string): string | null {
  const field = FIELD_BY_LANGUAGE[language as LanguageCode];
  if (!field) return null;

  const value = phrase[field];
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}
