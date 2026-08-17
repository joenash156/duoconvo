import OpenAI from "openai";
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

const LANGUAGE_NAMES: Record<string, string> = {
  en: "English",
  tw: "Twi",
  ga: "Ga",
  ee: "Ewe",
  fr: "French",
};

const TRANSLATION_SYSTEM_PROMPT =
  "You translate short, everyday phrases spoken in Ghanaian markets and casual conversation " +
  "(greetings, price negotiation, small talk) between English, Twi, Ga, Ewe, and French. Translate " +
  "the way a fluent local speaker would naturally say it, not a stiff word-for-word translation. " +
  "Reply with ONLY the translated phrase - no quotation marks, no explanations, no alternates.";

async function translateWithChatCompletion(
  client: OpenAI,
  model: string,
  text: string,
  spokenLanguage: string,
  targetLanguage: string,
): Promise<string> {
  const sourceLabel = LANGUAGE_NAMES[spokenLanguage] ?? spokenLanguage;
  const targetLabel = LANGUAGE_NAMES[targetLanguage] ?? targetLanguage;

  const response = await client.chat.completions.create({
    model,
    temperature: 0.2,
    messages: [
      { role: "system", content: TRANSLATION_SYSTEM_PROMPT },
      { role: "user", content: `Translate this ${sourceLabel} phrase into ${targetLabel}:\n\n${text}` },
    ],
  });

  const translated = response.choices[0]?.message?.content?.trim();
  if (!translated) {
    throw new Error(`${model} returned an empty translation.`);
  }
  return translated;
}

let openAiClient: OpenAI | null = null;

function getOpenAiClient(): OpenAI {
  if (!env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not set. Set it in .env to use LLM_FALLBACK_PROVIDER=openai.");
  }
  openAiClient ??= new OpenAI({ apiKey: env.OPENAI_API_KEY });
  return openAiClient;
}

async function translateWithOpenAi(text: string, spokenLanguage: string, targetLanguage: string): Promise<string> {
  return translateWithChatCompletion(getOpenAiClient(), env.OPENAI_MODEL, text, spokenLanguage, targetLanguage);
}

let groqClient: OpenAI | null = null;

function getGroqClient(): OpenAI {
  if (!env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not set. Set it in .env to use LLM_FALLBACK_PROVIDER=groq.");
  }

groqClient ??= new OpenAI({ apiKey: env.GROQ_API_KEY, baseURL: "https://api.groq.com/openai/v1" });
  return groqClient;
}

async function translateWithGroq(text: string, spokenLanguage: string, targetLanguage: string): Promise<string> {
  return translateWithChatCompletion(getGroqClient(), env.GROQ_LLM_MODEL, text, spokenLanguage, targetLanguage);
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
      case "groq":
        return translateWithGroq(text, spokenLanguage, targetLanguage);
      case "openai":
        return translateWithOpenAi(text, spokenLanguage, targetLanguage);
      case "anthropic":
        return translateWithAnthropic(text, spokenLanguage, targetLanguage);
      default:
        return Promise.resolve(translateMock(text, spokenLanguage, targetLanguage));
    }
  },
};
