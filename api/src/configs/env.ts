import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().int().positive().default(8000),

  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

  CORS_ORIGIN: z.string().default("*"),

  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(15 * 60 * 1000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(100),

  UPLOAD_MAX_FILE_SIZE_MB: z.coerce.number().int().positive().default(10),

  // AI retrieval (fine-tuned Sentence Transformer + FAISS + confidence
  // engine, ai-engine/app/ai_server.py). No mock fallback - real semantic
  // matching is required for the app to mean anything.
  AI_ENGINE_URL: z.string().default("http://localhost:8001"),
  AI_ENGINE_TIMEOUT_MS: z.coerce.number().int().positive().default(5000),

  CONFIDENCE_HIGH_THRESHOLD: z.coerce.number().min(0).max(1).default(0.6),
  CONFIDENCE_MEDIUM_THRESHOLD: z.coerce.number().min(0).max(1).default(0.35),

  // English/French speech-to-text via Groq's Whisper API.
  STT_PROVIDER: z.enum(["mock", "groq"]).default("mock"),
  GROQ_API_KEY: z.string().optional(),
  GROQ_STT_MODEL: z.string().default("whisper-large-v3-turbo"),

  // Twi/Ga/Ewe speech-to-text via the self-hosted KhayaAI model
  // (ai-engine/app/stt_server.py) - Whisper doesn't support these languages
  // at all, so they're routed to a separate, independently-toggled engine.
  STT_LOCAL_PROVIDER: z.enum(["mock", "http"]).default("mock"),
  STT_ENGINE_URL: z.string().default("http://localhost:8002"),

  // Twi/Ga/Ewe text-to-speech via GhanaNLP's cloud API (Khaya AI) -
  // console.translation.ghananlp.org. Verified working for all three
  // languages (returns real audio/wav bytes), unlike the earlier "no engine
  // exists" mock state.
  TTS_PROVIDER: z.enum(["mock", "http", "ghananlp"]).default("mock"),
  TTS_ENGINE_URL: z.string().default("http://localhost:8003"),
  GHANANLP_API_KEY: z.string().optional(),

  // Used to build absolute audio URLs (e.g. http://192.168.x.x:8000/audio/xyz.wav)
  // for generated TTS files served from PUBLIC_BASE_URL/audio - mobile devices
  // can't resolve "localhost" as the server's own address, so this needs to
  // match whatever host the mobile app actually reaches the API on.
  PUBLIC_BASE_URL: z.string().default("http://localhost:8000"),

  LLM_FALLBACK_PROVIDER: z.enum(["mock", "openai", "anthropic"]).default("mock"),
  OPENAI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment configuration:");
  console.error(z.treeifyError(parsed.error));
  process.exit(1);
}

export const env = parsed.data;
export type Env = typeof env;
