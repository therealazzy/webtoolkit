import { Router } from "express";
import { requireApiKey } from "../middleware/requireApiKey";
import { createInboxController, getInboxController, listInboxesController } from "../controllers/inbox.controller";

const router = Router();

router.use(requireApiKey);

router.post("/",createInboxController);
router.get("/",listInboxesController);
router.get("/:inboxId", getInboxController);
export default router;