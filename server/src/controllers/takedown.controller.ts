import type { Request, Response } from "express";
import type { TakedownRequestInput, TakedownResolveInput } from "@openfolklore/shared";
import { takedownService } from "../services/takedown.service.js";
import { AppError } from "../lib/errors.js";

export const takedownController = {
  async create(req: Request, res: Response) {
    const request = await takedownService.create(req.body as TakedownRequestInput);
    res.status(201).json({ request });
  },

  async listOpen(_req: Request, res: Response) {
    const requests = await takedownService.listOpen();
    res.status(200).json({ requests });
  },

  async resolve(req: Request, res: Response) {
    if (!req.user) throw AppError.unauthorized();
    const request = await takedownService.resolve(
      req.params.id,
      req.user.userId,
      req.body as TakedownResolveInput,
    );
    res.status(200).json({ request });
  },
};
