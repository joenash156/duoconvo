import { RequestHandler } from "express";
import { asyncHandler } from "../middlewares/asyncHandler";
import { translationService } from "../services/translation.service";
import { ApiError } from "../utils/ApiError";
import { translateAudioFieldsSchema } from "../validators/translation.validators";

export const translateText: RequestHandler = asyncHandler(async (req, res) => {
  const result = await translationService.translateText(req.body);
  res.status(200).json(result);
});

export const translateAudio: RequestHandler = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, 'An "audio" file is required');
  }

  const { spokenLanguage, targetLanguage } = translateAudioFieldsSchema.parse(req.body);

  const result = await translationService.translateAudio({
    audioBuffer: req.file.buffer,
    mimeType: req.file.mimetype,
    spokenLanguage,
    targetLanguage,
  });

  res.status(200).json(result);
});
