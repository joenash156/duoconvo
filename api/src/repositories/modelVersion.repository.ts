import { randomUUID } from "crypto";
import { desc, eq } from "drizzle-orm";
import { db } from "../configs/db";
import { modelVersions, NewModelVersion } from "../db/schema";

export const modelVersionRepository = {
  findAll: () => db.select().from(modelVersions).orderBy(desc(modelVersions.createdAt)),

  findActive: async () => {
    const [active] = await db.select().from(modelVersions).where(eq(modelVersions.isActive, true));
    return active ?? null;
  },

  create: async (data: Omit<NewModelVersion, "id">) => {
    const id = randomUUID();
    await db.insert(modelVersions).values({ id, ...data });
    const [created] = await db.select().from(modelVersions).where(eq(modelVersions.id, id));
    return created;
  },

  update: async (id: string, data: Partial<Omit<NewModelVersion, "id">>) => {
    await db.update(modelVersions).set(data).where(eq(modelVersions.id, id));
    const [updated] = await db.select().from(modelVersions).where(eq(modelVersions.id, id));
    return updated ?? null;
  },
};
