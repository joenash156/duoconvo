import { Router } from "express";
import { getAiEvidence, getEvidenceSummary } from "../controllers/evidence.controller";
import { validateRequest } from "../middlewares/validateRequest";
import { paginationQuerySchema } from "../validators/pagination.validators";

const router = Router();

// GET /evidence/summary - aggregate stats for the Metrics -> Dashboard tab.
// Registered before "/" only for readability; "/summary" and "/" can't
// actually collide since neither is a param route.
router.get("/summary", getEvidenceSummary);

// GET /evidence - paginated AI evidence feed for the Metrics -> History tab
router.get("/", validateRequest(paginationQuerySchema, "query"), getAiEvidence);

export default router;
