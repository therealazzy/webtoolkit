import { describe, expect, it, vi, afterEach } from "vitest";
import { createInbox, deleteExpiredInboxes } from "../src/services/inbox.service";
import { prisma } from "../src/lib/prisma";


vi.mock("../src/lib/prisma", () =>({
    prisma: {
        webhookInbox: { create: vi.fn(), findMany: vi.fn(), deleteMany: vi.fn()}
    }
}));

const create = vi.mocked(prisma.webhookInbox.create);
const findMany = vi.mocked(prisma.webhookInbox.findMany);
const deleteMany = vi.mocked(prisma.webhookInbox.deleteMany);

describe("inbox service tests", () =>{
    
    afterEach(() =>{
        vi.clearAllMocks();
        vi.useRealTimers();
    })
    it("sets the correct 24hr expiry 'date'", async () =>{
        vi.useFakeTimers();
        vi.setSystemTime(new Date("2026-11-16T12:00:00.000Z"));
        const ownerId = "owner-abc"
        const expiresAt = new Date("2026-11-17T12:00:00.000Z");
        await createInbox(ownerId);
        expect(create).toHaveBeenCalledWith({
            data : { ownerId, expiresAt }
        })
        
    }),
    it("deletes any expired inboxes successfully", async() =>{
        findMany.mockResolvedValueOnce([{ id: "a"}, {id: "b"}] as never).mockResolvedValueOnce([{id: "c"}] as never).mockResolvedValueOnce([]);
        deleteMany.mockResolvedValueOnce({ count: 2}).mockResolvedValueOnce({ count: 1});
        
        const result = await deleteExpiredInboxes(new Date("2026-11-19T12:00:00.000Z"));
        
        expect(result).toBe(3);
        expect(findMany).toHaveBeenCalledTimes(3);
        expect(deleteMany).toHaveBeenCalledTimes(2);
        expect(findMany).toHaveBeenCalledWith({
            where: {expiresAt: {lte: new Date("2026-11-19T12:00:00.000Z")}},
            take: 1000,
            select: {id: true}
        })
    }),
    it("nothing is deleted if nothing is expired", async() =>{
        findMany.mockResolvedValueOnce([]);

        const result = await deleteExpiredInboxes(new Date("2026-11-19T12:00:00.000Z"));

        expect(result).toBe(0);
        expect(findMany).toHaveBeenCalledTimes(1);
        expect(deleteMany).not.toHaveBeenCalled();
    }),
    it("the guard stops a loop that is stuck if the deletion failed", async() =>{
        findMany.mockResolvedValue([{ id: "a"}, {id: "b"}, {id: "c"}] as never);
        deleteMany.mockResolvedValue({count: 0});

        const result = await deleteExpiredInboxes(new Date("2026-11-19T12:00:00.000Z"));

        expect(result).toBe(0);
        expect(findMany).toHaveBeenCalledTimes(1);
        expect(deleteMany).toHaveBeenCalledTimes(1);
    })
})