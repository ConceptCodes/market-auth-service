import type { RequestHandler } from "express";
import { ZodError, ZodSchema } from "zod";

import { InternalError, ValidationError } from "@/exceptions";
import { createLogger } from "@lib/logger";

const logger = createLogger("validation-middleware");

const formatZodError = (error: ZodError) => {
  return error.errors
    .map((error) => {
      return `${error.path} is ${error.message}`;
    })
    .join(", ");
};

const ValidationMiddleware = <T>(
  schema: ZodSchema<T>,
  type: "body" | "query" | "params" = "body"
): RequestHandler => {
  return async (req, _, next) => {
    logger.info({ type, schema: schema.description }, "Validating request");
    try {
      await schema.parseAsync(req[type]);
      logger.info({ type }, "Validation successful");
      next();
    } catch (error) {
      logger.error({ error }, "Validation failed");
      if (error instanceof ZodError) {
        const errors = formatZodError(error);
        next(new ValidationError(errors));
      } else {
        next(new InternalError());
      }
    }
  };
};

export default ValidationMiddleware;
