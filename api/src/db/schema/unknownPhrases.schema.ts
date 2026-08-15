import { randomUUID } from "crypto";
import { float, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

export const unknownPhraseStatusValues = ["pending", "approved", "rejected"] as const;

export const unknownPhrases = mysqlTable("unknown_phrases", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  inputText: text("input_text").notNull(),
  language: varchar("language", { length: 5 }).notNull(),
  similarityScore: float("similarity_score"),
  status: mysqlEnum("status", unknownPhraseStatusValues).default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type UnknownPhrase = typeof unknownPhrases.$inferSelect;
export type NewUnknownPhrase = typeof unknownPhrases.$inferInsert;
export type UnknownPhraseStatusValue = (typeof unknownPhraseStatusValues)[number];
