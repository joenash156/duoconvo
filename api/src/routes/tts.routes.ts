import { Router } from "express";
import { synthesizeSpeech } from "../controllers/tts.controller";
import { validateRequest } from "../middlewares/validateRequest";
import { ttsRequestSchema } from "../validators/tts.validators";

const router = Router();

// POST /tts - generate backend audio for languages without on-device TTS support (Twi/Ga/Ewe).
// English/French are expected to be spoken on-device by the mobile app instead.
router.post("/", validateRequest(ttsRequestSchema), synthesizeSpeech);

export default router;
