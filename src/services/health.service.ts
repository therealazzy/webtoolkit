import { prisma } from "../lib/prisma";
import { logger } from "../lib/logger";

export async function getDbHealth(): Promise<boolean>{
    try {
        await prisma.$queryRaw`SELECT 1`;
        return true;
    } catch (error) {
        logger.warn({err: error}, "DB connection not alive");
        return false;
    }
}
