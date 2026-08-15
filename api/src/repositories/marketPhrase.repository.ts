import { randomUUID } from "crypto";
import { and, count, desc, eq } from "drizzle-orm";
import { db } from "../configs/db";
import { marketPhrases, NewMarketPhrase } from "../db/schema";

export const marketPhraseRepository = {
  findById: async (id: string) => {
    const [phrase] = await db.select().from(marketPhrases).where(eq(marketPhrases.id, id));
    return phrase ?? null;
  },

  findByConceptCode: async (conceptCode: string) => {
    const [phrase] = await db
      .select()
      .from(marketPhrases)
      .where(and(eq(marketPhrases.conceptCode, conceptCode), eq(marketPhrases.isActive, true)));
    return phrase ?? null;
  },

  list: async (page: number, limit: number, intentId?: string) => {
    const offset = (page - 1) * limit;
    const whereClause = intentId ? eq(marketPhrases.intentId, intentId) : undefined;

    const [items, totals] = await Promise.all([
      db
        .select()
        .from(marketPhrases)
        .where(whereClause)
        .orderBy(desc(marketPhrases.createdAt))
        .limit(limit)
        .offset(offset),
      db.select({ total: count() }).from(marketPhrases).where(whereClause),
    ]);

    return { items, total: totals[0]?.total ?? 0 };
  },

  create: async (data: Omit<NewMarketPhrase, "id">) => {
    const id = randomUUID();
    await db.insert(marketPhrases).values({ id, ...data });
    return marketPhraseRepository.findById(id);
  },

  update: async (id: string, data: Partial<Omit<NewMarketPhrase, "id">>) => {
    await db.update(marketPhrases).set(data).where(eq(marketPhrases.id, id));
    return marketPhraseRepository.findById(id);
  },

  remove: (id: string) => db.delete(marketPhrases).where(eq(marketPhrases.id, id)),
};
