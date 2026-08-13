import type { NextFunction, Request, Response } from "express";
import type { Role } from "@openfolklore/shared";
import { AppError } from "../lib/errors.js";

// Enforces the RBAC matrix in docs/phase7-implementation-plan.md §5 server-side.
// A direct API call from an unauthorized role must fail here regardless of what
// the UI shows or hides (docs/phase3-srs.md §3.2).
export function requireRole(...allowed: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw AppError.unauthorized();
    }
    if (!allowed.includes(req.user.role)) {
      throw AppError.forbidden();
    }
    next();
  };
}
