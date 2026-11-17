import { Request, Response} from 'express';
import { inboxIdSchema } from '../schemas/inbox.schema';
import type { CapturedRequest } from '../types/webhook';
import { recordWebhookRequest } from '../services/hook.service';
import { AppError } from '../errors/appError';


export async function receiveWebhookController(req: Request, res: Response){
    const { inboxId } = inboxIdSchema.parse(req.params);
    
    const captured: CapturedRequest = {
        method: req.method,
        headers: req.headers,
        queryParams: req.query,
        body: Buffer.isBuffer(req.body) ? req.body : Buffer.alloc(0),
        contentType: req.get("content-type")
    }

    const result = await recordWebhookRequest(inboxId, captured);

    if(result === "not_found"){
        throw new AppError("Inbox not found", 404);
    }
    if(result === "expired"){
        throw new AppError("Inbox is expired", 410);
    }
    if(result === "stored"){
        res.json({ received : true });
    }

}