import { describe, it, vi, expect,beforeEach } from "vitest"
import { prisma } from "../src/lib/prisma"
import request from 'supertest'
import app from '../src/app'

vi.mock("../src/lib/prisma", () =>({
    prisma: {
        webhookInbox: { findUnique: vi.fn()},
        webhookRequest: { create: vi.fn()}
    }
}));

function makeInbox(overrides = {}) {
    return {
        id: "id-1",
        ownerId: "owner-123",
        createdAt: new Date("2026-11-10T12:00:00.000Z"),
        expiresAt: new Date("2026-11-21T12:00:00.000Z"),
        ...overrides,
    };
}

const findunique = vi.mocked(prisma.webhookInbox.findUnique);
const create = vi.mocked(prisma.webhookRequest.create);

describe("POST /hooks/", () => {
    beforeEach(() => {
        vi.resetAllMocks();
    })
    const inboxID = "00000000-0000-4000-8000-000000000001";

    it("succeeds when valid id is provided", async () =>{
        findunique.mockResolvedValue(makeInbox({ id: inboxID}));

        const response = await request(app).post(`/hooks/${inboxID}`).set("Content-type","application/json").send('{"event":"ping"}');

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ received: true});
        expect(create).toHaveBeenCalled();
    }),
    it("json body stored byte for byte", async () => {
        findunique.mockResolvedValue(makeInbox({ id: inboxID}));
        const payload = '{"event":"ping"}';

        await request(app).post(`/hooks/${inboxID}`).set("Content-type","application/json").send(payload);

        const { data } = create.mock.calls[0][0];
        expect(Buffer.from(data.body).toString()).toBe(payload);
    }),
    it("non-json body stored and processed correctly", async () =>{
        findunique.mockResolvedValue(makeInbox({id: inboxID}));
        const payload = "some test text";

        await request(app).post(`/hooks/${inboxID}`).set("Content-type","text/plain").send(payload);


        const { data } = create.mock.calls[0][0];
        expect(Buffer.from(data.body).toString()).toBe(payload);
    }),
    it("captures all the fields from a request", async () => {
        findunique.mockResolvedValue(makeInbox({id: inboxID}));
        const payload = '{"event":"ping"}';

        await request(app).post(`/hooks/${inboxID}?source=test`).set("Content-type","application/json").set("X-test-header","hello").send(payload);

        const { data } = create.mock.calls[0][0];
        expect(data.method).toBe("POST");
        expect(data.queryParams).toEqual({ source: "test"});
        expect(data.contentType).toBe("application/json");
        expect(data.headers["x-test-header"]).toBe("hello");
    }),
    it("Invalid ID returns 400", async () => {
        const badID = "oops"
        const response = await request(app).post(`/hooks/${badID}`).set("Content-type","text/plain");

        expect(create).not.toHaveBeenCalled();
        expect(findunique).not.toHaveBeenCalled();
        expect(response.status).toBe(400);
    }),
    it("unknown inbox returns 404", async () =>{
        findunique.mockResolvedValue(null);

        const response = await request(app).post(`/hooks/${inboxID}`).set("Content-type","application/json");

        expect(create).not.toHaveBeenCalled();
        expect(response.body).toEqual({error: "Inbox not found"});
    }),
    it("Returns a 410 on an expired inbox", async () =>{
        findunique.mockResolvedValue(makeInbox({id: inboxID, expiresAt : new Date("2026-11-11T12:00:00.000Z")}));

        const response = await request(app).post(`/hooks/${inboxID}`).set("Content-type","application/json");

        expect(create).not.toHaveBeenCalled();
        expect(response.status).toBe(410);
        expect(response.body).toEqual({ error: "Inbox is expired"});
    }),
    it("returns 500 for databse failure", async () =>{
        findunique.mockRejectedValue(new Error("db down"));
        const response = await request(app).post(`/hooks/${inboxID}`).set("Content-type","application/json");

        expect(response.status).toBe(500);
        expect(create).not.toHaveBeenCalled();
    }),
    it("returns a 413 on oversized body", async () =>{
        const oversized = "x".repeat(1024 * 1024 + 1);

        const response = await request(app).post(`/hooks/${inboxID}`).set("Content-type","application/json").send(oversized);

        expect(response.status).toBe(413);
        expect(create).not.toHaveBeenCalled();
        expect(findunique).not.toHaveBeenCalled();
    })
})