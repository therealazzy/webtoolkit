"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyJwtSchema = exports.jwtPayloadSchema = exports.jwtHeaderSchema = exports.jwtSchema = void 0;
const zod_1 = require("zod");
exports.jwtSchema = zod_1.z.object({
    token: zod_1.z.string()
});
exports.jwtHeaderSchema = zod_1.z.object({
    alg: zod_1.z.string(),
    typ: zod_1.z.string().optional()
});
exports.jwtPayloadSchema = zod_1.z.object({
    exp: zod_1.z.number().optional(),
    iat: zod_1.z.number().optional(),
    nbf: zod_1.z.number().optional(),
    sub: zod_1.z.string().optional(),
    name: zod_1.z.string().optional(),
}).catchall(zod_1.z.unknown());
exports.verifyJwtSchema = zod_1.z.object({
    token: zod_1.z.string(),
    key: zod_1.z.string(),
    claims: zod_1.z.record(zod_1.z.string(), zod_1.z.string()).optional()
});
