import type { Config } from "drizzle-kit";
import { env } from "./src/lib/env";

export default {
  schema: "src/lib/db/schema.ts",
  out: "src/lib/db/migrations",
  driver: "pglite",
  dialect: "postgresql",
  dbCredentials: {
    url: `postgres://${env.DATABASE_USER}:${env.DATABASE_PASSWORD}@${env.DATABASE_HOST}:${env.DATABASE_PORT}/${env.DATABASE_NAME}`,
  },
  breakpoints: true,
} satisfies Config;
