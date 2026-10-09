import { Router } from "express";
import { diffJsonController, formatJsonController, minifyJsonController } from "../controllers/json.controller";

const router = Router();

router.post("/format", formatJsonController);
router.post("/minify", minifyJsonController);
router.post("/diff", diffJsonController);

export default router