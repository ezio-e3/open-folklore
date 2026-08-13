import { Router } from "express";
import { moderationDecisionSchema } from "@openfolklore/shared";
import { moderationController } from "../controllers/moderation.controller.js";
import { validate } from "../middleware/validate.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import { requireRole } from "../middleware/rbac.js";

export const moderationRouter = Router();

// Every route here requires Moderator or Admin (RBAC matrix, docs/phase7-implementation-plan.md §5).
moderationRouter.use(requireRole("moderator", "admin"));

moderationRouter.get("/queue", asyncHandler(moderationController.queue));
moderationRouter.get("/queue/:id", asyncHandler(moderationController.getQueueItem));
moderationRouter.post(
  "/:id/decision",
  validate(moderationDecisionSchema),
  asyncHandler(moderationController.decide),
);
