import { describe, it, expect } from "vitest";
import request from "supertest";
import { randomUUID } from "node:crypto";
import { createApp } from "../src/app.js";

const app = createApp();

function uniqueEmail() {
  return `${randomUUID()}@test.openfolklore.org`;
}

describe("Auth (FR15)", () => {
  it("registers a new user as a contributor by default", async () => {
    const email = uniqueEmail();
    const res = await request(app)
      .post("/api/auth/register")
      .send({ name: "Test User", email, password: "password1" });

    expect(res.status).toBe(201);
    expect(res.body.user.role).toBe("contributor"); // never client-selectable, docs/phase7-implementation-plan.md §4
    expect(res.body.user.email).toBe(email);
    expect(res.body.user.passwordHash).toBeUndefined();
  });

  it("rejects registering the same email twice (409)", async () => {
    const email = uniqueEmail();
    await request(app).post("/api/auth/register").send({ name: "First User", email, password: "password1" });
    const res = await request(app).post("/api/auth/register").send({ name: "Second User", email, password: "password2" });
    expect(res.status).toBe(409);
  });

  it("rejects a weak password (400, no digit)", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ name: "Test", email: uniqueEmail(), password: "nodigitshere" });
    expect(res.status).toBe(400);
  });

  it("rejects login with a wrong password (401)", async () => {
    const email = uniqueEmail();
    await request(app).post("/api/auth/register").send({ name: "Test", email, password: "password1" });
    const res = await request(app).post("/api/auth/login").send({ email, password: "wrongpassword1" });
    expect(res.status).toBe(401);
  });

  it("logs in successfully and sets an httpOnly auth cookie", async () => {
    const email = uniqueEmail();
    await request(app).post("/api/auth/register").send({ name: "Test", email, password: "password1" });
    const res = await request(app).post("/api/auth/login").send({ email, password: "password1" });
    expect(res.status).toBe(200);
    const cookie = res.headers["set-cookie"]?.[0];
    expect(cookie).toContain("HttpOnly");
  });
});
