import "dotenv/config";
import express from "express";
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


const app = express();

app.set("trust proxy", 1);
app.use(pinoHttp({ logger }));
const ipLimiter = createRateLimiter({windowMs: 60_000, max: 100, keyFn: (req) => req.ip});
app.use("/health", healthRouter);
app.use(ipLimiter);
app.use("/api", express.json());
app.use("/api/v1/jwt", jwtRouter);
app.use("/api/v1/json", jsonRouter);
app.use("/api/v1/me", meRouter);
app.use("/api/v1/inboxes", inboxRouter);
app.use("/hooks", hooksRouter);
app.use(errorHandler);

export default app;