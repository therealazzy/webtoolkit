import crypto from "crypto";
import { AppError } from "../errors/appError";
import { jwtHeaderSchema, JwtPayload, jwtPayloadSchema } from "../schemas/jwt.schema";
import { getJwtMetadata } from "./jwtMetadata.service";

function decodeJsonPart(part: string){
    try {
        const decoded = Buffer.from(part, "base64url").toString("utf8");
        return JSON.parse(decoded);
    } catch {
        throw new AppError("Invalid JWT", 400)
    }
}

function parseJwt(token: string){

    const parts = token.split(".");
    if(parts.length !== 3){
        throw new AppError("Invalid jwt", 400);
    }

    const signature = parts[2];
    const header = jwtHeaderSchema.parse(decodeJsonPart(parts[0]));
    const payload  = jwtPayloadSchema.parse(decodeJsonPart(parts[1]));
    const signing = `${parts[0]}.${parts[1]}`;
    return{
        header,
        payload,
        signature,
        signing
    }
}


export function verifyJwt(token: string, key: string, claims?: Record<string, string>){
    const { header, payload, signature, signing } = parseJwt(token);
    const { isExpired, isActive } = getJwtMetadata(payload);
    switch (header.alg) {
        case "RS256":
            verifyRs256Signature(signing, signature, key);
            break;
        case "HS256":
            verifyHs256Signature(signing, signature, key);
            break;
        default:
            throw new AppError("Algo not supported", 400);
    }
    if(isExpired === true){
        throw new AppError("Token expired", 400);
    }
    if(isActive === false){
        throw new AppError("Token not active", 400);
    }
    if(claims){
        validateClaims(payload, claims);
    }
}



export function verifyRs256Signature(signing: string, signature: string, pKey: string){
    const signatureBuffer= Buffer.from(signature, "base64url");

    const isValid = crypto.verify("RSA-SHA256", Buffer.from(signing), pKey, signatureBuffer);
    if(!isValid){
        throw new AppError("Invalid signature", 400);
    }
}



export function verifyHs256Signature(signing: string, signature: string, secret: string){

    const expectedSignature = crypto.createHmac("sha256", secret).update(signing).digest("base64url");

    const expected = Buffer.from(expectedSignature);
    const actual = Buffer.from(signature);

    if(
        expected.length !== actual.length || !crypto.timingSafeEqual(expected, actual)
    ){
        throw new AppError("Invalid signature", 400)
    }
}


export function validateClaims(payload: JwtPayload, claims: Record<string, string>){
    for (const [key, value] of Object.entries(claims)){
        if(!Object.hasOwn(payload, key)){
            throw new AppError("Claim missing", 400);
        }
        if(payload[key] !== value){
            throw new AppError("Mismatched claim", 400);
        }
    }
}