"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyJwt = verifyJwt;
exports.verifyRs256Signature = verifyRs256Signature;
exports.verifyHs256Signature = verifyHs256Signature;
exports.validateClaims = validateClaims;
const crypto_1 = __importDefault(require("crypto"));
const appError_1 = require("../errors/appError");
const jwt_schema_1 = require("../schemas/jwt.schema");
const jwtMetadata_service_1 = require("./jwtMetadata.service");
function decodeJsonPart(part) {
    try {
        const decoded = Buffer.from(part, "base64url").toString("utf8");
        return JSON.parse(decoded);
    }
    catch {
        throw new appError_1.AppError("Invalid JWT", 400);
    }
}
function parseJwt(token) {
    const parts = token.split(".");
    if (parts.length !== 3) {
        throw new appError_1.AppError("Invalid jwt", 400);
    }
    const signature = parts[2];
    const header = jwt_schema_1.jwtHeaderSchema.parse(decodeJsonPart(parts[0]));
    const payload = jwt_schema_1.jwtPayloadSchema.parse(decodeJsonPart(parts[1]));
    const signing = `${parts[0]}.${parts[1]}`;
    return {
        header,
        payload,
        signature,
        signing
    };
}
function verifyJwt(token, key, claims) {
    const { header, payload, signature, signing } = parseJwt(token);
    const { isExpired, isActive } = (0, jwtMetadata_service_1.getJwtMetadata)(payload);
    switch (header.alg) {
        case "RS256":
            verifyRs256Signature(signing, signature, key);
            break;
        case "HS256":
            verifyHs256Signature(signing, signature, key);
            break;
        default:
            throw new appError_1.AppError("Algo not supported", 400);
    }
    if (isExpired === true) {
        throw new appError_1.AppError("Token expired", 400);
    }
    if (isActive === false) {
        throw new appError_1.AppError("Token not active", 400);
    }
    if (claims) {
        validateClaims(payload, claims);
    }
}
function verifyRs256Signature(signing, signature, pKey) {
    const signatureBuffer = Buffer.from(signature, "base64url");
    const isValid = crypto_1.default.verify("RSA-SHA256", Buffer.from(signing), pKey, signatureBuffer);
    if (!isValid) {
        throw new appError_1.AppError("Invalid signature", 400);
    }
}
function verifyHs256Signature(signing, signature, secret) {
    const expectedSignature = crypto_1.default.createHmac("sha256", secret).update(signing).digest("base64url");
    const expected = Buffer.from(expectedSignature);
    const actual = Buffer.from(signature);
    if (expected.length !== actual.length || !crypto_1.default.timingSafeEqual(expected, actual)) {
        throw new appError_1.AppError("Invalid signature", 400);
    }
}
function validateClaims(payload, claims) {
    for (const [key, value] of Object.entries(claims)) {
        if (!Object.hasOwn(payload, key)) {
            throw new appError_1.AppError("Claim missing", 400);
        }
        if (payload[key] !== value) {
            throw new appError_1.AppError("Mismatched claim", 400);
        }
    }
}
