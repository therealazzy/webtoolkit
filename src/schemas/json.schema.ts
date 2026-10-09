import {z} from "zod"

export const jsonSchema = z.object({
    json: z.string()
})

export const jsonDiffSchema = z.object({
    json1: z.string(),
    json2: z.string()
});