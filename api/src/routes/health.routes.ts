import { Router } from "express";
import { getHealth } from "../controllers/health.controller";

const router = Router();

// GET /health - service + database connectivity check
router.get("/", getHealth);

export default router;
