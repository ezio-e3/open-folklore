import { Router } from "express";
import { takedownRequestSchema } from "@openfolklore/shared";
import { takedownController } from "../controllers/takedown.controller.js";
import { validate } from "../middleware/validate.js";
import { asyncHandler } from "../middleware/errorHandler.js";

export const takedownRouter = Router();

// FR20 — "any party", no authentication required.
takedownRouter.post("/", validate(takedownRequestSchema), asyncHandler(takedownController.create));
