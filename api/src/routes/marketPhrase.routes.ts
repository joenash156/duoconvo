import { Router } from "express";
import {
  createMarketPhrase,
  deleteMarketPhrase,
  getMarketPhrase,
  listMarketPhrases,
  updateMarketPhrase,
} from "../controllers/marketPhrase.controller";
import { validateRequest } from "../middlewares/validateRequest";
import {
  createMarketPhraseSchema,
  listMarketPhrasesQuerySchema,
  marketPhraseIdParamSchema,
  updateMarketPhraseSchema,
} from "../validators/marketPhrase.validators";

const router = Router();

// GET /market-phrases - paginated knowledge base listing, optionally filtered by intentId
router.get("/", validateRequest(listMarketPhrasesQuerySchema, "query"), listMarketPhrases);

// GET /market-phrases/:id
router.get("/:id", validateRequest(marketPhraseIdParamSchema, "params"), getMarketPhrase);

// POST /market-phrases - add a new canonical phrase (must reference an existing intent)
router.post("/", validateRequest(createMarketPhraseSchema), createMarketPhrase);

// PATCH /market-phrases/:id
router.patch(
  "/:id",
  validateRequest(marketPhraseIdParamSchema, "params"),
  validateRequest(updateMarketPhraseSchema),
  updateMarketPhrase,
);

// DELETE /market-phrases/:id
router.delete("/:id", validateRequest(marketPhraseIdParamSchema, "params"), deleteMarketPhrase);

export default router;
