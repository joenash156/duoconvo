/** Mirrors api/src/types/tts.types.ts's TtsResponse. */
export type TtsResponse = {
  audioUrl: string | null;
  language: string;
  message?: string;
};

export type SpeakResult = { played: true } | { played: false; reason: string };
