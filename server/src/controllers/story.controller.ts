import type { Request, Response } from "express";
import type { StoryFiltersInput, StorySubmissionInput } from "@openfolklore/shared";
import { storyService } from "../services/story.service.js";
import { AppError } from "../lib/errors.js";

export const storyController = {
  async submit(req: Request, res: Response) {
    if (!req.user) throw AppError.unauthorized();
    const body = req.body as StorySubmissionInput;
    const file = req.file; // set by multer (middleware/upload.ts) if an audio file was sent

    const result = await storyService.submitStory({
      ...body,
      submitterId: req.user.userId,
      // multer.memoryStorage() (middleware/upload.ts) puts the raw bytes in
      // file.buffer rather than writing to disk — StorageService decides
      // where they actually end up (local disk or Vercel Blob).
      audioFile: file ? { buffer: file.buffer, originalName: file.originalname, mimeType: file.mimetype } : null,
    });

    res.status(201).json({ id: result.id, status: "pending_review" });
  },

  async list(req: Request, res: Response) {
    const filters = req.query as unknown as StoryFiltersInput;
    const stories = await storyService.listPublished(filters);
    res.status(200).json({ stories });
  },

  async getById(req: Request, res: Response) {
    const story = await storyService.getPublishedById(req.params.id);
    res.status(200).json({ story });
  },

  async mine(req: Request, res: Response) {
    if (!req.user) throw AppError.unauthorized();
    const stories = await storyService.listMine(req.user.userId);
    res.status(200).json({ stories });
  },
};
