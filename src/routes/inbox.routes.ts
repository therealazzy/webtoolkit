import { Router } from "express";
import { requireApiKey } from "../middleware/requireApiKey";
import { createInboxController } from "../controllers/inbox.controller";

const router = Router();

router.use(requireApiKey);

router.post("/",createInboxController);

export default router;