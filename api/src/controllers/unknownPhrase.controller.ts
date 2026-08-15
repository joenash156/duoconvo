import { RequestHandler } from "express";
import { UnknownPhraseStatusValue } from "../db/schema";
import { asyncHandler } from "../middlewares/asyncHandler";
import { unknownPhraseService } from "../services/unknownPhrase.service";
import { PaginationQuery } from "../types/pagination.types";

export const listUnknownPhrases: RequestHandler = asyncHandler(async (req, res) => {
  const { page, limit, status } = req.query as unknown as PaginationQuery & { status?: UnknownPhraseStatusValue };
  const result = await unknownPhraseService.list(page, limit, status);
  res.status(200).json(result);
});

export const updateUnknownPhraseStatus: RequestHandler = asyncHandler(async (req, res) => {
  const { status } = req.body as { status: UnknownPhraseStatusValue };
  const updated = await unknownPhraseService.updateStatus(req.params.id, status);
  res.status(200).json(updated);
});
