import type { NextFunction, Request, Response } from "express";
import { MulterError } from "multer";
import { AppError } from "../lib/errors.js";
import { logger } from "../lib/logger.js";

// Last middleware in the chain. Every thrown error — AppError or otherwise —
// lands here (docs/phase7-implementation-plan.md §8). Convention:
// AppError -> its own statusCode/code/message; anything else -> 500, generic
// message, full detail logged server-side only (never leaked to the client).
export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
) {
  if (err instanceof AppError) {
    if (err.statusCode >= 500) {
      logger.error({ err, path: req.path }, err.message);
    }
    res.status(err.statusCode).json({
      error: { code: err.code, message: err.message, details: err.details },
    });
    return;
  }

  // multer's own size-limit rejection arrives as a MulterError, not an
  // AppError — surfaced here as a clean 400 instead of falling through to
  // the generic 500 below (found while reducing the upload limit for
  // Vercel's request-body cap, docs/phase10-deployment.md §9).
  if (err instanceof MulterError && err.code === "LIMIT_FILE_SIZE") {
    res.status(400).json({
      error: { code: "FILE_TOO_LARGE", message: "Audio file is too large (max 4MB)" },
    });
    return;
  }

  logger.error({ err, path: req.path }, "Unhandled error");
  res.status(500).json({
    error: { code: "INTERNAL_ERROR", message: "Something went wrong" },
  });
}

// Wraps an async route handler so a rejected promise reaches errorHandler
// instead of crashing the process (Express 4 does not do this automatically).
export function asyncHandler<T extends (req: Request, res: Response, next: NextFunction) => Promise<unknown>>(
  fn: T,
) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
}
