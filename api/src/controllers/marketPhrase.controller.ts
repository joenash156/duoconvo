import { RequestHandler } from "express";
import { asyncHandler } from "../middlewares/asyncHandler";
import { marketPhraseService } from "../services/marketPhrase.service";
import { PaginationQuery } from "../types/pagination.types";

export const listMarketPhrases: RequestHandler = asyncHandler(async (req, res) => {
  const { page, limit, intentId } = req.query as unknown as PaginationQuery & { intentId?: string };
  const result = await marketPhraseService.list(page, limit, intentId);
  res.status(200).json(result);
});

export const getMarketPhrase: RequestHandler = asyncHandler(async (req, res) => {
  const phrase = await marketPhraseService.getById(req.params.id);
  res.status(200).json(phrase);
});

export const createMarketPhrase: RequestHandler = asyncHandler(async (req, res) => {
  const phrase = await marketPhraseService.create(req.body);
  res.status(201).json(phrase);
});

export const updateMarketPhrase: RequestHandler = asyncHandler(async (req, res) => {
  const phrase = await marketPhraseService.update(req.params.id, req.body);
  res.status(200).json(phrase);
});

export const deleteMarketPhrase: RequestHandler = asyncHandler(async (req, res) => {
  await marketPhraseService.remove(req.params.id);
  res.status(204).send();
});
