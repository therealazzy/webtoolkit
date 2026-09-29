"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const jwt_routes_1 = __importDefault(require("./routes/jwt.routes"));
const json_routes_1 = __importDefault(require("./routes/json.routes"));
const errorHandler_1 = require("./middleware/errorHandler");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use("/api/v1/jwt", jwt_routes_1.default);
app.use("/api/v1/json", json_routes_1.default);
app.use(errorHandler_1.errorHandler);
exports.default = app;
