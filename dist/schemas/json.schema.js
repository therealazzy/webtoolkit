"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jsonSchema = void 0;
const zod_1 = require("zod");
exports.jsonSchema = zod_1.z.object({
    json: zod_1.z.string()
});
