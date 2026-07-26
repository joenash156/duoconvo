export type TranslationSource = "model" | "llm_fallback";

export type TranslationResult = {
  id: string;
  timestamp: string;
  spokenLanguage: string;
  targetLanguage: string;
  originalText: string;
  sttText: string;
  translatedText: string;
  detectedIntent: string | null;
  similarityScore: number;
  source: TranslationSource;
  audioUrl: string | null;
};

export type ConversationEntry = TranslationResult;

export type TranslateTextInput = {
  text: string;
  spokenLanguage: string;
  targetLanguage: string;
};

export type TranslateAudioInput = {
  audioUri: string;
  spokenLanguage: string;
  targetLanguage: string;
};
