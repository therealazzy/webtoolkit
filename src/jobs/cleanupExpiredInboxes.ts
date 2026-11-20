import cron from "node-cron";
import { deleteExpiredInboxes } from "../services/inbox.service";
import { logger } from "../lib/logger";

let running = false;
export async function runCleanup(): Promise<void>{
    if(running) return;
    running = true;

    try {
        const deleted = await deleteExpiredInboxes(new Date());
        logger.info({ deleted }, "Cleanup finished");
    } catch (error) {
        logger.error({err: error}, "Cleanup failed");
    } finally {
        running = false;
    }
}

export function startCleanupSchedule(){
    return cron.schedule("1 * * * *", runCleanup, {timezone: "UTC"});
}