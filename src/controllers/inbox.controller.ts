import {Request, Response} from 'express';
import { createInbox, listInboxes } from '../services/inbox.service';
import { PUBLIC_BASE_URL } from '../config';
import type { WebhookInbox } from '../generated/prisma/client';

function toInboxResponse(inbox: WebhookInbox){
    return { 
        id: inbox.id,
        expiresAt: inbox.expiresAt,
        webhookUrl: `${PUBLIC_BASE_URL}/hooks/${inbox.id}`
    }
}
export async function createInboxController(req: Request, res: Response){
    if(req.ownerId == null){
        throw new Error("ownerid not set?");
    }
    const row = await createInbox(req.ownerId);
    const inboxUrl = "/api/v1/inboxes/" + row.id;
    return res.status(201).location(inboxUrl).json(toInboxResponse(row));
}

export async function listInboxesController(req: Request, res: Response){
    if(req.ownerId == null){
        throw new Error("OwnerId not set?");
    }
    const list = await listInboxes(req.ownerId);
    res.status(200).json({
        inboxes: list.map(toInboxResponse)
    });
}