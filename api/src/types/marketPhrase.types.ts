export type MarketPhraseDto = {
  id: string;
  conceptCode: string;
  englishText: string;
  twiText: string | null;
  gaText: string | null;
  eweText: string | null;
  frenchText: string | null;
  intentId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateMarketPhraseInput = {
  conceptCode: string;
  englishText: string;
  twiText?: string;
  gaText?: string;
  eweText?: string;
  frenchText?: string;
  intentId: string;
  isActive?: boolean;
};

export type UpdateMarketPhraseInput = Partial<CreateMarketPhraseInput>;
