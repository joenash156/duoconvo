import { RequestHandler } from "express";
import { asyncHandler } from "../middlewares/asyncHandler";
import { conversationLogService } from "../services/conversationLog.service";
import { PaginationQuery } from "../types/pagination.types";

/**
 * Backs the mobile app's AI Evidence screen. Every logged translation
 * already carries similarity score + source + intent, so it reuses the
 * same conversation log data as history - kept as a separate route/
 * controller so the two screens can diverge later (e.g. evidence-only
 * filtering) without touching the history endpoint.
 */
export const getAiEvidence: RequestHandler = asyncHandler(async (req, res) => {
  const { page, limit } = req.query as unknown as PaginationQuery;
  const result = await conversationLogService.list(page, limit);
  res.status(200).json(result);
});
