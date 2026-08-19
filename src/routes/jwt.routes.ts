import { Router } from "express";
import { inspectJwtController } from "../controllers/jwt.controller";

const router = Router();

router.post("/inspect", inspectJwtController);

export default router;