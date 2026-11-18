import { getInbox } from "./inbox.service";
import { prisma } from "../lib/prisma";

const TEXT_CONTENT_TYPES = ["application/json", "application/xml","application/x-www-form-urlencoded"];

function isTextType(contentType: string | null): boolean {

    if(contentType == null){
        return false;
    }
    const stripped = contentType.split(";")[0].trim().toLowerCase();
    return stripped.startsWith("text/") || TEXT_CONTENT_TYPES.includes(stripped)

}


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


export async function getRequest(ownerId: string, inboxId: string, requestId: string){
    const row = await prisma.webhookRequest.findFirst({
        where: {id: requestId, inboxId, inbox: { ownerId }}
    })

    if(row == null){
        return null;
    }

    const bodyEncoding = isTextType(row.contentType) ? "utf8" : "base64";

    const body = Buffer.from(row.body).toString(bodyEncoding);

    return { id: row.id, headers: row.headers, method: row.method, queryParams: row.queryParams, contentType: row.contentType, createdAt: row.createdAt, body, bodyEncoding};

}