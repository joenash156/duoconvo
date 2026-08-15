import { randomUUID } from "crypto";
import { float, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";
import { marketPhrases } from "./marketPhrases.schema";

export const translationSourceValues = ["model", "llm_fallback"] as const;

/**
 * Audit trail for every translation performed, extended beyond
 * database-idea.md with spokenLanguage/targetLanguage/translatedText/
 * detectedIntent/audioUrl so GET /conversations and /evidence can
 * reconstruct a full TranslationResult straight from this table without
 * extra joins.
 */
export const conversationLogs = mysqlTable("conversation_logs", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  inputText: text("input_text").notNull(),
  speechToTextOutput: text("speech_to_text_output"),
  predictedPhraseId: varchar("predicted_phrase_id", { length: 36 }).references(() => marketPhrases.id),
  similarityScore: float("similarity_score"),
  translationSource: mysqlEnum("translation_source", translationSourceValues).notNull(),
  responseTimeMs: int("response_time_ms"),
  spokenLanguage: varchar("spoken_language", { length: 5 }).notNull(),
  targetLanguage: varchar("target_language", { length: 5 }).notNull(),
  translatedText: text("translated_text"),
  detectedIntent: varchar("detected_intent", { length: 100 }),
  audioUrl: varchar("audio_url", { length: 500 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type ConversationLog = typeof conversationLogs.$inferSelect;
export type NewConversationLog = typeof conversationLogs.$inferInsert;
export type TranslationSourceValue = (typeof translationSourceValues)[number];
