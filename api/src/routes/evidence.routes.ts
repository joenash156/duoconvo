import { Router } from "express";
import { getAiEvidence } from "../controllers/evidence.controller";
import { validateRequest } from "../middlewares/validateRequest";
import { paginationQuerySchema } from "../validators/pagination.validators";

const router = Router();

// GET /evidence - paginated AI evidence feed for the AI Evidence screen
router.get("/", validateRequest(paginationQuerySchema, "query"), getAiEvidence);

export default router;
