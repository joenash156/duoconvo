import { createAudioPlayer } from "expo-audio";
import * as Speech from "expo-speech";
import { apiClient } from "@/services/apiClient";
import { LanguageCode } from "@/constants/languages";
import { SpeakResult, TtsResponse } from "@/types/tts.types";

/**
 * Languages with reliable on-device voices (Apple/Google ship voices for
 * these). Everything else has no on-device support and goes through the
 * backend's /tts endpoint instead. Mirrors api/src/services/tts.service.ts.
 */
const DEVICE_TTS_LOCALES: Partial<Record<LanguageCode, string>> = {
  en: "en-US",
  fr: "fr-FR",
};

function speakOnDevice(text: string, locale: string): Promise<SpeakResult> {
  return new Promise((resolve) => {
    try {
      Speech.speak(text, {
        language: locale,
        onDone: () => resolve({ played: true }),
        onStopped: () => resolve({ played: true }),
        onError: (error) => resolve({ played: false, reason: error?.message ?? "Device TTS failed" }),
      });
    } catch (error) {
      resolve({
        played: false,
        reason: error instanceof Error ? error.message : "Device TTS is unavailable for this voice/locale",
      });
    }
  });
}

function playRemoteAudio(url: string): Promise<SpeakResult> {
  return new Promise((resolve) => {
    try {
      const player = createAudioPlayer(url);

      const finish = (result: SpeakResult) => {
        player.remove();
        resolve(result);
      };

      player.addListener("playbackStatusUpdate", (status) => {
        if (status.didJustFinish) {
          finish({ played: true });
        }
      });

      player.play();
    } catch (error) {
      resolve({
        played: false,
        reason: error instanceof Error ? error.message : "Failed to play backend audio",
      });
    }
  });
}

async function speakViaBackend(
  text: string,
  language: LanguageCode,
  audioUrl?: string | null,
): Promise<SpeakResult> {
  if (audioUrl) {
    return playRemoteAudio(audioUrl);
  }

  try {
    const response = await apiClient.post<TtsResponse>("/tts", { text, language });

    if (!response.audioUrl) {
      return {
        played: false,
        reason: response.message ?? `No backend audio available yet for "${language}".`,
      };
    }

    return playRemoteAudio(response.audioUrl);
  } catch (error) {
    return {
      played: false,
      reason: error instanceof Error ? error.message : "Backend TTS request failed",
    };
  }
}

/**
 * Unified TTS interface for the whole app: callers just say what to speak
 * and in which language - they never branch on device-vs-backend.
 *
 * English/French are spoken on-device (Apple/Google ship voices for them).
 * Twi/Ga/Ewe have no on-device voices, so this plays `audioUrl` if one was
 * already returned by /translate, or falls back to requesting one from
 * POST /tts. If no backend engine is configured yet for the language, this
 * resolves with `played: false` and a reason instead of throwing or
 * silently doing nothing - callers should surface `reason` to the user.
 */
export async function speak(text: string, language: LanguageCode, audioUrl?: string | null): Promise<SpeakResult> {
  if (!text.trim()) {
    return { played: false, reason: "Nothing to speak - empty text." };
  }

  const deviceLocale = DEVICE_TTS_LOCALES[language];

  if (deviceLocale) {
    return speakOnDevice(text, deviceLocale);
  }

  return speakViaBackend(text, language, audioUrl);
}

export function stopSpeaking(): void {
  Speech.stop();
}
