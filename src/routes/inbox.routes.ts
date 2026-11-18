import { Router } from "express";
import { requireApiKey } from "../middleware/requireApiKey";
import { createInboxController, deleteInboxController, getInboxController, getRequestController, listInboxesController, listRequestsController } from "../controllers/inbox.controller";

const router = Router();

router.use(requireApiKey);

router.post("/",createInboxController);
router.get("/",listInboxesController);
router.get("/:inboxId", getInboxController);
router.delete("/:inboxId", deleteInboxController);
router.get("/:inboxId/requests", listRequestsController);
router.get("/:inboxId/requests/:requestId", getRequestController);
export default router;