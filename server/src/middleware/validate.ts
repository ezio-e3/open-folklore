import type { NextFunction, Request, Response } from "express";
import type { ZodTypeAny } from "zod";
import { AppError } from "../lib/errors.js";

type Source = "body" | "query";

// Validates req[source] against a Zod schema and replaces it with the parsed
// (typed, trimmed, coerced) value, or throws a 400 with field-level details.
// Shared schemas (from @openfolklore/shared) mean these are the exact same
// rules the client already checked — server-side re-validation, not
// duplicated re-invention (docs/phase7-implementation-plan.md §7).
export function validate(schema: ZodTypeAny, source: Source = "body") {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      throw AppError.badRequest("Validation failed", result.error.flatten());
    }
    req[source] = result.data;
    next();
  };
}
