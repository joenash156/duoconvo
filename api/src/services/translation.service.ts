import { marketPhraseRepository } from "../repositories/marketPhrase.repository";
import { AiMatch } from "../types/ai.types";
import { TranslateAudioInput, TranslateTextInput, TranslationResult, TranslationSource } from "../types/translation.types";
import { getTranslatedField } from "../utils/language";
import { aiService } from "./ai.service";
import { conversationLogService } from "./conversationLog.service";
import { llmFallbackService } from "./llmFallback.service";
import { sttService } from "./stt.service";
import { ttsService } from "./tts.service";
import { unknownPhraseService } from "./unknownPhrase.service";

type ResolveParams = {
  originalText: string;
  sttText: string;
  spokenLanguage: string;
  targetLanguage: string;
  startedAt: number;
};

/**
 * Core pipeline shared by both translate endpoints:
 * text -> AI retrieval -> confidence decision -> knowledge base lookup
 * -> (LLM fallback if needed) -> TTS -> conversation log.
 *
 * Mirrors idea.md's runtime pipeline: the AI model does the semantic
 * matching first, and the LLM is only used when confidence is genuinely
 * low or the matched concept has no verified translation yet.
 */
async function resolveTranslation(params: ResolveParams): Promise<TranslationResult> {
  const { originalText, sttText, spokenLanguage, targetLanguage, startedAt } = params;

  const aiResult = await aiService.retrieve(sttText, spokenLanguage);
  const best: AiMatch | undefined = aiResult.topMatches[0];

  let translatedText: string | null = null;
  let source: TranslationSource = "llm_fallback";
  let detectedIntent: string | null = null;
  let predictedPhraseId: string | null = null;

  if (aiResult.decision !== "LOW_CONFIDENCE" && best) {
    const phrase = await marketPhraseRepository.findByConceptCode(best.conceptCode);
    const candidate = phrase ? getTranslatedField(phrase, targetLanguage) : null;

    detectedIntent = best.intent;

    if (phrase && candidate) {
      translatedText = candidate;
      source = "model";
      predictedPhraseId = phrase.id;
    }
  }

  if (translatedText === null) {
    // Either the AI wasn't confident, or the matched concept has no
    // verified translation stored yet for the requested target language.
    translatedText = await llmFallbackService.translate(sttText, spokenLanguage, targetLanguage);
    source = "llm_fallback";

    if (aiResult.decision === "LOW_CONFIDENCE") {
      await unknownPhraseService.record({
        inputText: sttText,
        language: spokenLanguage,
        similarityScore: best?.score ?? 0,
      });
    }
  }

  const audioUrl = await ttsService.synthesize(translatedText, targetLanguage);
  const responseTimeMs = Date.now() - startedAt;

  return conversationLogService.create({
    inputText: originalText,
    speechToTextOutput: sttText,
    predictedPhraseId,
    similarityScore: best?.score ?? 0,
    translationSource: source,
    responseTimeMs,
    spokenLanguage,
    targetLanguage,
    translatedText,
    detectedIntent,
    audioUrl,
  });
}

export const translationService = {
  translateText: (input: TranslateTextInput): Promise<TranslationResult> =>
    resolveTranslation({
      originalText: input.text,
      sttText: input.text,
      spokenLanguage: input.spokenLanguage,
      targetLanguage: input.targetLanguage,
      startedAt: Date.now(),
    }),

  translateAudio: async (input: TranslateAudioInput): Promise<TranslationResult> => {
    const startedAt = Date.now();
    const sttText = await sttService.transcribe(input.audioBuffer, input.spokenLanguage);

    return resolveTranslation({
      originalText: "(voice input)",
      sttText,
      spokenLanguage: input.spokenLanguage,
      targetLanguage: input.targetLanguage,
      startedAt,
    });
  },
};
