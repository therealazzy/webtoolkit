import { Request, Response } from "express";

export function meController(req: Request, res: Response){
    if(req.ownerId == null){
        throw new Error("ownerid not set?")
    }
    const ownerId = req.ownerId;
    res.json({ "ownerId": ownerId})
}