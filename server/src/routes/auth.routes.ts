import { Router } from "express";
import { registerSchema, loginSchema } from "@openfolklore/shared";
import { authController } from "../controllers/auth.controller.js";
import { validate } from "../middleware/validate.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import { authRateLimiter } from "../middleware/rateLimiter.js";

export const authRouter = Router();

authRouter.post("/register", authRateLimiter, validate(registerSchema), asyncHandler(authController.register));
authRouter.post("/login", authRateLimiter, validate(loginSchema), asyncHandler(authController.login));
authRouter.post("/logout", asyncHandler(authController.logout));
authRouter.get("/me", asyncHandler(authController.me));
