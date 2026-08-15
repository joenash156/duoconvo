import { randomUUID } from "crypto";
import { count, desc, eq } from "drizzle-orm";
import { db } from "../configs/db";
import { conversationLogs, NewConversationLog } from "../db/schema";

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
};
