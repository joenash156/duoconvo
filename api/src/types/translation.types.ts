/**
 * Mirrors mobile/src/types/conversation.types.ts exactly. The mobile app's
 * apiClient returns response bodies as-is (no {success,data} wrapper), so
 * every field here must match the frontend type verbatim.
 */

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

export type TranslateTextInput = {
  text: string;
  spokenLanguage: string;
  targetLanguage: string;
};

export type TranslateAudioInput = {
  audioBuffer: Buffer;
  mimeType: string;
  spokenLanguage: string;
  targetLanguage: string;
};
