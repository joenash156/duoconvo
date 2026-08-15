import mysql from "mysql2/promise";
import { drizzle } from "drizzle-orm/mysql2";
import { env } from "./env";

export const pool = mysql.createPool(env.DATABASE_URL);

export const db = drizzle(pool);

export async function closeDb(): Promise<void> {
  await pool.end();
}
