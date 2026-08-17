import { randomUUID } from "crypto";
import { avg, count, desc, eq, isNotNull, sql } from "drizzle-orm";
import { db } from "../configs/db";
import { env } from "../configs/env";
import { conversationLogs, NewConversationLog } from "../db/schema";

// Same CASE-based bucketing SQL used in both the raw and grouped-count
// queries below, kept as one constant so they can't drift apart.
const confidenceBucketExpr = sql<string>`CASE
  WHEN ${conversationLogs.similarityScore} >= ${env.CONFIDENCE_HIGH_THRESHOLD} THEN 'high'
  WHEN ${conversationLogs.similarityScore} >= ${env.CONFIDENCE_MEDIUM_THRESHOLD} THEN 'medium'
  ELSE 'low' END`;

export const conversationLogRepository = {
  create: async (data: Omit<NewConversationLog, "id">) => {
    const id = randomUUID();
    await db.insert(conversationLogs).values({ id, ...data });
    const [log] = await db.select().from(conversationLogs).where(eq(conversationLogs.id, id));
    return log;
  },

  list: async (page: number, limit: number) => {
    const offset = (page - 1) * limit;

    const [items, totals] = await Promise.all([
      db.select().from(conversationLogs).orderBy(desc(conversationLogs.createdAt)).limit(limit).offset(offset),
      db.select({ total: count() }).from(conversationLogs),
    ]);

    return { items, total: totals[0]?.total ?? 0 };
  },

  /**
   * Aggregate stats for the mobile app's Metrics -> Dashboard tab. Every
   * grouping/average runs server-side in SQL rather than fetching every row
   * and reducing in JS, so this stays cheap as conversation_logs grows.
   */
  summary: async () => {
    const [[totalRow], bySource, [averages], byIntent, confidenceBuckets, spokenLanguages, targetLanguages] =
      await Promise.all([
        db.select({ total: count() }).from(conversationLogs),
        db
          .select({ source: conversationLogs.translationSource, count: count() })
          .from(conversationLogs)
          .groupBy(conversationLogs.translationSource),
        db
          .select({
            avgSimilarity: avg(conversationLogs.similarityScore),
            avgResponseTimeMs: avg(conversationLogs.responseTimeMs),
          })
          .from(conversationLogs),
        db
          .select({ intent: conversationLogs.detectedIntent, count: count() })
          .from(conversationLogs)
          .where(isNotNull(conversationLogs.detectedIntent))
          .groupBy(conversationLogs.detectedIntent)
          .orderBy(desc(count())),
        db
          .select({ bucket: confidenceBucketExpr, count: count() })
          .from(conversationLogs)
          .where(isNotNull(conversationLogs.similarityScore))
          .groupBy(confidenceBucketExpr),
        db.selectDistinct({ language: conversationLogs.spokenLanguage }).from(conversationLogs),
        db.selectDistinct({ language: conversationLogs.targetLanguage }).from(conversationLogs),
      ]);

    const languagesUsed = new Set(
      [...spokenLanguages, ...targetLanguages].map((row) => row.language),
    ).size;

    return {
      total: totalRow?.total ?? 0,
      bySource,
      avgSimilarity: averages?.avgSimilarity ? Number(averages.avgSimilarity) : null,
      avgResponseTimeMs: averages?.avgResponseTimeMs ? Number(averages.avgResponseTimeMs) : null,
      byIntent,
      confidenceBuckets,
      languagesUsed,
    };
  },
};
