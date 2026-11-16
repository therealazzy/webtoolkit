import { describe, expect, it, vi, afterEach } from "vitest";
import { createInbox } from "../src/services/inbox.service";
import { prisma } from "../src/lib/prisma";


vi.mock("../src/lib/prisma", () =>({
    prisma: {
        webhookInbox: { create: vi.fn()}
    }
}));

const create = vi.mocked(prisma.webhookInbox.create);

describe("inbox service tests", () =>{

    afterEach(() =>{
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

    })
})