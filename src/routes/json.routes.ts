import { Router } from "express";
import { formatJsonController, minifyJsonController } from "../controllers/json.controller";

const router = Router();

router.post("/format", formatJsonController);
router.post("/minify", minifyJsonController);

export default router