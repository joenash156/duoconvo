import { UnknownPhrase, UnknownPhraseStatusValue } from "../db/schema";
import { unknownPhraseRepository } from "../repositories/unknownPhrase.repository";
import { PaginatedResponse } from "../types/pagination.types";
import { UnknownPhraseDto } from "../types/unknownPhrase.types";

function toDto(phrase: UnknownPhrase): UnknownPhraseDto {
  return {
    id: phrase.id,
    inputText: phrase.inputText,
    language: phrase.language,
    similarityScore: phrase.similarityScore,
    status: phrase.status,
    createdAt: phrase.createdAt.toISOString(),
  };
}

export const unknownPhraseService = {
  /** Logs a low-confidence input for later human review and possible retraining. */
  record: (input: { inputText: string; language: string; similarityScore: number }) =>
    unknownPhraseRepository.create({
      inputText: input.inputText,
      language: input.language,
      similarityScore: input.similarityScore,
      status: "pending",
    }),

  list: async (
    page: number,
    limit: number,
    status?: UnknownPhraseStatusValue,
  ): Promise<PaginatedResponse<UnknownPhraseDto>> => {
    const { items, total } = await unknownPhraseRepository.list(page, limit, status);

    return {
      items: items.map(toDto),
      page,
      limit,
      total,
      hasMore: page * limit < total,
    };
  },

  updateStatus: async (id: string, status: UnknownPhraseStatusValue): Promise<UnknownPhraseDto | null> => {
    const updated = await unknownPhraseRepository.updateStatus(id, status);
    return updated ? toDto(updated) : null;
  },
};
