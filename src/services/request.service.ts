import { getInbox } from "./inbox.service";
import { prisma } from "../lib/prisma";

export async function listRequests(ownerId: string, inboxId: string, options: {limit: number; cursor?: string}){
    const exists = await getInbox(ownerId, inboxId);

    if(exists == null){
        return null;
    }

    const rows =  await prisma.webhookRequest.findMany({
        where: { inboxId }, orderBy: [{ createdAt: "desc"}, { id: "desc"}], 
        select: { id: true, method: true, contentType: true, createdAt: true }, 
        take: options.limit + 1,
        cursor: options.cursor ? { id: options.cursor } : undefined,
        skip: options.cursor ? 1 : undefined
    });

    const hasNext = rows.length > options.limit;
    const page = rows.slice(0, options.limit);
    const nextCursor = hasNext ? page[page.length - 1].id : null;

    return { requests: page, nextCursor};

}