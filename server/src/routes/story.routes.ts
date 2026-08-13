import { Router } from "express";
import { storyFiltersSchema, storySubmissionSchema, variantLinkSchema } from "@openfolklore/shared";
import { storyController } from "../controllers/story.controller.js";
import { moderationController } from "../controllers/moderation.controller.js";
import { validate } from "../middleware/validate.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/rbac.js";
import { uploadAudio } from "../middleware/upload.js";
import { submissionRateLimiter } from "../middleware/rateLimiter.js";

export const storyRouter = Router();

storyRouter.get("/", validate(storyFiltersSchema, "query"), asyncHandler(storyController.list));

// Must be registered before "/:id" — otherwise Express would match this
// path as a story lookup with id="mine" (closes D1, docs/phase9-technical-debt.md).
storyRouter.get("/mine", requireAuth, asyncHandler(storyController.mine));

storyRouter.get("/:id", asyncHandler(storyController.getById));

// multer runs before Zod validation: multipart fields only land in req.body
// once multer parses them (docs/phase7-implementation-plan.md §7).
storyRouter.post(
  "/",
  requireAuth,
  submissionRateLimiter,
  uploadAudio,
  validate(storySubmissionSchema),
  asyncHandler(storyController.submit),
);

// FR6/BR6 — matches the API spec in docs/phase6-design.md §5 exactly
// (kept on the /stories resource rather than /moderation, even though it's a
// moderator-only action, per the documented design).
storyRouter.post(
  "/:id/variant-link",
  requireRole("moderator", "admin"),
  validate(variantLinkSchema),
  asyncHandler(moderationController.linkVariant),
);
