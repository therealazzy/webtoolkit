import { Router } from "express";
import { requireApiKey } from "../middleware/requireApiKey";
import { createInboxController, deleteInboxController, getInboxController, listInboxesController, listRequestsController } from "../controllers/inbox.controller";

const router = Router();

router.use(requireApiKey);

router.post("/",createInboxController);
router.get("/",listInboxesController);
router.get("/:inboxId", getInboxController);
router.delete("/:inboxId", deleteInboxController);
router.get("/:inboxId/requests", listRequestsController);
export default router;