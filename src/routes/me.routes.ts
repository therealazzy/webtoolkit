import { Router } from "express"
import { meController } from "../controllers/me.controller";
import { requireApiKey } from "../middleware/requireApiKey";

const router = Router();
router.use(requireApiKey);

router.get("/", meController);

export default router;