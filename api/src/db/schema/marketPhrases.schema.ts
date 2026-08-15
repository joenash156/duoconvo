import { randomUUID } from "crypto";
import { boolean, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";
import { intents } from "./intents.schema";

/**
 * Bridges AI retrieval to structured knowledge: FAISS returns a concept_code
 * (see ai-engine/vector-db/metadata.csv), and the backend looks that code up
 * here to fetch the verified multilingual translation. Not present in
 * database-idea.md's original spec, but required by idea.md section 17
 * ("FAISS position -> metadata row -> concept_code -> MySQL record").
 *
 * Translation columns are nullable because the curated dataset
 * (datasets/curated/multilingual_phrases.csv) currently only has English
 * filled in for most concepts - other languages get backfilled over time.
 */
export const marketPhrases = mysqlTable("market_phrases", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  conceptCode: varchar("concept_code", { length: 50 }).notNull().unique(),
  englishText: text("english_text").notNull(),
  twiText: text("twi_text"),
  gaText: text("ga_text"),
  eweText: text("ewe_text"),
  frenchText: text("french_text"),
  intentId: varchar("intent_id", { length: 36 })
    .notNull()
    .references(() => intents.id),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type MarketPhrase = typeof marketPhrases.$inferSelect;
export type NewMarketPhrase = typeof marketPhrases.$inferInsert;
