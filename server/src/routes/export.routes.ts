import { Router } from "express";
import { exportController } from "../controllers/export.controller.js";
import { asyncHandler } from "../middleware/errorHandler.js";

export const exportRouter = Router();

// FR18 — public, published-only (enforced inside storyService.listPublishedForExport).
exportRouter.get("/", asyncHandler(exportController.export));
