"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getJwtMetadata = getJwtMetadata;
function getJwtMetadata(payload) {
    const expiresAt = payload.exp !== undefined ? new Date(payload.exp * 1000) : undefined;
    const isExpired = expiresAt !== undefined ? expiresAt.getTime() < Date.now() : undefined;
    const issuedAt = payload.iat !== undefined ? new Date(payload.iat * 1000) : undefined;
    return {
        expiresAt,
        isExpired,
        issuedAt
    };
}
