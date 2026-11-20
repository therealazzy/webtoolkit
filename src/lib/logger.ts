import pino from "pino";

const redactedPaths = ['req.headers["x-api-key"]', 'req.headers.authorization', 'req.headers.cookie'];

const isProduction = process.env.NODE_ENV === "production"
const isTest = process.env.NODE_ENV === "test"

export const logger = pino({
    level: isTest ? 'silent' : process.env.LOG_LEVEL || 'info',
    redact: redactedPaths,
    transport: isProduction ? undefined : {target: "pino-pretty"}
})