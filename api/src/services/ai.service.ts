import { env } from "../configs/env";
import { AiRetrievalResult } from "../types/ai.types";

/**
 * Calls the real semantic retrieval pipeline - fine-tuned Sentence
 * Transformer + FAISS + confidence engine, wrapped in
 * ai-engine/app/ai_server.py. No mock fallback: the whole point of the app
 * is genuine semantic matching, so a misconfigured/unreachable AI engine
 * should surface as a real error, not silently degrade to fake data.
 *
 *   POST {AI_ENGINE_URL}/predict
 *   body: { "text": string, "language": string }
 *   response: {
 *     "topMatches": [{ "conceptCode": string, "intent": string, "score": number }],
 *     "confidence": number,
 *     "decision": "HIGH_CONFIDENCE" | "MEDIUM_CONFIDENCE" | "LOW_CONFIDENCE"
 *   }
 */
async function retrieve(text: string, language: string): Promise<AiRetrievalResult> {
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

export const aiService = { retrieve };
