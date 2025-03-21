import type { NextFunction, Request, Response } from "express";
import { env } from "@lib/env";
import { get, set } from "@lib/redis";
import { createLogger } from "@/lib/logger";
import { RateLimitException } from "@/exceptions";

const logger = createLogger("rate-limit-middleware");

const rateLimitMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const ip = req.ip || req.socket.remoteAddress || "unknown";
    const key = `ratelimit:${ip}`;

    const currentCount = await get(key);
    const requestCount = currentCount ? parseInt(currentCount) : 0;

    if (requestCount >= env.RATE_LIMIT_MAX) {
      logger.warn({ ipAddress: ip }, "Rate limit exceeded");

      res.setHeader("Retry-After", Math.floor(env.RATE_LIMIT_WINDOW_MS / 1000));
      res.setHeader("X-RateLimit-Limit", env.RATE_LIMIT_MAX);
      res.setHeader("X-RateLimit-Remaining", 0);

      throw new RateLimitException();
    }

    await set(key, (requestCount + 1).toString());

    res.setHeader("X-RateLimit-Limit", env.RATE_LIMIT_MAX);
    res.setHeader(
      "X-RateLimit-Remaining",
      env.RATE_LIMIT_MAX - requestCount - 1
    );

    next();
  } catch (error) {
    logger.error({ error }, "Rate limit middleware error");
    next();
  }
};

export default rateLimitMiddleware;
