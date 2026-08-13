import type { Request, Response } from "express";
import type { RoleUpdateInput } from "@openfolklore/shared";
import { userService } from "../services/user.service.js";

export const adminController = {
  async listUsers(_req: Request, res: Response) {
    const users = await userService.listAll();
    res.status(200).json({ users });
  },

  async updateRole(req: Request, res: Response) {
    const user = await userService.updateRole(req.params.id, req.body as RoleUpdateInput);
    res.status(200).json({ user });
  },
};
