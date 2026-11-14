import { Router } from "express";
import { requireApiKey } from "../middleware/requireApiKey";
import { createInboxController, deleteInboxController, getInboxController, listInboxesController } from "../controllers/inbox.controller";

const router = Router();

router.use(requireApiKey);

router.post("/",createInboxController);
router.get("/",listInboxesController);
router.get("/:inboxId", getInboxController);
router.delete("/:inboxId", deleteInboxController);
export default router;