import type { NextFunction, Request, Response } from "express";
import StatusCodes from "http-status-codes";
import { createLogger } from "@lib/logger";

const logger = createLogger("not-found-middleware");

const notFoundMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    logger.error(
      {
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
      },
      `${req.ip} - ${req.method} - ${req.originalUrl} - ${StatusCodes.NOT_FOUND} - ${res.statusMessage}`
    );
    res.status(StatusCodes.NOT_FOUND).send("404 Not Found");
  } catch (error) {
    next(error);
  }
};

export default notFoundMiddleware;
