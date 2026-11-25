import { Router } from "express";
import { requireApiKey } from "../middleware/requireApiKey";
import { createInboxController, deleteInboxController, getInboxController, getRequestController, listInboxesController, listRequestsController } from "../controllers/inbox.controller";
import { createRateLimiter } from "../middleware/rateLimiter";

const router = Router();

router.use(requireApiKey);
const ownerLimiter = createRateLimiter({windowMs: 60_000, max: 60, keyFn: (req) => req.ownerId, prefix: "owner"});
router.use(ownerLimiter);
router.post("/",createInboxController);
router.get("/",listInboxesController);
router.get("/:inboxId", getInboxController);
router.delete("/:inboxId", deleteInboxController);
router.get("/:inboxId/requests", listRequestsController);
router.get("/:inboxId/requests/:requestId", getRequestController);
export default router;