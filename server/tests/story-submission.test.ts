import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../src/app.js";
import { loginAs } from "./helpers.js";

const app = createApp();

const validFields = {
  title: "A Test Tale",
  textBody: "Once upon a time, in a test suite far away.",
  language: "Testish",
  region: "Testland",
  narratorName: "Test Narrator",
  attested: "true",
};

describe("Story submission (FR1-FR4, BR1-BR3)", () => {
  it("rejects an unauthenticated submission (401)", async () => {
    const res = await request(app).post("/api/stories").field(validFields);
    expect(res.status).toBe(401);
  });

  it("rejects a submission with neither text nor audio (BR1)", async () => {
    const { agent } = await loginAs(app, "contributor");
    const res = await agent
      .post("/api/stories")
      .field({ ...validFields, textBody: "" });
    expect(res.status).toBe(400);
  });

  it("rejects a submission with neither region nor ethnic group (BR2)", async () => {
    const { agent } = await loginAs(app, "contributor");
    const res = await agent
      .post("/api/stories")
      .field({ ...validFields, region: "", ethnicGroup: "" });
    expect(res.status).toBe(400);
  });

  it("rejects a submission without the rights attestation (BR3)", async () => {
    const { agent } = await loginAs(app, "contributor");
    const res = await agent.post("/api/stories").field({ ...validFields, attested: "false" });
    expect(res.status).toBe(400);
  });

  it("accepts a valid submission and sets status to pending_review", async () => {
    const { agent } = await loginAs(app, "contributor");
    const res = await agent.post("/api/stories").field(validFields);
    expect(res.status).toBe(201);
    expect(res.body.status).toBe("pending_review");
  });

  it("does not expose a pending submission through the public list or detail endpoints", async () => {
    const { agent } = await loginAs(app, "contributor");
    const submitRes = await agent.post("/api/stories").field(validFields);
    const id = submitRes.body.id;

    const listRes = await request(app).get("/api/stories");
    expect(listRes.body.stories.some((s: { id: string }) => s.id === id)).toBe(false);

    const detailRes = await request(app).get(`/api/stories/${id}`);
    expect(detailRes.status).toBe(404); // cross-cutting invariant, docs/phase6-design.md §5
  });

  it("lets a Contributor see their own pending submission via /mine (D1, docs/phase9-technical-debt.md)", async () => {
    const { agent } = await loginAs(app, "contributor");
    const submitRes = await agent.post("/api/stories").field(validFields);
    const id = submitRes.body.id;

    const mineRes = await agent.get("/api/stories/mine");
    expect(mineRes.status).toBe(200);
    const own = mineRes.body.stories.find((s: { id: string }) => s.id === id);
    expect(own?.status).toBe("pending_review");
  });

  it("rejects /mine without authentication (401)", async () => {
    const res = await request(app).get("/api/stories/mine");
    expect(res.status).toBe(401);
  });
});

describe("Story facets (Landing page 'Featured cultures', docs/phase13-future-evolution.md)", () => {
  it("counts only published stories, excluding pending ones, with no auth required", async () => {
    const uniqueRegion = `Facet Test Region ${Date.now()}`;
    const { agent: contributor } = await loginAs(app, "contributor");
    const submitRes = await contributor.post("/api/stories").field({
      ...validFields,
      region: uniqueRegion,
      ethnicGroup: "",
    });
    const id = submitRes.body.id;

    const beforeApproval = await request(app).get("/api/stories/facets");
    expect(beforeApproval.status).toBe(200);
    expect(beforeApproval.body.regions.some((r: { value: string }) => r.value === uniqueRegion)).toBe(false);

    const { agent: moderator } = await loginAs(app, "moderator");
    await moderator.post(`/api/moderation/${id}/decision`).send({ decision: "approved" });

    const afterApproval = await request(app).get("/api/stories/facets");
    const facet = afterApproval.body.regions.find((r: { value: string }) => r.value === uniqueRegion);
    expect(facet?.count).toBe(1);
  });
});
