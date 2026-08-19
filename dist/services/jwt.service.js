"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inspectJwt = inspectJwt;
function inspectJwt(token) {
    const parts = token.split(".");
    const header = JSON.parse(Buffer.from(parts[0], "base64url").toString("utf8"));
    const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"));
    if (parts.length !== 3) {
        throw new Error("Invalid JWT structure");
    }
    return {
        header,
        payload
    };
}
