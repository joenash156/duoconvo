import { env } from "../configs/env";
import { MOCK_KNOWLEDGE_BASE } from "../data/mockKnowledgeBase";
import { AiMatch, AiRetrievalResult, ConfidenceDecision } from "../types/ai.types";

const TOP_K = 3;

function classifyDecision(confidence: number): ConfidenceDecision {
  if (confidence >= env.CONFIDENCE_HIGH_THRESHOLD) return "HIGH_CONFIDENCE";
  if (confidence >= env.CONFIDENCE_MEDIUM_THRESHOLD) return "MEDIUM_CONFIDENCE";
  return "LOW_CONFIDENCE";
}

/** Mirrors ai-engine/inference/confidence.py's formula: top*0.6 + gap*0.2 + intentAgreement*0.2. */
function computeConfidence(matches: AiMatch[]): number {
  const topScore = matches[0]?.score ?? 0;
  const secondScore = matches[1]?.score ?? 0;
  const scoreGap = Math.max(topScore - secondScore, 0);

  const topIntent = matches[0]?.intent;
  const agreementCount = matches.filter((match) => match.intent === topIntent).length;
  const intentAgreement = matches.length > 0 ? agreementCount / matches.length : 0;

  return topScore * 0.6 + scoreGap * 0.2 + intentAgreement * 0.2;
}

/**
 * Simulates the fine-tuned Sentence Transformer + FAISS pipeline
 * (ai-engine/inference/search.py + confidence.py) using naive keyword
 * overlap instead of real embeddings. Good enough to exercise the whole
 * translate -> confidence -> fallback pipeline end-to-end before the real
 * model is wired up.
 */
function retrieveFromMockEngine(text: string): AiRetrievalResult {
  const queryTokens = new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .split(/\s+/)
      .filter(Boolean),
  );

  const scored: AiMatch[] = MOCK_KNOWLEDGE_BASE.map((concept) => {
    const overlap = concept.keywords.filter((keyword) => queryTokens.has(keyword)).length;
    const score = overlap === 0 ? 0.05 : Math.min(0.95, 0.35 + overlap * 0.18);

    return {
      conceptCode: concept.conceptCode,
      intent: concept.intentName,
      score,
    };
  });

  const topMatches = scored.sort((a, b) => b.score - a.score).slice(0, TOP_K);
  const confidence = computeConfidence(topMatches);

  return {
    topMatches,
    confidence,
    decision: classifyDecision(confidence),
  };
}

/**
 * Expected contract for the future FastAPI wrapper around search.py/confidence.py:
 *
 *   POST {AI_ENGINE_URL}/predict
 *   body: { "text": string, "language": string }
 *   response: {
 *     "topMatches": [{ "conceptCode": string, "intent": string, "score": number }],
 *     "confidence": number,
 *     "decision": "HIGH_CONFIDENCE" | "MEDIUM_CONFIDENCE" | "LOW_CONFIDENCE"
 *   }
 */
async function retrieveFromHttpEngine(text: string, language: string): Promise<AiRetrievalResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), env.AI_ENGINE_TIMEOUT_MS);

  try {
    const response = await fetch(`${env.AI_ENGINE_URL}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, language }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`AI engine responded with status ${response.status}`);
    }

    return (await response.json()) as AiRetrievalResult;
  } finally {
    clearTimeout(timeout);
  }
}

export const aiService = {
  retrieve: (text: string, language: string): Promise<AiRetrievalResult> =>
    env.AI_PROVIDER === "http" ? retrieveFromHttpEngine(text, language) : Promise.resolve(retrieveFromMockEngine(text)),
};
