import { NextFunction, Request, Response } from "express";
import { MulterError } from "multer";
import { z, ZodError } from "zod";
import { env } from "../configs/env";
import { ApiError } from "../utils/ApiError";
import { logger } from "../utils/logger";

export const errorHandler = (err: unknown, req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      message: err.message,
      ...(err.details ? { errors: err.details } : {}),
    });
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      message: "Validation failed",
      errors: z.treeifyError(err),
    });
    return;
  }

  if (err instanceof MulterError) {
    res.status(400).json({ message: err.message });
    return;
  }

  logger.error(`Unhandled error on ${req.method} ${req.originalUrl}`, err);

  res.status(500).json({
    message: "Internal server error",
    ...(env.NODE_ENV !== "production" && err instanceof Error ? { stack: err.stack } : {}),
  });
};
