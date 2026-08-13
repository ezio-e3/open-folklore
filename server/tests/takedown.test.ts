import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../src/app.js";
import { loginAs } from "./helpers.js";

const app = createApp();

async function publishStory() {
  const { agent: contributor } = await loginAs(app, "contributor");
  const submit = await contributor.post("/api/stories").field({
    title: "Story Subject To Takedown",
    textBody: "Text body.",
    language: "Testish",
    region: "Testland",
    narratorName: "Test Narrator",
    attested: "true",
  });
  const id = submit.body.id as string;

  const { agent: moderator } = await loginAs(app, "moderator");
  await moderator.post(`/api/moderation/${id}/decision`).send({ decision: "approved" });
  return id;
}

describe("Takedown (FR20, BR8, BR9)", () => {
  it("lets anyone file a takedown request without authentication", async () => {
    const storyId = await publishStory();
    const res = await request(app).post("/api/takedown-requests").send({
      storyId,
      requesterName: "Concerned Party",
      requesterEmail: "concerned@example.com",
      reason: "This provenance claim looks incorrect to me.",
    });
    expect(res.status).toBe(201);
    expect(res.body.request.status).toBe("open");
  });

  it("dismissing a request leaves the story published", async () => {
    const storyId = await publishStory();
    const filed = await request(app).post("/api/takedown-requests").send({
      storyId,
      requesterName: "Requester A",
      requesterEmail: "a@example.com",
      reason: "Testing the dismiss outcome path here.",
    });

    const { agent: admin } = await loginAs(app, "admin");
    const resolved = await admin
      .post(`/api/admin/takedown-requests/${filed.body.request.id}/resolve`)
      .send({ outcome: "dismissed" });
    expect(resolved.status).toBe(200);

    const stillPublic = await request(app).get(`/api/stories/${storyId}`);
    expect(stillPublic.status).toBe(200);
  });

  it("upholding a request unpublishes the story (BR9)", async () => {
    const storyId = await publishStory();
    const filed = await request(app).post("/api/takedown-requests").send({
      storyId,
      requesterName: "Requester B",
      requesterEmail: "b@example.com",
      reason: "Testing the uphold outcome path here.",
    });

    const { agent: admin } = await loginAs(app, "admin");
    const resolved = await admin
      .post(`/api/admin/takedown-requests/${filed.body.request.id}/resolve`)
      .send({ outcome: "upheld" });
    expect(resolved.status).toBe(200);

    const noLongerPublic = await request(app).get(`/api/stories/${storyId}`);
    expect(noLongerPublic.status).toBe(404); // unpublished, not deleted — still in the DB with its audit trail
  });

  it("rejects resolving the same request twice (409)", async () => {
    const storyId = await publishStory();
    const filed = await request(app).post("/api/takedown-requests").send({
      storyId,
      requesterName: "Requester C",
      requesterEmail: "c@example.com",
      reason: "Testing the double-resolve guard here.",
    });

    const { agent: admin } = await loginAs(app, "admin");
    await admin.post(`/api/admin/takedown-requests/${filed.body.request.id}/resolve`).send({ outcome: "dismissed" });
    const again = await admin
      .post(`/api/admin/takedown-requests/${filed.body.request.id}/resolve`)
      .send({ outcome: "upheld" });
    expect(again.status).toBe(409);
  });
});
