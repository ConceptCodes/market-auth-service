import type { NextFunction, Request, Response } from "express";
import { env } from "@lib/env";
import { get, set } from "@lib/redis";
import { RateLimitException } from "@/exceptions";

const rateLimitMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const ip = req.ip || req.socket.remoteAddress || "unknown";
    const key = `ratelimit:${ip}`;

    // Get current count for this IP
    const currentCount = await get(key);
    const requestCount = currentCount ? parseInt(currentCount) : 0;

    if (requestCount >= env.RATE_LIMIT_MAX) {
      console.warn(`Rate limit exceeded for IP: ${ip}`);

      // Add headers to response
      res.setHeader("Retry-After", Math.floor(env.RATE_LIMIT_WINDOW_MS / 1000));
      res.setHeader("X-RateLimit-Limit", env.RATE_LIMIT_MAX);
      res.setHeader("X-RateLimit-Remaining", 0);

      throw new RateLimitException();
    }

    // Increment count and set expiry
    await set(key, (requestCount + 1).toString());

    // Add rate limit headers
    res.setHeader("X-RateLimit-Limit", env.RATE_LIMIT_MAX);
    res.setHeader(
      "X-RateLimit-Remaining",
      env.RATE_LIMIT_MAX - requestCount - 1
    );

    next();
  } catch (error) {
    console.error("Rate limit middleware error:", error);
    next(); // Continue even if rate limiting fails
  }
};

export default rateLimitMiddleware;
