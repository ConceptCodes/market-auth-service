import type { Request, Response } from "express";
import { createLogger} from "@lib/logger";

const logger = createLogger("logger-middleware");

const loggerMiddleware = (req: Request, res: Response, next: Function) => {
  const startTime = Date.now();

  res.on("finish", () => {
    const responseTime = Date.now() - startTime;

    logger.info(
      {
        type: "request",
        method: req.method,
        url: req.originalUrl || req.url,
        statusCode: res.statusCode,
        responseTime,
        reqId: req.id,
        ip: req.ip || req.socket.remoteAddress,
        userAgent: req.headers["user-agent"],
      },
      "Request completed"
    );
  });

  next();
};

export default loggerMiddleware;
