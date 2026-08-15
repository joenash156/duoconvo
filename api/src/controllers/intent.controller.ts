import { RequestHandler } from "express";
import { asyncHandler } from "../middlewares/asyncHandler";
import { intentService } from "../services/intent.service";

export const listIntents: RequestHandler = asyncHandler(async (_req, res) => {
  const intents = await intentService.list();
  res.status(200).json(intents);
});

export const getIntent: RequestHandler = asyncHandler(async (req, res) => {
  const intent = await intentService.getById(req.params.id);
  res.status(200).json(intent);
});

export const createIntent: RequestHandler = asyncHandler(async (req, res) => {
  const intent = await intentService.create(req.body);
  res.status(201).json(intent);
});

export const updateIntent: RequestHandler = asyncHandler(async (req, res) => {
  const intent = await intentService.update(req.params.id, req.body);
  res.status(200).json(intent);
});

export const deleteIntent: RequestHandler = asyncHandler(async (req, res) => {
  await intentService.remove(req.params.id);
  res.status(204).send();
});
