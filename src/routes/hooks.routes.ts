import express, { Router } from "express";
import { receiveWebhookController } from "../controllers/hooks.controller";

const router = Router();

router.use(express.raw({ type: "*/*", limit: "1mb"}));

router.post("/:inboxId", receiveWebhookController);

export default router;