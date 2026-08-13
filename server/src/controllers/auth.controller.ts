import type { Request, Response } from "express";
import type { RegisterInput, LoginInput } from "@openfolklore/shared";
import { authService } from "../services/auth.service.js";
import { authCookieOptions, AUTH_COOKIE_NAME } from "../lib/auth.js";

export const authController = {
  async register(req: Request, res: Response) {
    const { user, token } = await authService.register(req.body as RegisterInput);
    res.cookie(AUTH_COOKIE_NAME, token, authCookieOptions);
    res.status(201).json({ user });
  },

  async login(req: Request, res: Response) {
    const { user, token } = await authService.login(req.body as LoginInput);
    res.cookie(AUTH_COOKIE_NAME, token, authCookieOptions);
    res.status(200).json({ user });
  },

  async logout(_req: Request, res: Response) {
    res.clearCookie(AUTH_COOKIE_NAME, { path: "/" });
    res.status(204).send();
  },

  async me(req: Request, res: Response) {
    if (!req.user) {
      res.status(200).json({ user: null });
      return;
    }
    const user = await authService.getById(req.user.userId);
    res.status(200).json({ user });
  },
};
