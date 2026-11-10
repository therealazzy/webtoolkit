import {Request, Response} from 'express';
import { createInbox, getInbox, listInboxes } from '../services/inbox.service';
import { PUBLIC_BASE_URL } from '../config';
import type { WebhookInbox } from '../generated/prisma/client';
import { inboxIdSchema } from '../schemas/inbox.schema';
import { AppError } from '../errors/appError';

//helper fun ownerid checking
function requireOwnerId(req: Request) : string{
    if(req.ownerId == null) throw new Error("requireApiKey did not set req.ownerId");
    return req.ownerId;
}

//helper for generating inbox res
function toInboxResponse(inbox: WebhookInbox){
    return { 
        id: inbox.id,
        expiresAt: inbox.expiresAt,
        webhookUrl: `${PUBLIC_BASE_URL}/hooks/${inbox.id}`
    }
}
export async function createInboxController(req: Request, res: Response){
    const ownerId = requireOwnerId(req);
    const row = await createInbox(ownerId);
    const inboxUrl = "/api/v1/inboxes/" + row.id;
    return res.status(201).location(inboxUrl).json(toInboxResponse(row));
}

export async function listInboxesController(req: Request, res: Response){
    const ownerId = requireOwnerId(req);
    const list = await listInboxes(ownerId);
    res.status(200).json({
        inboxes: list.map(toInboxResponse)
    });
}

export async function getInboxController(req: Request, res: Response){
    const ownerId = requireOwnerId(req);
    const { inboxId } = inboxIdSchema.parse(req.params);
    const inbox = await getInbox(ownerId, inboxId);
    if(inbox == null){
        throw new AppError("Inbox not found", 404);
    }
    res.json(toInboxResponse(inbox));
}