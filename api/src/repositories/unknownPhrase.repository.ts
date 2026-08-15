import { randomUUID } from "crypto";
import { count, desc, eq } from "drizzle-orm";
import { db } from "../configs/db";
import { NewUnknownPhrase, unknownPhrases, UnknownPhraseStatusValue } from "../db/schema";

export const unknownPhraseRepository = {
  create: async (data: Omit<NewUnknownPhrase, "id">) => {
    const id = randomUUID();
    await db.insert(unknownPhrases).values({ id, ...data });
    const [phrase] = await db.select().from(unknownPhrases).where(eq(unknownPhrases.id, id));
    return phrase;
  },

  list: async (page: number, limit: number, status?: UnknownPhraseStatusValue) => {
    const offset = (page - 1) * limit;
    const whereClause = status ? eq(unknownPhrases.status, status) : undefined;

    const [items, totals] = await Promise.all([
      db
        .select()
        .from(unknownPhrases)
        .where(whereClause)
        .orderBy(desc(unknownPhrases.createdAt))
        .limit(limit)
        .offset(offset),
      db.select({ total: count() }).from(unknownPhrases).where(whereClause),
    ]);

    return { items, total: totals[0]?.total ?? 0 };
  },

  updateStatus: async (id: string, status: UnknownPhraseStatusValue) => {
    await db.update(unknownPhrases).set({ status }).where(eq(unknownPhrases.id, id));
    const [phrase] = await db.select().from(unknownPhrases).where(eq(unknownPhrases.id, id));
    return phrase ?? null;
  },
};
