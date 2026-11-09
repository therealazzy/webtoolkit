import { it, describe, expect, vi, beforeEach } from "vitest"
import request from 'supertest'
import { prisma } from '../src/lib/prisma'
import app from "../src/app.ts"
import { hashApiKey } from "../src/lib/apiKey.ts";

vi.mock("../src/lib/prisma", () => ({
    prisma: {
        apiKey: { findUnique: vi.fn() },
    },
}));

// Valid ApiKey row by default; override fields per test.
// Must be a full row: the mock is typed against the whole model.
function makeApiKey(overrides = {}) {
    return {
      id: "key-1",
      ownerId: "owner-123",
      name: "Test key",
      keyHash: "hash",
      createdAt: new Date(),
      revokedAt: null,
      expiresAt: null,
      ...overrides,
    };
  }
const findUnique = vi.mocked(prisma.apiKey.findUnique);
const UNAUTHORISED = { error: "Invalid or missing API key"};

describe("GET /api/v1/me", () =>{
    beforeEach(() => {
        vi.resetAllMocks();
    });
    it("returns 401 when no API key present", async () =>{
        const response = await request(app).get("/api/v1/me");

        expect(response.status).toBe(401);
        expect(response.body).toEqual(UNAUTHORISED);
        expect(findUnique).not.toHaveBeenCalled();
    }),
    it("returns 200 with the ownerId for a valid key", async() => {
        const ownerId = "owner-abc";
        const rawKey = "wt_dev_valid";
        findUnique.mockResolvedValue(makeApiKey({ ownerId }));

        const response = await request(app).get("/api/v1/me").set("X-API-KEY", rawKey);

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ ownerId });

        expect(findUnique).toHaveBeenCalledWith(
            expect.objectContaining({ where: { keyHash: hashApiKey(rawKey) } }),
        )
    }),
    it("returns 401 when empty API key present", async () =>{
        const response = await request(app).get("/api/v1/me").set("X-API-KEY", "");

        expect(response.status).toBe(401);
        expect(response.body).toEqual(UNAUTHORISED);
        expect(findUnique).not.toHaveBeenCalled();
    }),
    it("returns 401 when wrong API key is used", async () =>{
        findUnique.mockResolvedValue(null)
        const response = await request(app).get("/api/v1/me").set("X-API-KEY", "wt_dev_letmeIN");

        expect(response.status).toBe(401);
        expect(response.body).toEqual(UNAUTHORISED);
    }),
    it("returns 401 on a revoked api key", async () => {
        findUnique.mockResolvedValue(makeApiKey({ revokedAt : new Date()}))
        const response = await request(app).get("/api/v1/me").set("X-API-KEY", "wt_dev_revoked")

        expect(response.status).toBe(401);
        expect(response.body).toEqual(UNAUTHORISED);
        expect(findUnique).toHaveBeenCalled();
    }),
    it("returns 401 when the API key has expired", async () => {
        findUnique.mockResolvedValue(makeApiKey({ expiresAt: new Date(Date.now() - 60_000) }));
        const response = await request(app).get("/api/v1/me").set("X-API-KEY", "wt_dev_expired");

        expect(response.status).toBe(401);
        expect(response.body).toEqual(UNAUTHORISED);
    }),

    it("accepts a key whose expiry date is in the future", async () => {
        findUnique.mockResolvedValue(makeApiKey({ expiresAt: new Date(Date.now() + 60_000) }));
        const response = await request(app).get("/api/v1/me").set("X-API-KEY", "wt_dev_future");

        expect(response.status).toBe(200);
    }),

    it("returns 500 when the database lookup fails", async () => {
        findUnique.mockRejectedValue(new Error("connection timed out"));
        const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

        const response = await request(app).get("/api/v1/me").set("X-API-KEY", "wt_dev_any");

        expect(response.status).toBe(500);
        expect(consoleError).toHaveBeenCalled();
    })
});