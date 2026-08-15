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

  AI_PROVIDER: z.enum(["mock", "http"]).default("mock"),
  AI_ENGINE_URL: z.string().default("http://localhost:8001"),
  AI_ENGINE_TIMEOUT_MS: z.coerce.number().int().positive().default(5000),

  CONFIDENCE_HIGH_THRESHOLD: z.coerce.number().min(0).max(1).default(0.6),
  CONFIDENCE_MEDIUM_THRESHOLD: z.coerce.number().min(0).max(1).default(0.35),

  STT_PROVIDER: z.enum(["mock", "http"]).default("mock"),
  STT_ENGINE_URL: z.string().default("http://localhost:8002"),

  TTS_PROVIDER: z.enum(["mock", "http"]).default("mock"),
  TTS_ENGINE_URL: z.string().default("http://localhost:8003"),

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
