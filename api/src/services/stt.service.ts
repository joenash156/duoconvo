import { env } from "../configs/env";

/**
 * Whisper (what Groq runs) has no Twi, Ga, or Ewe in its trained language
 * set - those are too low-resource. Rather than let it guess and produce a
 * garbage transcription in the wrong language, only real languages get
 * real STT; everything else keeps the honest mock. Mirrors the TTS hybrid
 * split in tts.service.ts.
 */
const GROQ_SUPPORTED_LANGUAGES = ["en", "fr"] as const;

function isGroqSupportedLanguage(language: string): boolean {
  return (GROQ_SUPPORTED_LANGUAGES as readonly string[]).includes(language);
}

/**
 * Mock STT - no real speech recognition engine is wired up yet. Every audio
 * translation will therefore run through the same placeholder sentence.
 */
function transcribeMock(): string {
  return "(mock transcription - connect an STT engine to replace this)";
}

/**
 * Groq's Whisper endpoint (OpenAI-compatible). Free tier: 2,000
 * requests/day. See https://console.groq.com for an API key.
 */
async function transcribeWithGroq(audioBuffer: Buffer, language: string): Promise<string> {
  if (!env.GROQ_API_KEY) {
    throw new Error("STT_PROVIDER=groq requires GROQ_API_KEY to be set in the environment.");
  }

  const formData = new FormData();
  formData.append("file", new Blob([audioBuffer]), "recording.m4a");
  formData.append("model", env.GROQ_STT_MODEL);
  formData.append("language", language);

  const response = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${env.GROQ_API_KEY}` },
    body: formData,
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Groq STT responded with status ${response.status}: ${errorBody}`);
  }

  const data = (await response.json()) as { text: string };
  return data.text;
}

/**
 * Expected contract for a future custom STT service:
 *
 *   POST {STT_ENGINE_URL}/transcribe  (multipart/form-data)
 *   fields: audio (file), language (string)
 *   response: { "text": string }
 */
async function transcribeFromHttpEngine(audioBuffer: Buffer, language: string): Promise<string> {
  const formData = new FormData();
  formData.append("language", language);
  formData.append("audio", new Blob([audioBuffer]), "recording.m4a");

  const response = await fetch(`${env.STT_ENGINE_URL}/transcribe`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`STT engine responded with status ${response.status}`);
  }

  const data = (await response.json()) as { text: string };
  return data.text;
}

export const sttService = {
  transcribe: (audioBuffer: Buffer, language: string): Promise<string> => {
    if (env.STT_PROVIDER === "groq") {
      return isGroqSupportedLanguage(language)
        ? transcribeWithGroq(audioBuffer, language)
        : Promise.resolve(transcribeMock());
    }

    return env.STT_PROVIDER === "http"
      ? transcribeFromHttpEngine(audioBuffer, language)
      : Promise.resolve(transcribeMock());
  },
};
