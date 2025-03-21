import pino from "pino";
import { env } from "@lib/env";

const level =
  env.LOG_LEVEL ?? (env.NODE_ENV === "production" ? "info" : "debug");

const transport =
  env.NODE_ENV === "development"
    ? {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "SYS:standard",
          ignore: "pid,hostname",
        },
      }
    : undefined;

const logger = pino({
  level,
  transport,
  base: {
    env: env.NODE_ENV,
    service: "auth-service",
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});

export const createLogger = (component: string) => {
  return logger.child({ component });
};

export default logger;
