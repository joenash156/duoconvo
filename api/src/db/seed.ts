import { readFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { resolve } from "node:path";
import { parse } from "csv-parse/sync";
import { db, closeDb } from "../configs/db";
import { logger } from "../utils/logger";
import { conversationLogs, intents, marketPhrases } from "./schema";

/**
 * Seeds intents + market phrases from the real curated dataset
 * (datasets/curated/multilingual_phrases.csv) - the exact same file
 * ai-engine's model was trained/embedded on, so concept codes returned by
 * the real AI retrieval service (AI_PROVIDER=http) resolve here correctly.
 *
 * Twi/Ewe/French are machine-translated (see
 * dataset-tools/translate_curated_dataset.py); Ga is intentionally blank -
 * not supported by Google Translate. Replaces the old mock-knowledge-base
 * seed entirely: clears existing data first (conversation_logs ->
 * market_phrases -> intents, respecting foreign keys) rather than upserting,
 * since the mock data used a different, incompatible concept set.
 */

type CuratedRow = {
  concept_code: string;
  domain: string;
  intent: string;
  english: string;
  twi: string;
  ga: string;
  ewe: string;
  french: string;
};

// api/src/db -> api/src -> api -> duoconvo (project root)
const CURATED_DATASET_PATH = resolve(__dirname, "../../../datasets/curated/multilingual_phrases.csv");

function loadCuratedRows(): CuratedRow[] {
  const csvContent = readFileSync(CURATED_DATASET_PATH, "utf-8");
  return parse(csvContent, { columns: true, skip_empty_lines: true }) as CuratedRow[];
}

function nullIfBlank(value: string): string | null {
  return value && value.trim().length > 0 ? value : null;
}

async function seed() {
  const rows = loadCuratedRows();
  logger.info(`Loaded ${rows.length} rows from ${CURATED_DATASET_PATH}`);

  logger.info("Clearing existing conversation_logs, market_phrases, intents...");
  await db.delete(conversationLogs);
  await db.delete(marketPhrases);
  await db.delete(intents);

  const intentIdByName = new Map<string, string>();
  const uniqueIntentNames = [...new Set(rows.map((row) => row.intent))];

  for (const name of uniqueIntentNames) {
    const id = randomUUID();
    await db.insert(intents).values({ id, name });
    intentIdByName.set(name, id);
  }

  for (const row of rows) {
    await db.insert(marketPhrases).values({
      id: randomUUID(),
      conceptCode: row.concept_code,
      englishText: row.english,
      twiText: nullIfBlank(row.twi),
      gaText: nullIfBlank(row.ga),
      eweText: nullIfBlank(row.ewe),
      frenchText: nullIfBlank(row.french),
      intentId: intentIdByName.get(row.intent)!,
    });
  }

  logger.info(`Seed complete: ${intentIdByName.size} intents, ${rows.length} market phrases.`);
}

seed()
  .catch((error) => {
    logger.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(() => closeDb());
