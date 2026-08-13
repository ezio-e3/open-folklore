import rateLimit from "express-rate-limit";

// Applied to auth and submission endpoints to deter credential-stuffing and
// submission spam (docs/phase7-implementation-plan.md §6).
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { code: "RATE_LIMITED", message: "Too many attempts — try again later" } },
});

export const submissionRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { code: "RATE_LIMITED", message: "Too many submissions — try again later" } },
});
