"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inspectJwt = inspectJwt;
const appError_1 = require("../errors/appError");
const jwt_schema_1 = require("../schemas/jwt.schema");
function decodeJsonPart(part) {
    try {
        const decoded = Buffer.from(part, "base64url").toString("utf8");
        return JSON.parse(decoded);
    }
    catch {
        throw new appError_1.AppError("Invalid JWT", 400);
    }
}
function inspectJwt(token) {
    const parts = token.split(".");
    if (parts.length !== 3) {
        throw new appError_1.AppError("Invalid JWT structure", 400);
    }
    const signature = parts[2];
    const header = jwt_schema_1.jwtHeaderSchema.parse(decodeJsonPart(parts[0]));
    const payload = jwt_schema_1.jwtPayloadSchema.parse(decodeJsonPart(parts[1]));
    const expiresAt = payload.exp !== undefined ? new Date(payload.exp * 1000) : undefined;
    const isExpired = expiresAt !== undefined ? expiresAt.getTime() < Date.now() : undefined;
    const issuedAt = payload.iat !== undefined ? new Date(payload.iat * 1000) : undefined;
    return {
        header,
        payload,
        signature,
        expiresAt,
        isExpired,
        issuedAt
    };
}
