import app from "./app"
import { startCleanupSchedule } from "./jobs/cleanupExpiredInboxes";

const PORT = Number(process.env.PORT) || 3000;

const server = app.listen(PORT, () =>{
    console.log(`listening on port ${PORT}`)
});

const cleanupJob = startCleanupSchedule();

process.on("SIGTERM", () =>{
    cleanupJob.stop();
    server.close();
});