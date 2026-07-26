export type LanguageCode = "en" | "tw" | "ee" | "ga" | "fr";

export type Language = {
  code: LanguageCode;
  label: string;
};

export const LANGUAGES: Language[] = [
  { code: "en", label: "English" },
  { code: "tw", label: "Twi" },
  { code: "ee", label: "Ewe" },
  { code: "ga", label: "Ga" },
  { code: "fr", label: "French" },
];

export const getLanguageLabel = (code: LanguageCode) =>
  LANGUAGES.find((language) => language.code === code)?.label ?? code;
