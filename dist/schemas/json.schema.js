"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jsonDiffSchema = exports.jsonSchema = void 0;
const zod_1 = require("zod");
exports.jsonSchema = zod_1.z.object({
    json: zod_1.z.string()
});
exports.jsonDiffSchema = zod_1.z.object({
    json1: zod_1.z.string(),
    json2: zod_1.z.string()
});
