import crypto from "crypto";
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

function parseJwt(token: string){

    const parts = token.split(".");
    if(parts.length !== 3){
        throw new AppError("Invalid jwt", 400);
    }

    const signature = parts[2];
    const header = jwtHeaderSchema.parse(decodeJsonPart(parts[0]));
    const payload  = jwtPayloadSchema.parse(decodeJsonPart(parts[1]));
    return{
        header,
        payload,
        signature
    }
}


export function verifyJwt(token: string, key: string){
    const { header } = parseJwt(token);
    switch (header.alg) {
        case "RS256":
            verifyRs256Signature(token, key);
            break;
        case "HS256":
            verifyHs256Signature(token, key);
            break;
        default:
            throw new AppError("Algo not supported", 400);
            break;
    }
}



export function verifyRs256Signature(token: string, pKey: string){
    const parts = token.split(".");

    const signed = `${parts[0]}.${parts[1]}`;
    const signature = Buffer.from(parts[2], "base64url");

    const isValid = crypto.verify("RSA-SHA256", Buffer.from(signed), pKey, signature);
    if(!isValid){
        throw new AppError("Invalid signature", 400);
    }
}



export function verifyHs256Signature(token: string, secret: string){
    const parts = token.split(".");

    const signInput = `${parts[0]}.${parts[1]}`;
    const signature = crypto.createHmac("sha256", secret).update(signInput).digest("base64url");

    const expected = Buffer.from(signature);
    const actual = Buffer.from(parts[2]);

    if(
        expected.length !== actual.length || !crypto.timingSafeEqual(expected, actual)
    ){
        throw new AppError("Invalid signature", 400)
    }
}