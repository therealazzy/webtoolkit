import { Router } from "express";
import { inspectJwtController, verifyJwtController } from "../controllers/jwt.controller";

const router = Router();

router.post("/inspect", inspectJwtController);
router.post("/verify", verifyJwtController);
export default router;