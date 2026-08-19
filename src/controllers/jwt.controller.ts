import { Request, Response } from "express";
import { inspectJwt } from "../services/jwt.service";
import { verifyJwt } from "../services/jwtVerification.service";
import { jwtSchema, verifyJwtSchema } from "../schemas/jwt.schema";

export function inspectJwtController(req: Request, res: Response) {
    const { token } = jwtSchema.parse(req.body);
    const result = inspectJwt(token);
    res.json(result);
}

export function verifyJwtController(req: Request, res: Response){
    const { token, key } = verifyJwtSchema.parse(req.body);
    verifyJwt(token, key);

    res.json({
        valid: true
    });
}