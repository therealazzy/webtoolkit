import {Request, Response} from 'express';
import { createInbox } from '../services/inbox.service';
import { PUBLIC_BASE_URL } from '../config';
export async function createInboxController(req: Request, res: Response){
    if(req.ownerId == null){
        throw new Error("ownerid not set?");
    }
    const row = await createInbox(req.ownerId);
    const hookUrl = PUBLIC_BASE_URL + "/hooks/" + row.id;
    const inboxUrl = "/api/v1/inboxes/" + row.id;
    return res.status(201).location(inboxUrl).json({
        "id" : row.id,
        "expiresAt": row.expiresAt,
        "webhookUrl": hookUrl
    });
}