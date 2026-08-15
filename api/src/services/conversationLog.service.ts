import { ConversationLog, NewConversationLog } from "../db/schema";
import { conversationLogRepository } from "../repositories/conversationLog.repository";
import { PaginatedResponse } from "../types/pagination.types";
import { TranslationResult } from "../types/translation.types";

function toTranslationResult(log: ConversationLog): TranslationResult {
  return {
    id: log.id,
    timestamp: log.createdAt.toISOString(),
    spokenLanguage: log.spokenLanguage,
    targetLanguage: log.targetLanguage,
    originalText: log.inputText,
    sttText: log.speechToTextOutput ?? "",
    translatedText: log.translatedText ?? "",
    detectedIntent: log.detectedIntent,
    similarityScore: log.similarityScore ?? 0,
    source: log.translationSource,
    audioUrl: log.audioUrl,
  };
}

export const conversationLogService = {
  create: async (data: Omit<NewConversationLog, "id">): Promise<TranslationResult> => {
    const log = await conversationLogRepository.create(data);
    return toTranslationResult(log);
  },

  list: async (page: number, limit: number): Promise<PaginatedResponse<TranslationResult>> => {
    const { items, total } = await conversationLogRepository.list(page, limit);

    return {
      items: items.map(toTranslationResult),
      page,
      limit,
      total,
      hasMore: page * limit < total,
    };
  },
};
