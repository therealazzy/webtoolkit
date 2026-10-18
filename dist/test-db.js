"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = require("./lib/prisma");
async function main() {
    const inboxCount = await prisma_1.prisma.webhookInbox.count();
    console.log("Database connection successful");
    console.log(`Webhook inboxes in database: ${inboxCount}`);
}
main().catch((error) => {
    console.error("Database connection failed", error);
    process.exitCode = 1;
}).finally(async () => {
    await prisma_1.prisma.$disconnect();
});
