import { prisma } from "../lib/prisma";

const INBOX_LIFETIME_MS = 24 * 60 * 60 * 1000;
export async function createInbox(ownerId: string){
    return await prisma.webhookInbox.create({
        data: {ownerId, expiresAt: new Date(Date.now() + INBOX_LIFETIME_MS)}
    });
}

export async function listInboxes(ownerId: string){
    return await prisma.webhookInbox.findMany({
        where: { ownerId },
        orderBy: { createdAt: "desc" }
    });
}

export async function getInbox(ownerId: string, inboxId: string){
    return await prisma.webhookInbox.findFirst({
        where: { id: inboxId, ownerId}
    })
}

export async function deleteInbox(ownerId: string, inboxId: string){
    const { count } = await prisma.webhookInbox.deleteMany({
        where: {id: inboxId, ownerId}
    })
    return count > 0;
}
