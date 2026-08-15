import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";
import { db } from "../configs/db";
import { intents, NewIntent } from "../db/schema";

export const intentRepository = {
  findAll: () => db.select().from(intents),

  findById: async (id: string) => {
    const [intent] = await db.select().from(intents).where(eq(intents.id, id));
    return intent ?? null;
  },

  findByName: async (name: string) => {
    const [intent] = await db.select().from(intents).where(eq(intents.name, name));
    return intent ?? null;
  },

  create: async (data: Omit<NewIntent, "id">) => {
    const id = randomUUID();
    await db.insert(intents).values({ id, ...data });
    return intentRepository.findById(id);
  },

  update: async (id: string, data: Partial<Omit<NewIntent, "id">>) => {
    await db.update(intents).set(data).where(eq(intents.id, id));
    return intentRepository.findById(id);
  },

  remove: (id: string) => db.delete(intents).where(eq(intents.id, id)),
};
