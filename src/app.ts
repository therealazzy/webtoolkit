import "dotenv/config";
import express from "express";
import helmet from "helmet";
import jwtRouter from "./routes/jwt.routes";
import jsonRouter from "./routes/json.routes";
import meRouter from "./routes/me.routes";
import inboxRouter from "./routes/inbox.routes";
import hooksRouter from "./routes/hooks.routes";
import healthRouter from "./routes/health.routes";
import { errorHandler } from "./middleware/errorHandler";
import { pinoHttp } from "pino-http";
import { logger } from "./lib/logger";
import { createRateLimiter } from "./middleware/rateLimiter";
import { notFoundMiddleware } from "./middleware/notFound";


const app = express();
app.set("trust proxy", 2);
app.disable("x-powered-by");
app.use(pinoHttp({
    logger,
    customProps: (req) => ({clientIp: (req.ip)}), 
}));
app.use(helmet());

app.use("/health", healthRouter);

const ipLimiter = createRateLimiter({windowMs: 60_000, max: 100, keyFn: (req) => req.ip, prefix: "ip"});
app.use(ipLimiter);

app.get("/", (req, res) => {res.json({ name: "WebToolkit API", version: "1", health: "/health" })});

app.use("/api", express.json({ limit: "100kb"}));
app.use("/api/v1/jwt", jwtRouter);
app.use("/api/v1/json", jsonRouter);
app.use("/api/v1/me", meRouter);
app.use("/api/v1/inboxes", inboxRouter);
app.use("/hooks", hooksRouter);
app.use(notFoundMiddleware);
app.use(errorHandler);

export default app;