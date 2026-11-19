    import { it, describe, expect, vi, beforeEach } from "vitest"
    import request from 'supertest'
    import { prisma } from '../src/lib/prisma'
    import app from "../src/app"
import { date } from "zod";

    vi.mock("../src/lib/prisma", () =>({
        prisma: {
            apiKey: { findUnique: vi.fn() },
            webhookInbox: { create: vi.fn(), findMany: vi.fn(), findFirst: vi.fn(), deleteMany: vi.fn() },
            webhookRequest: {findMany: vi.fn(), findFirst: vi.fn() }
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
            expiresAt: new Date("2099-11-11T12:00:00.000Z"),
            ...overrides,
        };
    }

    function makeRequestSummary(overrides = {}) {
        return { 
            id: "00000000-0000-4000-8000-000000000001",
            method: "POST",
            contentType: "application/json",
            createdAt: new Date("2026-11-18T12:00:00.000Z"),
            ...overrides,
        };
    }

    function makeRequest(overrides = {}) {
        return {
            id: "00000000-0000-4000-8000-0000000000a1",
            inboxId: "00000000-0000-4000-8000-000000000001",
            method: "POST",
            headers: { "content-type": "application/json" },
            queryParams: {},
            body: new Uint8Array(Buffer.from('{"event":"ping"}')),
            contentType: "application/json",
            createdAt: new Date("2026-11-18T12:00:00.000Z"),
            ...overrides,
        };
    }

    const findUnique = vi.mocked(prisma.apiKey.findUnique);
    const create = vi.mocked(prisma.webhookInbox.create);
    const findMany = vi.mocked(prisma.webhookInbox.findMany);
    const findFirst = vi.mocked(prisma.webhookInbox.findFirst);
    const findFirstR = vi.mocked(prisma.webhookRequest.findFirst);
    const deleteMany = vi.mocked(prisma.webhookInbox.deleteMany);
    const findManyR = vi.mocked(prisma.webhookRequest.findMany);
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
                where: { ownerId, expiresAt: {gt: expect.any(Date)} }, orderBy: { createdAt: "desc" }
            })
        })
    });

    describe("GET /api/v1/inboxes/:inboxId", () =>{
        beforeEach(() =>{
             vi.resetAllMocks();
        });

        const inboxID = "00000000-0000-4000-8000-000000000001";

        it("returns 401 when no key present", async () =>{
        const response = await request(app).get(`/api/v1/inboxes/${inboxID}`);

        expect(response.status).toBe(401);
        expect(response.body).toEqual(UNAUTHORISED);
        expect(findFirst).not.toHaveBeenCalled();
        }),
        it("returns 200 when inbox found", async () =>{
        const ownerId = "owner-abc";
        const inbox = makeInbox({id: inboxID, ownerId});
        findUnique.mockResolvedValue(makeApiKey({ ownerId }));
        findFirst.mockResolvedValue(inbox);

        const response = await request(app).get(`/api/v1/inboxes/${inboxID}`).set("X-API-KEY", "wt_dev_valid");

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            id: inboxID,
            expiresAt: inbox.expiresAt.toISOString(),
            webhookUrl: `http://localhost:3000/hooks/${inbox.id}`
        });
        }),
        it("query is scoped to the owner", async() =>{
        const ownerId = "owner-abc";
        const inbox = makeInbox({id: inboxID, ownerId});
        findUnique.mockResolvedValue(makeApiKey({ ownerId }));
        findFirst.mockResolvedValue(inbox);


        await request(app).get(`/api/v1/inboxes/${inboxID}`).set("X-API-KEY", "wt_dev_valid");

        expect(findFirst).toHaveBeenCalledWith({
            where: { id: inboxID, ownerId, expiresAt: {gt: expect.any(Date)}}
        })
        }),
        it("returns 404 when the inbox is not found", async () => {
            findUnique.mockResolvedValue(makeApiKey());
            findFirst.mockResolvedValue(null);
        
            const response = await request(app).get(`/api/v1/inboxes/${inboxID}`).set("X-API-KEY", "wt_dev_valid");
        
            expect(response.status).toBe(404);
            expect(response.body).toEqual({ error: "Inbox not found" });
        }),
        it("returns 400 for an invalid inbox ID without querying the database", async () => {
            findUnique.mockResolvedValue(makeApiKey());
        
            const response = await request(app).get("/api/v1/inboxes/hello").set("X-API-KEY", "wt_dev_valid");
        
            expect(response.status).toBe(400);
            expect(response.body).toEqual({ error: "Invalid request" });
            expect(findFirst).not.toHaveBeenCalled();
        })
    });


    describe("DELETE /api/v1/inboxes/:inboxId", () =>{
        beforeEach(() =>{
            vi.resetAllMocks();
        });
        
        const inboxID = "00000000-0000-4000-8000-000000000001";

        it("returns a 401 when no key provided", async() =>{
            const response = await request(app).delete(`/api/v1/inboxes/${inboxID}`);
            
            expect(response.status).toBe(401);
            expect(response.body).toEqual(UNAUTHORISED);
            expect(deleteMany).not.toHaveBeenCalled();
        }),
        it("returns a 204 when successfully deleted", async() =>{
            const ownerId = "owner-abc";
            findUnique.mockResolvedValue(makeApiKey({ownerId}));
            deleteMany.mockResolvedValue({ count: 1});

            const response = await request(app).delete(`/api/v1/inboxes/${inboxID}`).set("X-API-KEY", "wt_dev_valid");

            expect(response.status).toBe(204);
            expect(response.body).toEqual({});
        }),
        it("scoped delete", async() =>{
            const ownerId = "owner-abc";
            findUnique.mockResolvedValue(makeApiKey({ownerId}));
            deleteMany.mockResolvedValue({ count: 1});

            await request(app).delete(`/api/v1/inboxes/${inboxID}`).set("X-API-KEY", "wt_dev_valid");

            expect(deleteMany).toHaveBeenCalledWith({where: { id: inboxID, ownerId, expiresAt: {gt: expect.any(Date)}}});
        }),
        it("returns 404 if inbox not found", async() =>{
            findUnique.mockResolvedValue(makeApiKey());
            deleteMany.mockResolvedValue({count: 0});

            const response = await request(app).delete(`/api/v1/inboxes/${inboxID}`).set("X-API-KEY", "wt_dev_valid");

            expect(response.status).toBe(404);
            expect(response.body).toEqual({ error: "Inbox not found"});
        }),
        it("returns 400 for an invalid inboxId without deleting anything", async() =>{
            findUnique.mockResolvedValue(makeApiKey());
            deleteMany.mockResolvedValue({count: 0});

            const response = await request(app).delete(`/api/v1/inboxes/wrongId`).set("X-API-KEY", "wt_dev_valid");

            expect(response.status).toBe(400);
            expect(response.body).toEqual({ error: "Invalid request"});
            expect(deleteMany).not.toHaveBeenCalled();
        })
    });

    describe("GET /api/v1/inboxes/:inboxId/requests", () =>{
        beforeEach(() =>{
            vi.resetAllMocks();
        });

        const inboxID = "00000000-0000-4000-8000-000000000001";
        const ownerId = "owner-001"


        it("returns 401 for no key provided", async() =>{

            const response = await request(app).get(`/api/v1/inboxes/${inboxID}/requests`);

            expect(findManyR).not.toHaveBeenCalled();
            expect(response.status).toBe(401);

        }),
        it("returns 404 for inbox not yours or not found", async() =>{
            findFirst.mockResolvedValue(null);
            findUnique.mockResolvedValue(makeApiKey({ownerId}));

            const response = await request(app).get(`/api/v1/inboxes/${inboxID}/requests`).set("X-API-KEY", "wt_dev_valid");

            expect(response.status).toBe(404);
            expect(findManyR).not.toHaveBeenCalled();
        }),
        it("get a 400 for invalid inbox", async() =>{
            findUnique.mockResolvedValue(makeApiKey({ownerId}));

            const response = await request(app).get(`/api/v1/inboxes/oops/requests`).set("X-API-KEY", "wt_dev_valid");

            expect(findFirst).not.toHaveBeenCalled();
            expect(findManyR).not.toHaveBeenCalled();
            expect(response.status).toBe(400);
        }),
        it("returns a 400 for invalid query", async() =>{
            findUnique.mockResolvedValue(makeApiKey({ownerId}));
            const response = await request(app).get(`/api/v1/inboxes/${inboxID}/requests?cursor=oops`).set("X-API-KEY", "wt_dev_valid");

            expect(findFirst).not.toHaveBeenCalled();
            expect(findManyR).not.toHaveBeenCalled();
            expect(response.status).toBe(400);
        }),
        it("returns last page", async() =>{
            const ownerId = "owner-abc";
            const req1 = makeRequestSummary({id: "00000000-0000-4000-8000-000000000001"});
            const req2 = makeRequestSummary({id: "00000000-0000-4000-8000-000000000002"});
            findUnique.mockResolvedValue(makeApiKey({ownerId}));
            findFirst.mockResolvedValue(makeInbox({ id:inboxID, ownerId}));
            findManyR.mockResolvedValue([req1,req2] as never);

            const response = await request(app).get(`/api/v1/inboxes/${inboxID}/requests?limit=10`).set("X-API-KEY", "wt_dev_valid");

            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                requests: [
                    { ...req1, createdAt: req1.createdAt.toISOString() },
                    { ...req2, createdAt: req2.createdAt.toISOString() },
                ],
                nextCursor: null,
            });
        }),
        it("returns last request's id to be in nextcursor when the limit is smaller than the size of the rows", async() =>{
            const ownerId = "owner-abc";
            const req1 = makeRequestSummary({id: "00000000-0000-4000-8000-000000000001"});
            const req2 = makeRequestSummary({id: "00000000-0000-4000-8000-000000000002"});
            const req3 = makeRequestSummary({id: "00000000-0000-4000-8000-000000000003"});
            findUnique.mockResolvedValue(makeApiKey({ownerId}));
            findFirst.mockResolvedValue(makeInbox({ id:inboxID, ownerId}));
            findManyR.mockResolvedValue([req1,req2, req3] as never);

            const response = await request(app).get(`/api/v1/inboxes/${inboxID}/requests?limit=2`).set("X-API-KEY", "wt_dev_valid");

            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                requests: [
                    { ...req1, createdAt: req1.createdAt.toISOString() },
                    { ...req2, createdAt: req2.createdAt.toISOString() },
                ],
                nextCursor: "00000000-0000-4000-8000-000000000002",
            });
        }),
        it("db to have been queried for the first page correctly", async() =>{
            const ownerId = "owner-abc";
            const req1 = makeRequestSummary({id: "00000000-0000-4000-8000-000000000001"});
            const req2 = makeRequestSummary({id: "00000000-0000-4000-8000-000000000002"});
            findUnique.mockResolvedValue(makeApiKey({ownerId}));
            findFirst.mockResolvedValue(makeInbox({ id:inboxID, ownerId}));
            findManyR.mockResolvedValue([req1,req2] as never);

            const response = await request(app).get(`/api/v1/inboxes/${inboxID}/requests?limit=10`).set("X-API-KEY", "wt_dev_valid");

            expect(findManyR).toHaveBeenCalledWith({
                where: { inboxId: inboxID },
                orderBy: [{ createdAt: "desc" }, { id: "desc" }],
                select: { id: true, method: true, contentType: true, createdAt: true },
                take: 11,
            });
        }),
        it("db to have been called with correct cursor parameter", async() =>{
            const ownerId = "owner-abc";
            const req1 = makeRequestSummary({id: "00000000-0000-4000-8000-000000000001"});
            const req2 = makeRequestSummary({id: "00000000-0000-4000-8000-000000000002"});
            findUnique.mockResolvedValue(makeApiKey({ownerId}));
            findFirst.mockResolvedValue(makeInbox({ id:inboxID, ownerId}));
            findManyR.mockResolvedValue([req1,req2] as never);

            const response = await request(app).get(`/api/v1/inboxes/${inboxID}/requests?cursor=00000000-0000-4000-8000-000000000002`).set("X-API-KEY", "wt_dev_valid");

            expect(findManyR).toHaveBeenCalledWith(
                expect.objectContaining({
                    cursor: { id: "00000000-0000-4000-8000-000000000002" },
                    skip: 1,
                }),
            );
        })
    });

    describe("GET /api/v1/inboxes/:inboxId/requests/:requestId", () =>{
        beforeEach(() =>{
            vi.resetAllMocks();
        });

        const inboxID = "00000000-0000-4000-8000-000000000001";
        const ownerId = "owner-001"
        const requestId = "00000000-0000-4000-8000-0000000000a1"

        it("returns a 401 when no key is provided", async() => {
            const response = await request(app).get(`/api/v1/inboxes/${inboxID}/requests/${requestId}`);

            expect(findFirstR).not.toHaveBeenCalled();
            expect(response.status).toBe(401);
        }),
        it("returns 400 for invalid id", async() => {
            findUnique.mockResolvedValue(makeApiKey({ownerId}));

            const response = await request(app).get(`/api/v1/inboxes/${inboxID}/requests/oops`).set("X-API-KEY", "wt_dev_valid");

            expect(response.status).toBe(400);
            expect(findFirstR).not.toHaveBeenCalled();
        }),
        it("returns 404 if the response was not found", async() =>{
            findUnique.mockResolvedValue(makeApiKey({ownerId}));
            findFirstR.mockResolvedValue(null);

            const response = await request(app).get(`/api/v1/inboxes/${inboxID}/requests/${requestId}`).set("X-API-KEY", "wt_dev_valid");

            expect(response.status).toBe(404);
            expect(response.body).toEqual({
                error: "Request not found"
            });
        }),
        it("return a 200 success if it successfully retreived and decoded the request", async() =>{
            const requestResponse = makeRequest();
            findUnique.mockResolvedValue(makeApiKey({ownerId}));
            findFirstR.mockResolvedValue(requestResponse);

            const response = await request(app).get(`/api/v1/inboxes/${inboxID}/requests/${requestId}`).set("X-API-KEY", "wt_dev_valid");

            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                id: requestResponse.id,
                method: requestResponse.method,
                headers: requestResponse.headers,
                queryParams: requestResponse.queryParams,
                contentType: requestResponse.contentType,
                createdAt: requestResponse.createdAt.toISOString(),
                body: '{"event":"ping"}',
                bodyEncoding: "utf8",
            });
        }),
        it("scoped query test", async() =>{
            const requestResponse = makeRequest();
            findUnique.mockResolvedValue(makeApiKey({ownerId}));
            findFirstR.mockResolvedValue(requestResponse);

            await request(app).get(`/api/v1/inboxes/${inboxID}/requests/${requestId}`).set("X-API-KEY", "wt_dev_valid");

            expect(findFirstR).toHaveBeenCalledWith({
                where: { id: requestId, inboxId: inboxID, inbox: { ownerId, expiresAt: {gt: expect.any(Date)}}}
            });
        }),
        it("correctly decodes binary content", async() =>{
            const payload = '{"event":"ping"}';
            const requestResponse = makeRequest({ contentType: "application/octet-stream", body: new Uint8Array(Buffer.from(payload))});
            findUnique.mockResolvedValue(makeApiKey({ownerId}));
            findFirstR.mockResolvedValue(requestResponse);

            const response = await request(app).get(`/api/v1/inboxes/${inboxID}/requests/${requestId}`).set("X-API-KEY", "wt_dev_valid");

            expect(response.body.bodyEncoding).toBe("base64");
            expect(response.body.body).toBe(Buffer.from(payload).toString("base64"));
        }),
        it("correctly decodes json content", async() =>{
            const requestResponse = makeRequest({ contentType: "application/json"});
            findUnique.mockResolvedValue(makeApiKey({ownerId}));
            findFirstR.mockResolvedValue(requestResponse);

            const response = await request(app).get(`/api/v1/inboxes/${inboxID}/requests/${requestId}`).set("X-API-KEY", "wt_dev_valid");

            expect(response.body.bodyEncoding).toBe("utf8");
            expect(response.body.body).toBe('{"event":"ping"}');
        }),
        it("missing content type falls back to base64", async() =>{
            const requestResponse = makeRequest({ contentType: ""});
            findUnique.mockResolvedValue(makeApiKey({ownerId}));
            findFirstR.mockResolvedValue(requestResponse);

            const response = await request(app).get(`/api/v1/inboxes/${inboxID}/requests/${requestId}`).set("X-API-KEY", "wt_dev_valid");

            expect(response.body.bodyEncoding).toBe("base64");
        })

    });