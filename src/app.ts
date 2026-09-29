import "dotenv/config";
import express from "express";
import jwtRouter from "./routes/jwt.routes";
import jsonRouter from "./routes/json.routes";
import { errorHandler } from "./middleware/errorHandler";

const app = express();

app.use(express.json());
app.use("/api/v1/jwt", jwtRouter);
app.use("/api/v1/json", jsonRouter);
app.use(errorHandler);

export default app;