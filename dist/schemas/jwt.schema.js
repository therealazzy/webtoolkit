"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jwtSchema = void 0;
const zod_1 = require("zod");
exports.jwtSchema = zod_1.z.object({
    token: zod_1.z.string()
});
