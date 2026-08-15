/**
 * Shape produced by the AI retrieval step, whether it comes from the mock
 * keyword-matching provider or the real fine-tuned Sentence Transformer +
 * FAISS + confidence engine (ai-engine/inference/search.py + confidence.py).
 */

export type ConfidenceDecision = "HIGH_CONFIDENCE" | "MEDIUM_CONFIDENCE" | "LOW_CONFIDENCE";

export type AiMatch = {
  conceptCode: string;
  intent: string;
  score: number;
};

export type AiRetrievalResult = {
  topMatches: AiMatch[];
  confidence: number;
  decision: ConfidenceDecision;
};
