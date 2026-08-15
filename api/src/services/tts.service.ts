import { env } from "../configs/env";

/**
 * Mock TTS - returns null so the frontend simply disables audio playback;
 * TranslationResult.audioUrl is nullable for exactly this case.
 */
function synthesizeMock(): string | null {
  return null;
}

/**
 * Expected contract for a future TTS service:
 *
 *   POST {TTS_ENGINE_URL}/synthesize
 *   body: { "text": string, "language": string }
 *   response: { "audioUrl": string }
 */
async function synthesizeFromHttpEngine(text: string, language: string): Promise<string | null> {
  const response = await fetch(`${env.TTS_ENGINE_URL}/synthesize`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, language }),
  });

  if (!response.ok) {
    throw new Error(`TTS engine responded with status ${response.status}`);
  }

  const data = (await response.json()) as { audioUrl: string };
  return data.audioUrl;
}

export const ttsService = {
  synthesize: (text: string, language: string): Promise<string | null> =>
    env.TTS_PROVIDER === "http" ? synthesizeFromHttpEngine(text, language) : Promise.resolve(synthesizeMock()),
};
