import { z } from "zod";

export const jwtSchema = z.object({
    token: z.string()
});

export const jwtHeaderSchema = z.object({
    alg: z.string(),
    typ: z.string().optional()
});

export const jwtPayloadSchema = z.object({
    exp: z.number().optional(),
    iat: z.number().optional(),
    nbf: z.number().optional(),
    sub: z.string().optional(),
    name: z.string().optional(),
}).catchall(z.unknown());

export const verifyJwtSchema = z.object({
    token: z.string(),
    key: z.string(),
    claims: z.record(z.string(), z.string()).optional()
})

//I'm inferring types from the schema here rather than having to maintain a seperate fwith duplicate code
export type JwtHeader = z.infer<typeof jwtHeaderSchema>;
export type JwtPayload = z.infer<typeof jwtPayloadSchema>;
export type VerifyJwtInput = z.infer<typeof verifyJwtSchema>;
