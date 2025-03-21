import { drizzle } from "drizzle-orm/postgres-js";
import { type Logger } from "drizzle-orm/logger";
import postgres from "postgres";

import { env } from "@lib/env";
import { createLogger } from "@lib/logger";

const logger = createLogger("db");

class QueryLogger implements Logger {
  logQuery(query: string, params: unknown[]): void {
    logger.debug({ query, params }, "___QUERY___");
  }
}

logger.debug("Connecting to database");

const client = postgres({
  host: env.DATABASE_HOST,
  port: env.DATABASE_PORT,
  username: env.DATABASE_USER,
  password: env.DATABASE_PASSWORD,
  database: env.DATABASE_NAME,
});

export async function checkDatabaseHealth() {
  try {
    logger.debug("Checking database connection");
    await client`SELECT 1`;
    return true;
  } catch (err) {
    logger.error({ err }, "Database is not healthy");
    return false;
  }
}

export const db = drizzle(client, { logger: new QueryLogger() });
