import type { ModerationDecisionInput, StoryStatus } from "@openfolklore/shared";
import { prisma } from "../lib/prisma.js";
import { AppError } from "../lib/errors.js";
import { nextStoryStatus, type StoryTransition } from "./storyStateMachine.js";

const DECISION_TO_TRANSITION: Record<ModerationDecisionInput["decision"], StoryTransition> = {
  approved: "approve",
  rejected: "reject",
  changes_requested: "request_changes",
};

export const moderationService = {
  async decide(storyId: string, moderatorId: string, input: ModerationDecisionInput) {
    const story = await prisma.story.findUnique({ where: { id: storyId } });
    if (!story) throw AppError.notFound("Story not found");

    // BR5 (role) is enforced by rbac middleware before this runs; this
    // enforces the state machine so a story can't be double-processed by a
    // second moderator racing the first (docs/phase5-analysis.md §5 Concurrency).
    const transition = DECISION_TO_TRANSITION[input.decision];
    const newStatus: StoryStatus = nextStoryStatus(story.status as StoryStatus, transition);

    const [updated] = await prisma.$transaction([
      prisma.story.update({ where: { id: storyId }, data: { status: newStatus } }),
      prisma.moderationAction.create({
        data: {
          storyId,
          moderatorId,
          decision: input.decision,
          reason: input.reason ?? null, // BR7 required-if-rejected already enforced by the shared Zod schema
        },
      }),
    ]);

    return updated;
  },

  async linkVariant(storyIdA: string, storyIdB: string, linkedBy: string) {
    if (storyIdA === storyIdB) {
      throw AppError.badRequest("A story cannot be a variant of itself");
    }
    const [a, b] = await Promise.all([
      prisma.story.findUnique({ where: { id: storyIdA } }),
      prisma.story.findUnique({ where: { id: storyIdB } }),
    ]);
    if (!a || !b) throw AppError.notFound("One or both stories were not found");

    // BR6: variant links are always Moderator/Admin-confirmed (rbac middleware
    // enforces the role); this call itself IS the confirmation, there is no
    // separate "AI-suggested" auto-link path in this build (FR13 is Could-have).
    try {
      return await prisma.variantLink.create({
        data: { storyIdA, storyIdB, linkedBy },
      });
    } catch {
      throw AppError.conflict("These stories are already linked as variants");
    }
  },
};
