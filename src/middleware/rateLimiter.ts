import { Request, Response, NextFunction } from "express";

type RateLimitOptions = {
    windowMs: number;
    max: number;
    keyFn: (req: Request) => string | undefined;
};

export function createRateLimiter({windowMs, max, keyFn}: RateLimitOptions){
    const hits = new Map<string, {count: number; windowStart: number}>();

    setInterval(() => {
        const now = Date.now();
        for(const [id, entry] of hits){
            if(now - entry.windowStart >= windowMs){
                hits.delete(id);
            }
        }
    }, windowMs).unref();

    return function rateLimiter(req: Request, res: Response, next: NextFunction){

        const id = keyFn(req); //find the identifier (ip address | ownerid) depending on ratelimiter 
        if(id === undefined){
            req.log.warn("identifier does not exist");
            return next();
        }

        const now = Date.now();
        let entry = hits.get(id);
        if(entry === undefined || now - entry.windowStart >= windowMs){
            entry = { count: 0, windowStart:  now};
            hits.set(id, entry);
        }
        entry.count++;
        
        if(entry.count > max){
            const retryAfterSeconds = Math.ceil((entry.windowStart + windowMs - now)/ 1000);
            res.set("Retry-After", String(retryAfterSeconds));
            return res.status(429).json({ error: "Too many requests"});
        }

        next();
    };
}