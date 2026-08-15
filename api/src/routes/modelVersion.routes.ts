import { Router } from "express";
import { createModelVersion, getActiveModelVersion, listModelVersions } from "../controllers/modelVersion.controller";
import { validateRequest } from "../middlewares/validateRequest";
import { createModelVersionSchema } from "../validators/modelVersion.validators";

const router = Router();

// GET /model-versions - all deployed model metadata
router.get("/", listModelVersions);

// GET /model-versions/active - the currently deployed model
router.get("/active", getActiveModelVersion);

// POST /model-versions - register a newly trained/deployed model
router.post("/", validateRequest(createModelVersionSchema), createModelVersion);

export default router;
