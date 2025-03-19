import type { Config } from "drizzle-kit";
import { env } from "./src/lib/env";

export default {
  schema: "src/lib/db/schema.ts",
  out: "src/lib/db/migrations",
  driver: "pglite",
  dialect: "postgresql",
  dbCredentials: {
    url: env.DATABASE_URL,
  },
  breakpoints: true,
} satisfies Config;
