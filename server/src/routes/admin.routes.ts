import { Router } from "express";
import { roleUpdateSchema, takedownResolveSchema } from "@openfolklore/shared";
import { adminController } from "../controllers/admin.controller.js";
import { takedownController } from "../controllers/takedown.controller.js";
import { validate } from "../middleware/validate.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import { requireRole } from "../middleware/rbac.js";

export const adminRouter = Router();

// Every route here is Admin-only (RBAC matrix, docs/phase7-implementation-plan.md §5).
adminRouter.use(requireRole("admin"));

adminRouter.get("/users", asyncHandler(adminController.listUsers));
adminRouter.patch("/users/:id/role", validate(roleUpdateSchema), asyncHandler(adminController.updateRole));

// Read endpoint supporting the Admin's takedown review flow (BR8) — not
// listed as its own row in the Phase 6 API table, which only specified the
// resolve action; a review queue needs a way to see what's open first.
adminRouter.get("/takedown-requests", asyncHandler(takedownController.listOpen));
adminRouter.post(
  "/takedown-requests/:id/resolve",
  validate(takedownResolveSchema),
  asyncHandler(takedownController.resolve),
);
