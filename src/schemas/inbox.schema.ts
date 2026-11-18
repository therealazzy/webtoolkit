import {z} from "zod"

export const inboxIdSchema = z.object({
    inboxId : z.uuid()
});

export const listRequestsQuerySchema = z.object({
    limit: z.coerce.number().int().min(1).max(100).default(10),
    cursor: z.uuid().optional()
});