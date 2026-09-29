import { Router } from "express";
import { formatJsonController } from "../controllers/json.controller";

const router = Router();

router.post("/format", formatJsonController);

export default router