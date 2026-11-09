import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/appError";
import { hashApiKey } from "../lib/apiKey";
import { prisma } from "../lib/prisma";

const UNAUTHORISED_MESSAGE = "Invalid or missing API key";

export async function requireApiKey(req: Request, res: Response, next: NextFunction){
    const rawKey = req.get("x-api-key")
    if(!rawKey){
        throw new AppError(UNAUTHORISED_MESSAGE, 401);
    }
    const keyHash = hashApiKey(rawKey)
    const apiKey = await prisma.apiKey.findUnique({
        where: { keyHash },
        select: { ownerId: true, revokedAt : true, expiresAt : true },
    });
    if(!apiKey){
        throw new AppError(UNAUTHORISED_MESSAGE, 401);
    }
    if(apiKey.revokedAt != null){
        throw new AppError(UNAUTHORISED_MESSAGE, 401);
    }
    new Date();
    if(apiKey.expiresAt != null && apiKey.expiresAt.getTime() <= Date.now()){
        throw new AppError(UNAUTHORISED_MESSAGE, 401);
    }

    req.ownerId = apiKey.ownerId;
    next();
}