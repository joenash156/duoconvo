export type UnknownPhraseStatus = "pending" | "approved" | "rejected";

export type UnknownPhraseDto = {
  id: string;
  inputText: string;
  language: string;
  similarityScore: number | null;
  status: UnknownPhraseStatus;
  createdAt: string;
};
