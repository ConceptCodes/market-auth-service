import { StatusCodes } from "http-status-codes";
import type { NextFunction, Request, Response } from "express";

import { HttpException } from "@/exceptions";
import { createLogger } from "@lib/logger";

const logger = createLogger("error-middleware");

const ErrorMiddleware = (
  err: HttpException,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const status: number = err.status || StatusCodes.SERVICE_UNAVAILABLE;
    const message: string = err.message || "Error in the System";
    logger.error(
      {
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
        status,
        message,
        stack: err.stack,
      },
      `[${req.id}] ${req.method} ${req.path} ${message}`
    );
    res.status(status).json({ message });
  } catch (error) {
    next(error);
  }
};

export default ErrorMiddleware;
