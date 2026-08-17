export type ConfidenceBucket = "high" | "medium" | "low";

/** Mirrors mobile/src/types/evidence.types.ts's EvidenceSummary exactly. */
export type EvidenceSummary = {
  totalTranslations: number;
  modelSourcedCount: number;
  llmFallbackCount: number;
  averageSimilarityScore: number | null;
  averageResponseTimeMs: number | null;
  languagesUsed: number;
  byIntent: { intent: string; count: number }[];
  confidenceBuckets: { bucket: ConfidenceBucket; count: number }[];
};
