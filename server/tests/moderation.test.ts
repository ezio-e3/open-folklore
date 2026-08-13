import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../src/app.js";
import { loginAs } from "./helpers.js";

const app = createApp();

async function submitPendingStory(agent: ReturnType<typeof request.agent>) {
  const res = await agent.post("/api/stories").field({
    title: "Story Pending Moderation",
    textBody: "Text body for moderation testing.",
    language: "Testish",
    region: "Testland",
    narratorName: "Test Narrator",
    attested: "true",
  });
  return res.body.id as string;
}

describe("Moderation (FR4-FR7, BR5-BR7)", () => {
  it("rejects queue access without auth (401) and for a contributor (403)", async () => {
    const unauth = await request(app).get("/api/moderation/queue");
    expect(unauth.status).toBe(401);

    const { agent } = await loginAs(app, "contributor");
    const forbidden = await agent.get("/api/moderation/queue");
    expect(forbidden.status).toBe(403);
  });

  it("allows a moderator to approve a pending story, making it publicly visible", async () => {
    const { agent: contributor } = await loginAs(app, "contributor");
    const id = await submitPendingStory(contributor);

    const { agent: moderator } = await loginAs(app, "moderator");
    const decision = await moderator.post(`/api/moderation/${id}/decision`).send({ decision: "approved" });
    expect(decision.status).toBe(200);
    expect(decision.body.story.status).toBe("published");

    const publicView = await request(app).get(`/api/stories/${id}`);
    expect(publicView.status).toBe(200);
  });

  it("requires a reason to reject a story (BR7)", async () => {
    const { agent: contributor } = await loginAs(app, "contributor");
    const id = await submitPendingStory(contributor);

    const { agent: moderator } = await loginAs(app, "moderator");
    const noReason = await moderator.post(`/api/moderation/${id}/decision`).send({ decision: "rejected" });
    expect(noReason.status).toBe(400);

    const withReason = await moderator
      .post(`/api/moderation/${id}/decision`)
      .send({ decision: "rejected", reason: "Not a traditional tale" });
    expect(withReason.status).toBe(200);
    expect(withReason.body.story.status).toBe("rejected");
  });

  it("refuses to re-approve an already-published story (state machine, 409)", async () => {
    const { agent: contributor } = await loginAs(app, "contributor");
    const id = await submitPendingStory(contributor);

    const { agent: moderator } = await loginAs(app, "moderator");
    await moderator.post(`/api/moderation/${id}/decision`).send({ decision: "approved" });
    const secondAttempt = await moderator.post(`/api/moderation/${id}/decision`).send({ decision: "approved" });
    expect(secondAttempt.status).toBe(409);
  });

  it("lets a moderator link two published stories as variants", async () => {
    const { agent: contributor } = await loginAs(app, "contributor");
    const idA = await submitPendingStory(contributor);
    const idB = await submitPendingStory(contributor);

    const { agent: moderator } = await loginAs(app, "moderator");
    await moderator.post(`/api/moderation/${idA}/decision`).send({ decision: "approved" });
    await moderator.post(`/api/moderation/${idB}/decision`).send({ decision: "approved" });

    const link = await moderator.post(`/api/stories/${idA}/variant-link`).send({ relatedStoryId: idB });
    expect(link.status).toBe(201);

    const detail = await request(app).get(`/api/stories/${idA}`);
    expect(detail.body.story.variants.map((v: { id: string }) => v.id)).toContain(idB);
  });
});
