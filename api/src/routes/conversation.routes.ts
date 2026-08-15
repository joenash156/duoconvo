import { Router } from "express";
import { getConversationHistory } from "../controllers/conversation.controller";
import { validateRequest } from "../middlewares/validateRequest";
import { paginationQuerySchema } from "../validators/pagination.validators";

const router = Router();

// GET /conversations - paginated conversation history for the History screen
router.get("/", validateRequest(paginationQuerySchema, "query"), getConversationHistory);

export default router;
