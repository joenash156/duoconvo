import { randomUUID } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { env } from "./env";

/**
 * Generated TTS audio (currently only GhanaNLP's real audio/wav bytes) is
 * saved here and served statically at PUBLIC_BASE_URL/audio/<file> - see
 * server.ts. Persisted to disk (not just kept in memory) so audioUrl values
 * already saved in conversation_logs stay valid across server restarts.
 */
export const AUDIO_DIR = resolve(__dirname, "../../uploads/audio");

export function ensureAudioDir(): void {
  mkdirSync(AUDIO_DIR, { recursive: true });
}

export function saveAudioFile(buffer: Buffer, extension: string): string {
  const filename = `${randomUUID()}.${extension}`;
  writeFileSync(resolve(AUDIO_DIR, filename), buffer);
  return `${env.PUBLIC_BASE_URL}/audio/${filename}`;
}
