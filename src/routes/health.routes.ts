import { Router } from "express";
import { liveness, readiness } from "../controllers/health.controller";

const router = Router();

router.get("/", liveness);
router.get("/readiness", readiness);

export default router;