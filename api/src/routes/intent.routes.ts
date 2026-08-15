import { Router } from "express";
import { createIntent, deleteIntent, getIntent, listIntents, updateIntent } from "../controllers/intent.controller";
import { validateRequest } from "../middlewares/validateRequest";
import { createIntentSchema, intentIdParamSchema, updateIntentSchema } from "../validators/intent.validators";

const router = Router();

// GET /intents - list all intent categories (knowledge base management)
router.get("/", listIntents);

// GET /intents/:id
router.get("/:id", validateRequest(intentIdParamSchema, "params"), getIntent);

// POST /intents - create a new intent category
router.post("/", validateRequest(createIntentSchema), createIntent);

// PATCH /intents/:id
router.patch(
  "/:id",
  validateRequest(intentIdParamSchema, "params"),
  validateRequest(updateIntentSchema),
  updateIntent,
);

// DELETE /intents/:id
router.delete("/:id", validateRequest(intentIdParamSchema, "params"), deleteIntent);

export default router;
