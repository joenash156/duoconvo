import { env } from "../configs/env";

/**
 * Languages with reliable on-device TTS voices (Apple/Google ship voices
 * for these). The mobile app speaks these locally - the backend should
 * never be asked to synthesize them. See docs/AI-Architecture.md.
 */
export const DEVICE_TTS_LANGUAGES = ["en", "fr"] as const;

/**
 * Languages with no on-device TTS support, so the backend is responsible
 * for generating audio once a real engine is wired up.
 */
export const BACKEND_TTS_LANGUAGES = ["tw", "ga", "ee"] as const;

function isBackendLanguage(language: string): boolean {
  return (BACKEND_TTS_LANGUAGES as readonly string[]).includes(language);
}

/**
 * Mock TTS - returns null so the frontend simply disables audio playback;
 * TranslationResult.audioUrl is nullable for exactly this case. No real
 * Twi/Ga/Ewe TTS engine exists yet, so this deliberately does not fake one.
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

/**
 * Human-readable reason audioUrl came back null, used only by the
 * standalone POST /tts endpoint (controllers/tts.controller.ts) so the
 * mobile app can show a meaningful message instead of silently doing
 * nothing. The translate pipeline itself only needs the audioUrl.
 */
export function describeTtsAvailability(language: string): { supported: boolean; message?: string } {
  if (!isBackendLanguage(language)) {
    return {
      supported: false,
      message: `"${language}" is handled by on-device TTS on the mobile app; no backend audio is generated for it.`,
    };
  }

  if (env.TTS_PROVIDER !== "http") {
    return {
      supported: false,
      message: `No backend TTS engine is configured yet for "${language}". Set TTS_PROVIDER=http once one is available.`,
    };
  }

  return { supported: true };
}

export const ttsService = {
  /**
   * Only attempts real synthesis for languages without on-device support
   * (BACKEND_TTS_LANGUAGES). English/French short-circuit to null so the
   * translate pipeline never makes an unnecessary backend/external TTS
   * call for languages the mobile app already handles itself.
   */
  synthesize: (text: string, language: string): Promise<string | null> => {
    if (!isBackendLanguage(language)) {
      return Promise.resolve(null);
    }

    return env.TTS_PROVIDER === "http"
      ? synthesizeFromHttpEngine(text, language)
      : Promise.resolve(synthesizeMock());
  },
};
