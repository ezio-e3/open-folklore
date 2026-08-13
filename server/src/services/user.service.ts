import type { RoleUpdateInput, UserDTO } from "@openfolklore/shared";
import { prisma } from "../lib/prisma.js";
import { AppError } from "../lib/errors.js";

function toUserDTO(user: { id: string; name: string; email: string; role: string; createdAt: Date }): UserDTO {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role as UserDTO["role"],
    createdAt: user.createdAt.toISOString(),
  };
}

// FR16 — Admin-only (enforced by rbac middleware at the route level).
export const userService = {
  async listAll(): Promise<UserDTO[]> {
    const users = await prisma.user.findMany({ orderBy: { createdAt: "asc" } });
    return users.map(toUserDTO);
  },

  async updateRole(userId: string, input: RoleUpdateInput): Promise<UserDTO> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw AppError.notFound("User not found");
    const updated = await prisma.user.update({ where: { id: userId }, data: { role: input.role } });
    return toUserDTO(updated);
  },
};
