import { Router } from "express";
import { diffJsonController, formatJsonController, minifyJsonController, validateJsonController } from "../controllers/json.controller";

const router = Router();

router.post("/format", formatJsonController);
router.post("/minify", minifyJsonController);
router.post("/diff", diffJsonController);
router.post("/validate", validateJsonController);

export default router