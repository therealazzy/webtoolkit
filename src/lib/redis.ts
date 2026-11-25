import "dotenv/config";
import { createClient} from "redis";
import { logger } from "./logger";

const redisURL = process.env.REDIS_URL;

if(!redisURL){
    throw new Error("REDIS_URL is not defined!!!")
}

export const redis = createClient({
    url: redisURL,
    disableOfflineQueue: true,
});

redis.on('error', err => logger.error({err}, "Redis client error"));
