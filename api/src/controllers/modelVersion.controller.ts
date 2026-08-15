import { RequestHandler } from "express";
import { asyncHandler } from "../middlewares/asyncHandler";
import { modelVersionService } from "../services/modelVersion.service";

export const listModelVersions: RequestHandler = asyncHandler(async (_req, res) => {
  const versions = await modelVersionService.list();
  res.status(200).json(versions);
});

export const getActiveModelVersion: RequestHandler = asyncHandler(async (_req, res) => {
  const active = await modelVersionService.getActive();
  res.status(200).json(active);
});

export const createModelVersion: RequestHandler = asyncHandler(async (req, res) => {
  const created = await modelVersionService.create(req.body);
  res.status(201).json(created);
});
