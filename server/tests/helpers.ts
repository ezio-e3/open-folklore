import request from "supertest";
import type { Express } from "express";
import { randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/prisma.js";
import type { Role } from "@openfolklore/shared";

export function uniqueEmail() {
  return `${randomUUID()}@test.openfolklore.org`;
}

// Creates a user directly via Prisma (role isn't client-settable through the
// API by design, docs/phase7-implementation-plan.md §4) then logs in through
// the real endpoint to obtain a genuine cookie — so tests exercise the actual
// auth flow, not a shortcut that skips it.
export async function loginAs(app: Express, role: Role) {
  const email = uniqueEmail();
  const password = "password1";
  const passwordHash = await bcrypt.hash(password, 4); // low cost factor — tests only, speed over security
  const user = await prisma.user.create({ data: { name: `Test ${role}`, email, passwordHash, role } });

  const agent = request.agent(app);
  const res = await agent.post("/api/auth/login").send({ email, password });
  if (res.status !== 200) throw new Error(`Test login failed: ${res.status} ${JSON.stringify(res.body)}`);

  return { agent, user };
}
