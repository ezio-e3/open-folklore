import type { Request, Response } from "express";
import type { ModerationDecisionInput, VariantLinkInput } from "@openfolklore/shared";
import { storyService } from "../services/story.service.js";
import { moderationService } from "../services/moderation.service.js";
import { AppError } from "../lib/errors.js";

export const moderationController = {
  async queue(_req: Request, res: Response) {
    const stories = await storyService.getQueue();
    res.status(200).json({ stories });
  },

  async getQueueItem(req: Request, res: Response) {
    const story = await storyService.getByIdForModerator(req.params.id);
    res.status(200).json({ story });
  },

  async decide(req: Request, res: Response) {
    if (!req.user) throw AppError.unauthorized();
    const updated = await moderationService.decide(
      req.params.id,
      req.user.userId,
      req.body as ModerationDecisionInput,
    );
    res.status(200).json({ story: updated });
  },

  async linkVariant(req: Request, res: Response) {
    if (!req.user) throw AppError.unauthorized();
    const { relatedStoryId } = req.body as VariantLinkInput;
    const link = await moderationService.linkVariant(req.params.id, relatedStoryId, req.user.userId);
    res.status(201).json({ link });
  },
};
