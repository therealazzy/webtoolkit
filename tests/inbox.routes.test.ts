    import { it, describe, expect, vi, beforeEach } from "vitest"
    import request from 'supertest'
    import { prisma } from '../src/lib/prisma'
    import app from "../src/app.ts"

    vi.mock("../src/lib/prisma", () =>({
        prisma: {
            apiKey: { findUnique: vi.fn() },
            webhookInbox: { create: vi.fn(), findMany: vi.fn() },
        }
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


    function makeInbox(overrides = {}) {
        return {
            id: "id-1",
            ownerId: "owner-123",
            createdAt: new Date("2026-11-10T12:00:00.000Z"),
            expiresAt: new Date("2026-11-11T12:00:00.000Z"),
            ...overrides,
        };
    }

    const findUnique = vi.mocked(prisma.apiKey.findUnique);
    const create = vi.mocked(prisma.webhookInbox.create);
    const findMany = vi.mocked(prisma.webhookInbox.findMany);
    const UNAUTHORISED = { error: "Invalid or missing API key"};

    describe("POST /api/v1/inboxes", () =>{
        beforeEach(() =>{
            vi.resetAllMocks();
        });
        it("returns a 401 when no key present", async () => {
            const response = await request(app).post("/api/v1/inboxes");

            expect(response.status).toBe(401);
            expect(response.body).toEqual(UNAUTHORISED);
            expect(create).not.toHaveBeenCalled();
        }),
        it("returns 201 for a successful creation of an inbox with valid input", async () =>{
            const ownerId = "owner-abc";
            const inboxId = "inboc-abc";
            const inbox = makeInbox({ id: inboxId, ownerId});
            findUnique.mockResolvedValue(makeApiKey({ ownerId }));
            create.mockResolvedValue(inbox);

            const response = await request(app).post("/api/v1/inboxes").set("X-API-KEY", "wt_dev_valid");

            expect(response.status).toBe(201);
            expect(response.headers.location).toBe(`/api/v1/inboxes/${inboxId}`);
            expect(response.body).toEqual({
                id: inboxId,
                expiresAt: inbox.expiresAt.toISOString(),
                webhookUrl: `http://localhost:3000/hooks/${inboxId}`,
            });
        }),
        it("creates the inbox for the owner of the API key", async () =>{
            const ownerId = "owner-abc";
            const inbox = makeInbox({ ownerId });
            findUnique.mockResolvedValue(makeApiKey({ ownerId }));
            create.mockResolvedValue(inbox);

            await request(app).post("/api/v1/inboxes").set("X-API-KEY", "wt_dev_valid");

            expect(create).toHaveBeenCalledWith({
                data: { ownerId, expiresAt: expect.any(Date) }
            });
        }),
        it("ignores an ownerId sent from the client in the request body", async () =>{
            const ownerId = "owner-abc";
            const inbox = makeInbox({ ownerId });
            findUnique.mockResolvedValue(makeApiKey({ ownerId }));
            create.mockResolvedValue(inbox);

            await request(app).post("/api/v1/inboxes").set("X-API-KEY", "wt_dev_valid").send({ ownerId: "someone-else"});

            expect(create).toHaveBeenCalledWith({
                data: { ownerId, expiresAt: expect.any(Date) }
            });
        }),
        it("returns a 401 when no key present for GET inboxes", async () => {
            const response = await request(app).get("/api/v1/inboxes");

            expect(response.status).toBe(401);
            expect(response.body).toEqual(UNAUTHORISED);
            expect(findMany).not.toHaveBeenCalled();
        }),
        it("returns inboxes", async () => {
            const ownerId = " owner-abc";
            const first = makeInbox({ id: "inbox-1", ownerId});
            const second = makeInbox({ id: "inbox-2", ownerId});
            findUnique.mockResolvedValue(makeApiKey({ ownerId }));
            findMany.mockResolvedValue([first, second]);
            
            
            const response = await request(app).get("/api/v1/inboxes").set("X-API-KEY", "wt_dev_valid");
            
            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                inboxes: [
                    { "id": first.id,
                    "expiresAt": first.expiresAt.toISOString(),
                    "webhookUrl": `http://localhost:3000/hooks/${first.id}`
                    },
                    { "id": second.id,
                    "expiresAt": second.expiresAt.toISOString(),
                    "webhookUrl": `http://localhost:3000/hooks/${second.id}`
                    }
                ]
            })
        }),
        it("returns inboxes scoped & sorted correctly", async () => {
            const ownerId = " owner-abc";
            const first = makeInbox({ id: "inbox-1", ownerId});
            const second = makeInbox({ id: "inbox-2", ownerId});
            findUnique.mockResolvedValue(makeApiKey({ ownerId }));
            findMany.mockResolvedValue([first, second]);
            
            
            await request(app).get("/api/v1/inboxes").set("X-API-KEY", "wt_dev_valid");
            
            expect(findMany).toHaveBeenCalledWith({
                where: { ownerId }, orderBy: { createdAt: "desc" }
            })
        })
    });
        