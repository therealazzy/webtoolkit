import { Request, Response } from "express";
import { inspectJwt } from "../services/jwt.service";

export function inspectJwtController(req: Request, res: Response) {
    const { token } = req.body;
    const result = inspectJwt(token);
    res.json(result);
}