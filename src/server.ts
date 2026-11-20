import app from "./app"
import { startCleanupSchedule } from "./jobs/cleanupExpiredInboxes";
import { logger } from "./lib/logger";
import { prisma } from "./lib/prisma";

const PORT = Number(process.env.PORT) || 3000;

const server = app.listen(PORT, () =>{
    logger.info({ port: PORT}, "Server listening");
});

const cleanupJob = startCleanupSchedule();

function shutdown(signal: NodeJS.Signals){
    logger.info({signal}, "Shutting down");
    const timer: NodeJS.Timeout = setTimeout(() =>{
        logger.error({ signal }, "Forced shutdown");
        process.exit(1);
    }, 20_000); 
    cleanupJob.stop();
    server.close(async() =>{
        await prisma.$disconnect();
        clearTimeout(timer);
        logger.info("Shutdown completed");
        process.exit(0);
    });
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);