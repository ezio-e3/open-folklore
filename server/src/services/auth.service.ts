import type { RegisterInput, LoginInput, UserDTO } from "@openfolklore/shared";
import { prisma } from "../lib/prisma.js";
import { hashPassword, verifyPassword, signToken } from "../lib/auth.js";
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

export const authService = {
  async register(input: RegisterInput): Promise<{ user: UserDTO; token: string }> {
    const existing = await prisma.user.findUnique({ where: { email: input.email } });
    if (existing) {
      throw AppError.conflict("An account with this email already exists");
    }

    // Security rule (docs/phase7-implementation-plan.md §4): role is never
    // client-selectable at registration — always "contributor". Moderator/
    // Admin are only ever set by the seed script or an existing Admin (FR16).
    const passwordHash = await hashPassword(input.password);
    const user = await prisma.user.create({
      data: { name: input.name, email: input.email, passwordHash, role: "contributor" },
    });

    const token = signToken({ userId: user.id, role: user.role as UserDTO["role"] });
    return { user: toUserDTO(user), token };
  },

  async login(input: LoginInput): Promise<{ user: UserDTO; token: string }> {
    const user = await prisma.user.findUnique({ where: { email: input.email } });
    if (!user || !(await verifyPassword(input.password, user.passwordHash))) {
      throw AppError.unauthorized("Invalid email or password");
    }
    const token = signToken({ userId: user.id, role: user.role as UserDTO["role"] });
    return { user: toUserDTO(user), token };
  },

  async getById(userId: string): Promise<UserDTO | null> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    return user ? toUserDTO(user) : null;
  },
};
