import type { Nullable } from "global";
import { env } from "./env";
import Redis from "ioredis";

let redis: Nullable<Redis.Redis> = null;

export async function connectToRedis() {
  if (redis) return;
  redis = new Redis({
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
    password: env.REDIS_PASSWORD,
  });
  console.log("Connected to Redis");
}

export const set = async (key: string, value: string) => {
  try {
    await redis?.set(key, value, "EX", env.REDIS_EXPIRES_IN_MINS * 60);
    console.log(`Set key: ${key}`);
  } catch (err) {
    throw err;
  }
};

export const get = async (key: string) => {
  try {
    console.log(`Get key: ${key}`);
    return await redis?.get(key);
  } catch (err) {
    throw err;
  }
};
