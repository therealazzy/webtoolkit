import {z} from "zod"

export const inboxIdSchema = z.object({
    inboxId : z.uuid()
})