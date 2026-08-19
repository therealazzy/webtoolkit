import type { JwtPayload } from "../schemas/jwt.schema";

export function getJwtMetadata(payload: JwtPayload){
    const expiresAt = payload.exp !== undefined ? new Date(payload.exp * 1000) : undefined;
    const isExpired = expiresAt !== undefined ? expiresAt.getTime() < Date.now() : undefined;
    const issuedAt = payload.iat !== undefined ? new Date(payload.iat * 1000) : undefined;

    return{
        expiresAt,
        isExpired,
        issuedAt
    };
}