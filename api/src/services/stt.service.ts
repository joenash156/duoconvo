import { env } from "../configs/env";

/**
 * Whisper (Groq) has no Twi, Ga, or Ewe in its trained language set.
 * KhayaAI's Southern Ghana model (self-hosted, see
 * ai-engine/app/stt_server.py) covers exactly those three but not
 * English/French as reliably as Whisper does. So STT is routed per
 * language to two independent, independently-toggled engines rather than
 * one global provider - mirrors the TTS hybrid split in tts.service.ts.
 */
const GROQ_LANGUAGES = ["en", "fr"] as const;
const LOCAL_ENGINE_LANGUAGES = ["tw", "ga", "ee"] as const;

function isGroqLanguage(language: string): boolean {
  return (GROQ_LANGUAGES as readonly string[]).includes(language);
}

function isLocalEngineLanguage(language: string): boolean {
  return (LOCAL_ENGINE_LANGUAGES as readonly string[]).includes(language);
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
 * Local KhayaAI (DONDO) engine for Twi/Ga/Ewe - see
 * ai-engine/app/stt_server.py's POST /transcribe contract.
 */
async function transcribeWithLocalEngine(audioBuffer: Buffer, language: string): Promise<string> {
  const formData = new FormData();
  formData.append("language", language);
  formData.append("audio", new Blob([audioBuffer]), "recording.m4a");

  const response = await fetch(`${env.STT_ENGINE_URL}/transcribe`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Local STT engine responded with status ${response.status}: ${errorBody}`);
  }

  const data = (await response.json()) as { text: string };
  return data.text;
}

export const sttService = {
  transcribe: (audioBuffer: Buffer, language: string): Promise<string> => {
    if (isGroqLanguage(language)) {
      return env.STT_PROVIDER === "groq"
        ? transcribeWithGroq(audioBuffer, language)
        : Promise.resolve(transcribeMock());
    }

    if (isLocalEngineLanguage(language)) {
      return env.STT_LOCAL_PROVIDER === "http"
        ? transcribeWithLocalEngine(audioBuffer, language)
        : Promise.resolve(transcribeMock());
    }

    return Promise.resolve(transcribeMock());
  },
};
