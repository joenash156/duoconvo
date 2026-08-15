import { apiClient } from "@/services/apiClient";
import { PaginatedResponse } from "@/types/api.types";
import {
  ConversationEntry,
  TranslateAudioInput,
  TranslateTextInput,
  TranslationResult,
} from "@/types/conversation.types";

export const translationService = {
  translateText: (input: TranslateTextInput) =>
    apiClient.post<TranslationResult>("/translate/text", input),

  translateAudio: ({ audioUri, spokenLanguage, targetLanguage }: TranslateAudioInput) => {
    const formData = new FormData();
    formData.append("spokenLanguage", spokenLanguage);
    formData.append("targetLanguage", targetLanguage);
    formData.append("audio", {
      uri: audioUri,
      name: "recording.m4a",
      type: "audio/m4a",
    } as unknown as Blob);

    return apiClient.postFormData<TranslationResult>("/translate/audio", formData);
  },

  getHistory: (page: number, limit = 20) =>
    apiClient.get<PaginatedResponse<ConversationEntry>>(
      `/conversations?page=${page}&limit=${limit}`,
    ),

  getAiEvidence: (page: number, limit = 20) =>
    apiClient.get<PaginatedResponse<ConversationEntry>>(
      `/evidence?page=${page}&limit=${limit}`,
    ),
};
