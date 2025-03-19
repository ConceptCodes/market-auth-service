import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

import "dotenv/config";

export const env = createEnv({
  server: {
    PORT: z.coerce.number().default(8000),
    NODE_ENV: z
      .enum(["local", "development", "production"])
      .default("production"),

    DATABASE_HOST: z.string(),
    DATABASE_USER: z.string(),
    DATABASE_PASSWORD: z.string(),
    DATABASE_DB: z.string(),
    DATABASE_URL: z.string().url(),

    JWT_SECRET: z.string().min(10),
    JWT_REFRESH_SECRET: z.string().min(10),
    JWT_EXPIRES_IN: z.string().refine((x) => {
      return x.endsWith("m") || x.endsWith("h") || x.endsWith("d");
    }),
    JWT_REFRESH_EXPIRES_IN: z.string().refine((x) => {
      return x.endsWith("m") || x.endsWith("h") || x.endsWith("d");
    }),

    RESEND_API_KEY: z.string().optional(),

    REDIS_HOST: z.string(),
    REDIS_PORT: z.coerce.number().int().positive(),
    REDIS_PASSWORD: z.string().optional(),
    REDIS_EXPIRES_IN_MINS: z.coerce.number().int().positive().default(5),

    CORS_ORIGIN: z.string().url().optional(),
    LOG_LEVEL: z
      .enum(["error", "warn", "info", "http", "verbose", "debug", "silly"])
      .default("info"),
    RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(900000),
    RATE_LIMIT_MAX: z.coerce.number().int().positive().default(100),
  },
  runtimeEnv: process.env,
});
