import { z } from "zod";

export const jwtSchema = z.object({
    token: z.string()
});