import { Router } from "express";
import { listUnknownPhrases, updateUnknownPhraseStatus } from "../controllers/unknownPhrase.controller";
import { validateRequest } from "../middlewares/validateRequest";
import {
  listUnknownPhrasesQuerySchema,
  unknownPhraseIdParamSchema,
  updateUnknownPhraseStatusSchema,
} from "../validators/unknownPhrase.validators";

const router = Router();

// GET /unknown-phrases - queue of low-confidence inputs awaiting human review
router.get("/", validateRequest(listUnknownPhrasesQuerySchema, "query"), listUnknownPhrases);

// PATCH /unknown-phrases/:id/status - approve/reject a phrase for future retraining
router.patch(
  "/:id/status",
  validateRequest(unknownPhraseIdParamSchema, "params"),
  validateRequest(updateUnknownPhraseStatusSchema),
  updateUnknownPhraseStatus,
);

export default router;
