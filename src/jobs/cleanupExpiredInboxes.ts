import cron from "node-cron";
import { deleteExpiredInboxes } from "../services/inbox.service";

let running = false;
export async function runCleanup(): Promise<void>{
    if(running) return;
    running = true;

    try {
        const deleted = await deleteExpiredInboxes(new Date());
        console.log(`[Cleanup] deleted ${deleted} expired inboxes`);
    } catch (error) {
        console.error("[Cleanup] failed", error);
    } finally {
        running = false;
    }
}

export function startCleanupSchedule(){
    return cron.schedule("1 * * * *", runCleanup, {timezone: "UTC"});
}