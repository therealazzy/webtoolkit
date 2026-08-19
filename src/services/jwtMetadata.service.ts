import type { JwtPayload } from "../schemas/jwt.schema";

export function getJwtMetadata(payload: JwtPayload){
    const expiresAt = payload.exp !== undefined ? new Date(payload.exp * 1000) : undefined;
    const isExpired = expiresAt !== undefined ? expiresAt.getTime() < Date.now() : undefined;
    const issuedAt = payload.iat !== undefined ? new Date(payload.iat * 1000) : undefined;
    const notBefore = payload.nbf !== undefined ? new Date(payload.nbf * 1000) : undefined;
    const isActive = notBefore !== undefined ? Date.now() >= notBefore.getTime(): undefined;

    return{
        expiresAt,
        isExpired,
        issuedAt,
        notBefore,
        isActive
    };
}