import { Router } from "express";
import { upload } from "../configs/multer";
import { translateAudio, translateText } from "../controllers/translation.controller";
import { validateRequest } from "../middlewares/validateRequest";
import { translateTextSchema } from "../validators/translation.validators";

const router = Router();

// POST /translate/text - translate typed text through the semantic retrieval pipeline
router.post("/text", validateRequest(translateTextSchema), translateText);

// POST /translate/audio - transcribe spoken audio, then run it through the same pipeline
router.post("/audio", upload.single("audio"), translateAudio);

export default router;
