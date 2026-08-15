import { RequestHandler } from "express";
import { asyncHandler } from "../middlewares/asyncHandler";
import { conversationLogService } from "../services/conversationLog.service";
import { PaginationQuery } from "../types/pagination.types";

export const getConversationHistory: RequestHandler = asyncHandler(async (req, res) => {
  const { page, limit } = req.query as unknown as PaginationQuery;
  const result = await conversationLogService.list(page, limit);
  res.status(200).json(result);
});
