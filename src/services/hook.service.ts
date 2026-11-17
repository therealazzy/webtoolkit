import type { CapturedRequest } from "../types/webhook";
import { prisma } from "../lib/prisma";

export async function recordWebhookRequest(inboxId : string, captured: CapturedRequest) :  Promise<"not_found" | "expired" | "stored">{
    const found = await prisma.webhookInbox.findUnique({
        where: {id: inboxId}, select: { expiresAt: true}
    });
    if(found == null){
        return("not_found");
    }

    if(found.expiresAt.getTime() <= Date.now()){
        return("expired");
    }
        await prisma.webhookRequest.create({
            data: {inboxId, method: captured.method, headers: captured.headers, queryParams: captured.queryParams, body: new Uint8Array(captured.body), contentType: captured.contentType}
        })
        return("stored");
}