import { prisma } from "../lib/prisma";

export async function getDbHealth(): Promise<boolean>{
    try {
        await prisma.$queryRaw`SELECT 1`;
        return true;
    } catch (error) {
        return false;
    }
}