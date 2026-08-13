import { describe, it, expect, vi } from "vitest";
import request from "supertest";
import { randomUUID } from "node:crypto";

// domainAcceptsMail (server/src/lib/emailDomain.ts) does real DNS lookups —
// its own logic (MX/A/AAAA fallback, fail-open on timeout) is unit-tested
// against a mocked `dns` module in tests/emailDomain.test.ts. Here we only
// need to confirm auth.service.ts wires a rejection into a 400, without
// making this integration test depend on live network/DNS behavior.
vi.mock("../src/lib/emailDomain.js", () => ({
  domainAcceptsMail: vi.fn(async (email: string) => !email.includes("@rejected.")),
}));

const { createApp } = await import("../src/app.js");
const app = createApp();

// gmail.com is used (rather than a project-owned test domain) because
// registration now checks the domain can actually receive mail — see
// server/src/lib/emailDomain.ts.
function uniqueEmail() {
  return `${randomUUID()}@gmail.com`;
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

  it("rejects an email whose domain can't receive mail (400)", async () => {
    const email = `${randomUUID()}@rejected.example`;
    const res = await request(app)
      .post("/api/auth/register")
      .send({ name: "Test", email, password: "password1" });
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
