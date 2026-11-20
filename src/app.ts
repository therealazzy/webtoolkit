import "dotenv/config";
import express from "express";
import jwtRouter from "./routes/jwt.routes";
import jsonRouter from "./routes/json.routes";
import meRouter from "./routes/me.routes";
import inboxRouter from "./routes/inbox.routes";
import hooksRouter from "./routes/hooks.routes"
import { errorHandler } from "./middleware/errorHandler";
import { pinoHttp } from "pino-http";
import { logger } from "./lib/logger";


const app = express();

app.use(pinoHttp({ logger }));

app.use("/api", express.json());
app.use("/api/v1/jwt", jwtRouter);
app.use("/api/v1/json", jsonRouter);
app.use("/api/v1/me", meRouter);
app.use("/api/v1/inboxes", inboxRouter);
app.use("/hooks", hooksRouter);
app.use(errorHandler);

export default app;