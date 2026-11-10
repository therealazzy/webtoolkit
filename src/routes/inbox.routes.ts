import { Router } from "express";
import { requireApiKey } from "../middleware/requireApiKey";
import { createInboxController, listInboxesController } from "../controllers/inbox.controller";

const router = Router();

router.use(requireApiKey);

router.post("/",createInboxController);
router.get("/",listInboxesController);

export default router;