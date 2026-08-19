import { Request, Response } from "express";
import { inspectJwt } from "../services/jwt.service";
import { jwtSchema } from "../schemas/jwt.schema";

export function inspectJwtController(req: Request, res: Response) {
    const { token } = jwtSchema.parse(req.body);
    const result = inspectJwt(token);
    res.json(result);
}