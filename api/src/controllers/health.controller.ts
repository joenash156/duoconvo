import { sql } from "drizzle-orm";
import { RequestHandler } from "express";
import { db } from "../configs/db";
import { asyncHandler } from "../middlewares/asyncHandler";

export const getHealth: RequestHandler = asyncHandler(async (_req, res) => {
  try {
    await db.execute(sql`SELECT 1`);
    res.status(200).json({ 
      success: true,
      status: "ok", 
      database: "connected", 
      timestamp: new Date().toISOString() 
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      status: "error",
      database: "disconnected",
      timestamp: new Date().toISOString(),
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});
