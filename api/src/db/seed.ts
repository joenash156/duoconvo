import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { db, closeDb } from "../configs/db";
import { MOCK_KNOWLEDGE_BASE } from "../data/mockKnowledgeBase";
import { logger } from "../utils/logger";
import { intents, marketPhrases } from "./schema";

/**
 * Seeds intents + market phrases from the mock knowledge base so the API
 * is testable end-to-end while AI_PROVIDER=mock. Once the real curated
 * dataset (datasets/curated/multilingual_phrases.csv) is verified and
 * complete, replace this with a proper CSV import.
 */
async function seed() {
  logger.info("Seeding intents and market phrases from the mock knowledge base...");

  const intentNames = [...new Set(MOCK_KNOWLEDGE_BASE.map((concept) => concept.intentName))];
  const intentIdByName = new Map<string, string>();

  for (const name of intentNames) {
    const [existing] = await db.select().from(intents).where(eq(intents.name, name));

    if (existing) {
      intentIdByName.set(name, existing.id);
      continue;
    }

    const id = randomUUID();
    const concept = MOCK_KNOWLEDGE_BASE.find((item) => item.intentName === name);
    await db.insert(intents).values({ id, name, description: concept?.intentDescription });
    intentIdByName.set(name, id);
  }

  let created = 0;

  for (const concept of MOCK_KNOWLEDGE_BASE) {
    const [existing] = await db
      .select()
      .from(marketPhrases)
      .where(eq(marketPhrases.conceptCode, concept.conceptCode));

    if (existing) continue;

    await db.insert(marketPhrases).values({
      id: randomUUID(),
      conceptCode: concept.conceptCode,
      englishText: concept.english,
      intentId: intentIdByName.get(concept.intentName)!,
    });
    created += 1;
  }

  logger.info(`Seed complete: ${intentIdByName.size} intents, ${created} new market phrases.`);
}

seed()
  .catch((error) => {
    logger.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(() => closeDb());
