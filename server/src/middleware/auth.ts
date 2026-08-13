import type { NextFunction, Request, Response } from "express";
import { AUTH_COOKIE_NAME, verifyToken } from "../lib/auth.js";
import { AppError } from "../lib/errors.js";

// Attaches req.user when a valid session cookie is present. Does NOT reject
// the request on its own — routes that require auth compose this with
// requireAuth or requireRole (rbac.ts), keeping "who is this" separate from
// "are they allowed" (docs/phase7-implementation-plan.md §2 middleware chain).
export function attachUser(req: Request, _res: Response, next: NextFunction) {
  const token = req.cookies?.[AUTH_COOKIE_NAME];
  if (token) {
    try {
      req.user = verifyToken(token);
    } catch {
      // Invalid/expired token: treat as anonymous rather than erroring here —
      // public routes must still work with a stale cookie present.
    }
  }
  next();
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  if (!req.user) {
    throw AppError.unauthorized();
  }
  next();
}
