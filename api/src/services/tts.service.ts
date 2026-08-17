import { saveAudioFile } from "../configs/audioStorage";
import { env } from "../configs/env";

/**
 * Languages with reliable on-device TTS voices (Apple/Google ship voices
 * for these). The mobile app speaks these locally - the backend should
 * never be asked to synthesize them. See docs/AI-Architecture.md.
 */
export const DEVICE_TTS_LANGUAGES = ["en", "fr"] as const;

/**
 * Languages with no on-device TTS support, so the backend is responsible
 * for generating audio.
 */
export const BACKEND_TTS_LANGUAGES = ["tw", "ga", "ee"] as const;

function isBackendLanguage(language: string): boolean {
  return (BACKEND_TTS_LANGUAGES as readonly string[]).includes(language);
}

/**
 * DuoConvo's internal language codes -> GhanaNLP's. Twi/Ewe match; Ga is
 * "gaa" on their side, confirmed via direct API testing (their /tts/v1/tts
 * accepts "gaa" and returns real audio/wav bytes - "ga" alone 404s).
 */
const GHANANLP_LANGUAGE_CODES: Record<string, string> = {
  tw: "tw",
  ga: "gaa",
  ee: "ee",
};

/**
 * Mock TTS - returns null so the frontend simply disables audio playback;
 * TranslationResult.audioUrl is nullable for exactly this case.
 */
function synthesizeMock(): string | null {
  return null;
}

/**
 * GhanaNLP's (Khaya AI) cloud TTS API - console.translation.ghananlp.org.
 * Verified directly (not just from docs) against the real endpoint: returns
 * genuine audio/wav bytes for Twi, Ga ("gaa"), and Ewe.
 */
async function synthesizeWithGhanaNlp(text: string, language: string): Promise<string | null> {
  if (!env.GHANANLP_API_KEY) {
    throw new Error("TTS_PROVIDER=ghananlp requires GHANANLP_API_KEY to be set in the environment.");
  }

  const ghananlpLanguage = GHANANLP_LANGUAGE_CODES[language];
  if (!ghananlpLanguage) {
    return null;
  }

  const response = await fetch("https://translation-api.ghananlp.org/tts/v1/tts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Ocp-Apim-Subscription-Key": env.GHANANLP_API_KEY,
    },
    body: JSON.stringify({ text, language: ghananlpLanguage }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`GhanaNLP TTS responded with status ${response.status}: ${errorBody}`);
  }

  const audioBuffer = Buffer.from(await response.arrayBuffer());
  return saveAudioFile(audioBuffer, "wav");
}

/**
 * Expected contract for a generic self-hosted TTS service:
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

  if (env.TTS_PROVIDER === "mock") {
    return {
      supported: false,
      message: `No backend TTS engine is configured yet for "${language}". Set TTS_PROVIDER=ghananlp once GHANANLP_API_KEY is set.`,
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

    if (env.TTS_PROVIDER === "ghananlp") {
      return synthesizeWithGhanaNlp(text, language);
    }

    if (env.TTS_PROVIDER === "http") {
      return synthesizeFromHttpEngine(text, language);
    }

    return Promise.resolve(synthesizeMock());
  },
};
