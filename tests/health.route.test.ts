import { describe, vi, it, expect } from "vitest";
import { prisma } from "../src/lib/prisma";
import app from "../src/app";
import request from "supertest";

vi.mock("../src/lib/prisma", () =>({
    prisma:{ $queryRaw: vi.fn() },
}));

const queryRaw = vi.mocked(prisma.$queryRaw);

describe("GET / health/", () =>{
    it("returns 200 on checking liveness", async() =>{
        const response = await request(app).get(`/health`);

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            health: "ok"
        });
    }),
    it("database reachable", async() =>{
        queryRaw.mockResolvedValue([]);
        const response = await request(app).get(`/health/readiness`);

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            health: "ok"
        });
    }),
    it("database not reachable", async() =>{
        queryRaw.mockRejectedValue(new Error("db down"));
        const response = await request(app).get(`/health/readiness`);

        expect(response.status).toBe(503);
        expect(response.body).toEqual({
            health: "unavailable"
        });
    })
})