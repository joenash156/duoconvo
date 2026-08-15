import { MarketPhrase } from "../db/schema";
import { intentRepository } from "../repositories/intent.repository";
import { marketPhraseRepository } from "../repositories/marketPhrase.repository";
import { CreateMarketPhraseInput, MarketPhraseDto, UpdateMarketPhraseInput } from "../types/marketPhrase.types";
import { PaginatedResponse } from "../types/pagination.types";
import { ApiError } from "../utils/ApiError";

function toDto(phrase: MarketPhrase): MarketPhraseDto {
  return {
    id: phrase.id,
    conceptCode: phrase.conceptCode,
    englishText: phrase.englishText,
    twiText: phrase.twiText,
    gaText: phrase.gaText,
    eweText: phrase.eweText,
    frenchText: phrase.frenchText,
    intentId: phrase.intentId,
    isActive: phrase.isActive,
    createdAt: phrase.createdAt.toISOString(),
    updatedAt: phrase.updatedAt.toISOString(),
  };
}

export const marketPhraseService = {
  list: async (page: number, limit: number, intentId?: string): Promise<PaginatedResponse<MarketPhraseDto>> => {
    const { items, total } = await marketPhraseRepository.list(page, limit, intentId);

    return {
      items: items.map(toDto),
      page,
      limit,
      total,
      hasMore: page * limit < total,
    };
  },

  getById: async (id: string): Promise<MarketPhraseDto> => {
    const phrase = await marketPhraseRepository.findById(id);
    if (!phrase) throw new ApiError(404, `Market phrase ${id} not found`);
    return toDto(phrase);
  },

  create: async (input: CreateMarketPhraseInput): Promise<MarketPhraseDto> => {
    const intent = await intentRepository.findById(input.intentId);
    if (!intent) throw new ApiError(400, `Intent ${input.intentId} does not exist`);

    const created = await marketPhraseRepository.create(input);
    if (!created) throw new ApiError(500, "Failed to create market phrase");
    return toDto(created);
  },

  update: async (id: string, input: UpdateMarketPhraseInput): Promise<MarketPhraseDto> => {
    await marketPhraseService.getById(id);

    if (input.intentId) {
      const intent = await intentRepository.findById(input.intentId);
      if (!intent) throw new ApiError(400, `Intent ${input.intentId} does not exist`);
    }

    const updated = await marketPhraseRepository.update(id, input);
    if (!updated) throw new ApiError(500, "Failed to update market phrase");
    return toDto(updated);
  },

  remove: async (id: string): Promise<void> => {
    await marketPhraseService.getById(id);
    await marketPhraseRepository.remove(id);
  },
};
