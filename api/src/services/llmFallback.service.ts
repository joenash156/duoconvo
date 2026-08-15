import { env } from "../configs/env";

/**
 * Invoked only when AI retrieval confidence is LOW_CONFIDENCE, or a matched
 * concept has no verified translation yet for the requested target language
 * (see ai-engine's idea.md section 2: the LLM is an approved fallback only,
 * never the primary translation engine).
 */
function translateMock(text: string, spokenLanguage: string, targetLanguage: string): string {
  return `[mock llm fallback ${spokenLanguage}->${targetLanguage}] ${text}`;
}

// Slot: `pnpm add openai`, set OPENAI_API_KEY and LLM_FALLBACK_PROVIDER=openai, then implement this.
async function translateWithOpenAi(_text: string, _spokenLanguage: string, _targetLanguage: string): Promise<string> {
  throw new Error(
    "LLM_FALLBACK_PROVIDER=openai is not implemented yet. Install the OpenAI SDK and implement translateWithOpenAi() in llmFallback.service.ts.",
  );
}

// Slot: `pnpm add @anthropic-ai/sdk`, set ANTHROPIC_API_KEY and LLM_FALLBACK_PROVIDER=anthropic, then implement this.
async function translateWithAnthropic(
  _text: string,
  _spokenLanguage: string,
  _targetLanguage: string,
): Promise<string> {
  throw new Error(
    "LLM_FALLBACK_PROVIDER=anthropic is not implemented yet. Install @anthropic-ai/sdk and implement translateWithAnthropic() in llmFallback.service.ts.",
  );
}

export const llmFallbackService = {
  translate: (text: string, spokenLanguage: string, targetLanguage: string): Promise<string> => {
    switch (env.LLM_FALLBACK_PROVIDER) {
      case "openai":
        return translateWithOpenAi(text, spokenLanguage, targetLanguage);
      case "anthropic":
        return translateWithAnthropic(text, spokenLanguage, targetLanguage);
      default:
        return Promise.resolve(translateMock(text, spokenLanguage, targetLanguage));
    }
  },
};
