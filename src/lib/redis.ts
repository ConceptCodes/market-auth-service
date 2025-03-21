import Redis from "ioredis";
import type { Nullable } from "global";
import { env } from "./env";
import { createLogger } from "./logger";

const logger = createLogger("redis client");
let redis: Nullable<Redis> = null;

export async function connectToRedis() {
  if (redis) return;
  redis = new Redis({
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
    password: env.REDIS_PASSWORD,
  });
  logger.info("Connected to Redis");
}

export const set = async (key: string, value: string) => {
  try {
    logger.debug({ key, value }, "Setting key in Redis");
    await redis?.set(key, value, "EX", env.REDIS_EXPIRES_IN_MINS * 60);
  } catch (err) {
    logger.error({ err, key }, "Error setting key in Redis");
    throw err;
  }
};

export const get = async (key: string) => {
  try {
    logger.debug({ key }, "Getting key from Redis");
    return await redis?.get(key);
  } catch (err) {
    logger.error({ err, key }, "Error getting key from Redis");
    throw err;
  }
};

export const checkRedisHealth = async () => {
  try {
    await redis?.ping();
    logger.debug("Redis is healthy");
    return true;
  } catch (err) {
    logger.error({ err }, "Redis is not healthy");
    return false;
  }
};
