import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { Role } from "@openfolklore/shared";
import { env } from "./env.js";

const BCRYPT_COST_FACTOR = 12;
const JWT_EXPIRY = "7d";
export const AUTH_COOKIE_NAME = "openfolklore_token";

export interface JwtPayload {
  userId: string;
  role: Role;
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, BCRYPT_COST_FACTOR);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: JWT_EXPIRY });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, env.jwtSecret) as JwtPayload;
}

// httpOnly/Secure/SameSite=Strict cookie, per the security refinement in
// docs/phase7-implementation-plan.md §4 — mitigates XSS-based token theft,
// which a JSON-body token returned for localStorage would not.
export const authCookieOptions = {
  httpOnly: true,
  secure: env.isProduction,
  sameSite: "strict" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days, matches JWT_EXPIRY
  path: "/",
};
