import { AppError } from "../errors/appError";
import { jwtHeaderSchema, jwtPayloadSchema } from "../schemas/jwt.schema";


function decodeJsonPart(part: string){
    try {
        const decoded = Buffer.from(part, "base64url").toString("utf8");
        return JSON.parse(decoded);
    } catch {
        throw new AppError("Invalid JWT", 400)
    }
}
export function inspectJwt(token: string) {

    const parts = token.split(".");

    if(parts.length !==  3){
        throw new AppError("Invalid JWT structure", 400)
    }

    const signature = parts[2];
    const header = jwtHeaderSchema.parse(decodeJsonPart(parts[0]));
    const payload = jwtPayloadSchema.parse(decodeJsonPart(parts[1]));

    const expiresAt = payload.exp !== undefined ? new Date(payload.exp * 1000) : undefined;
    const isExpired = expiresAt !== undefined ? expiresAt.getTime() < Date.now() : undefined;
    const issuedAt = payload.iat !== undefined ? new Date(payload.iat * 1000) : undefined;


    return{
        header,
        payload,
        signature,
        expiresAt,
        isExpired,
        issuedAt
    };
}