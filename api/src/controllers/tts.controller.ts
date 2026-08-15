import { RequestHandler } from "express";
import { asyncHandler } from "../middlewares/asyncHandler";
import { describeTtsAvailability, ttsService } from "../services/tts.service";
import { TtsRequestInput, TtsResponse } from "../types/tts.types";

export const synthesizeSpeech: RequestHandler = asyncHandler(async (req, res) => {
  const { text, language } = req.body as TtsRequestInput;
  const audioUrl = await ttsService.synthesize(text, language);

  const response: TtsResponse = { audioUrl, language };

  if (audioUrl === null) {
    const availability = describeTtsAvailability(language);
    if (availability.message) response.message = availability.message;
  }

  res.status(200).json(response);
});
