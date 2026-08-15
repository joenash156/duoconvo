export const LANGUAGE_CODES = ["en", "tw", "ga", "ee", "fr"] as const;

export type LanguageCode = (typeof LANGUAGE_CODES)[number];
