import { describe, it, expect, beforeAll, beforeEach, afterAll } from "vitest";
import express from "express";
import request from "supertest";
import { pinoHttp } from "pino-http";
import { logger } from "../src/lib/logger";
import { createRateLimiter } from "../src/middleware/rateLimiter";
import { redis } from "../src/lib/redis";

const MAX = 3;

function makeApp(windowMs: number) {
    const app = express();
    app.use(pinoHttp({ logger }));
    app.use(createRateLimiter({
        windowMs: windowMs,
        max: MAX,
        keyFn: (req) => req.header("x-client"),
        prefix: "test"
    }));
    app.get("/", (req, res) => res.sendStatus(200));
    return app;
}

describe("createRateLimiter", () => {
    beforeAll(async() =>{
        await redis.connect();
    });
    beforeEach(async() =>{
        await redis.flushDb();
    });
    afterAll(async() =>{
        await redis.close();
    });

    it("allows requests up to max, then returns 429 with Retry-After", async () => {
        const app = makeApp(60_000);

        for (let i = 0; i < MAX; i++) {
            const res = await request(app).get("/").set("x-client", "a");
            expect(res.status).toBe(200);
        }

        const blocked = await request(app).get("/").set("x-client", "a");
        expect(blocked.status).toBe(429);
        expect(blocked.body).toEqual({ error: "Too many requests" });
        expect(blocked.headers["retry-after"]).toBe("60");
    });

    it("allows the client again after the window has passed", async () => {
        const app = makeApp(500);

        for (let i = 0; i < MAX; i++) {
            await request(app).get("/").set("x-client", "a");
        }
        const blocked = await request(app).get("/").set("x-client", "a");
        expect(blocked.status).toBe(429);

        await new Promise((resolve) => setTimeout(resolve, 600));

        const allowed = await request(app).get("/").set("x-client", "a");
        expect(allowed.status).toBe(200);
    });

    it("counts each client separately", async () => {
        const app = makeApp(60_000);

        for (let i = 0; i < MAX + 1; i++) {
            await request(app).get("/").set("x-client", "a");
        }

        const other = await request(app).get("/").set("x-client", "b");
        expect(other.status).toBe(200);
    });

    it("lets requests through when the client can't be identified", async () => {
        const app = makeApp(60_000);

        for (let i = 0; i < MAX + 2; i++) {
            const res = await request(app).get("/"); 
            expect(res.status).toBe(200);
        }
    });
});