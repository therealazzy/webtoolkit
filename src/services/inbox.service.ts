import { prisma } from "../lib/prisma";

const INBOX_LIFETIME_MS = 24 * 60 * 60 * 1000;
export async function createInbox(ownerId: string){
    return await prisma.webhookInbox.create({
        data: {ownerId, expiresAt: new Date(Date.now() + INBOX_LIFETIME_MS)}
    });
}

export async function listInboxes(ownerId: string){
    return await prisma.webhookInbox.findMany({
        where: { ownerId, expiresAt: { gt: new Date()} },
        orderBy: { createdAt: "desc" }
    });
}

export async function getInbox(ownerId: string, inboxId: string){
    return await prisma.webhookInbox.findFirst({
        where: { id: inboxId, ownerId, expiresAt: { gt: new Date()}}
    })
}

export async function deleteInbox(ownerId: string, inboxId: string){
    const { count } = await prisma.webhookInbox.deleteMany({
        where: {id: inboxId, ownerId, expiresAt: {gt: new Date()}}
    })
    return count > 0;
}

const BATCH_SIZE = 1000;

export async function deleteExpiredInboxes(now: Date): Promise<number> {
    let total = 0;

    while(true){
        const batch = await prisma.webhookInbox.findMany({
            where: {expiresAt: { lte: now }},
            select: {id: true},
            take: BATCH_SIZE,
        });

        if(batch.length === 0) break;

        const { count } = await prisma.webhookInbox.deleteMany({
            where: {id: {in: batch.map((inbox) => inbox.id)}},
        });

        if(count === 0 ) break;

        total += count;
    }
    return total;
}
