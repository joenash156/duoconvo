import { env } from "../configs/env";

/**
 * Mock STT - no real speech recognition engine is wired up yet. Every audio
 * translation will therefore run through the same placeholder sentence.
 * Replace with a real engine (e.g. Whisper) and set STT_PROVIDER=http.
 */
function transcribeMock(): string {
  return "(mock transcription - connect an STT engine to replace this)";
}

/**
 * Expected contract for a future STT service:
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
  transcribe: (audioBuffer: Buffer, language: string): Promise<string> =>
    env.STT_PROVIDER === "http" ? transcribeFromHttpEngine(audioBuffer, language) : Promise.resolve(transcribeMock()),
};
