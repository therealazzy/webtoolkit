import { describe, it, expect, afterEach, vi } from "vitest";
import express from "express";
import request from "supertest";
import { pinoHttp } from "pino-http";
import { logger } from "../src/lib/logger";
import { createRateLimiter } from "../src/middleware/rateLimiter";

const WINDOW_MS = 60_000;
const MAX = 3;

function makeApp() {
    const app = express();
    app.use(pinoHttp({ logger }));
    app.use(createRateLimiter({
        windowMs: WINDOW_MS,
        max: MAX,
        keyFn: (req) => req.header("x-client"),
    }));
    app.get("/", (req, res) => res.sendStatus(200));
    return app;
}

describe("createRateLimiter", () => {
    afterEach(() => {
        vi.useRealTimers();
    });

    it("allows requests up to max, then returns 429 with Retry-After", async () => {
        const app = makeApp();

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
        vi.useFakeTimers({ toFake: ["Date"] });
        vi.setSystemTime(new Date("2030-01-01T00:00:00Z"));
        const app = makeApp();

        for (let i = 0; i < MAX; i++) {
            await request(app).get("/").set("x-client", "a");
        }
        const blocked = await request(app).get("/").set("x-client", "a");
        expect(blocked.status).toBe(429);

        vi.setSystemTime(new Date("2030-01-01T00:01:00Z"));

        const allowed = await request(app).get("/").set("x-client", "a");
        expect(allowed.status).toBe(200);
    });

    it("counts each client separately", async () => {
        const app = makeApp();

        for (let i = 0; i < MAX + 1; i++) {
            await request(app).get("/").set("x-client", "a");
        }

        const other = await request(app).get("/").set("x-client", "b");
        expect(other.status).toBe(200);
    });

    it("lets requests through when the client can't be identified", async () => {
        const app = makeApp();

        for (let i = 0; i < MAX + 2; i++) {
            const res = await request(app).get("/"); 
            expect(res.status).toBe(200);
        }
    });
});