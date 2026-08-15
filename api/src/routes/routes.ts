import { Router } from "express";
import conversationRouter from "./conversation.routes";
import evidenceRouter from "./evidence.routes";
import healthRouter from "./health.routes";
import intentRouter from "./intent.routes";
import marketPhraseRouter from "./marketPhrase.routes";
import modelVersionRouter from "./modelVersion.routes";
import translationRouter from "./translation.routes";
import unknownPhraseRouter from "./unknownPhrase.routes";

const router = Router();

router.use("/translate", translationRouter);
router.use("/conversations", conversationRouter);
router.use("/evidence", evidenceRouter);
router.use("/health", healthRouter);
router.use("/intents", intentRouter);
router.use("/market-phrases", marketPhraseRouter);
router.use("/unknown-phrases", unknownPhraseRouter);
router.use("/model-versions", modelVersionRouter);

export default router;
