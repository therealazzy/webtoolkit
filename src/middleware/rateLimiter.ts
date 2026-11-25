import { Request, Response, NextFunction } from "express";
import { redis } from "../lib/redis";

type RateLimitOptions = {
    prefix: string;
    windowMs: number;
    max: number;
    keyFn: (req: Request) => string | undefined;
};

export function createRateLimiter({windowMs, max, keyFn, prefix}: RateLimitOptions){
    

    return async function rateLimiter(req: Request, res: Response, next: NextFunction){

        const id = keyFn(req); //find the identifier (ip address | ownerid) depending on ratelimiter 
        if(id === undefined){
            req.log.warn("identifier does not exist");
            return next();
        }

        const key = `rl:${prefix}:${id}`;

        let count: number;
        let ttl: number;
        try {
            const entry = await redis.multi().incr(key).pExpire(key, windowMs, "NX").pTTL(key).exec();
            count = Number(entry[0]);
            ttl = Number(entry[2]);
        } catch (err) {
            req.log.warn({err}, "Redis entry error");
            return next();
        }

        if(count > max){
            const retryAfterSeconds = Math.ceil(ttl/ 1000);
            res.set("Retry-After", String(retryAfterSeconds));
            return res.status(429).json({ error: "Too many requests"});
        }

        next();
    };
}