import {z} from "zod"

export const jsonSchema = z.object({
    json: z.string()
})