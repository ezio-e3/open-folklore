import type { StoryStatus, TakedownRequestInput, TakedownResolveInput } from "@openfolklore/shared";
import { prisma } from "../lib/prisma.js";
import { AppError } from "../lib/errors.js";
import { nextStoryStatus } from "./storyStateMachine.js";

export const takedownService = {
  async create(input: TakedownRequestInput) {
    const story = await prisma.story.findUnique({ where: { id: input.storyId } });
    if (!story) throw AppError.notFound("Story not found");

    return prisma.takedownRequest.create({
      data: {
        storyId: input.storyId,
        requesterName: input.requesterName,
        requesterEmail: input.requesterEmail,
        reason: input.reason,
        status: "open",
      },
    });
  },

  async listOpen() {
    return prisma.takedownRequest.findMany({ where: { status: "open" }, orderBy: { createdAt: "asc" } });
  },

  // BR8: every resolution is recorded with the reviewing Admin and a
  // timestamp. BR9 (added in SRS v1.1, docs/phase5-analysis.md §5): an
  // "upheld" outcome transitions the Story to unpublished; both writes happen
  // in one transaction so the request and the story can never disagree.
  async resolve(requestId: string, adminId: string, input: TakedownResolveInput) {
    const request = await prisma.takedownRequest.findUnique({ where: { id: requestId } });
    if (!request) throw AppError.notFound("Takedown request not found");
    if (request.status !== "open") {
      throw AppError.conflict("This request has already been reviewed");
    }

    return prisma.$transaction(async (tx) => {
      const updatedRequest = await tx.takedownRequest.update({
        where: { id: requestId },
        data: { status: input.outcome, reviewedBy: adminId, resolvedAt: new Date() },
      });

      if (input.outcome === "upheld") {
        const story = await tx.story.findUniqueOrThrow({ where: { id: request.storyId } });
        const newStatus = nextStoryStatus(story.status as StoryStatus, "uphold_takedown");
        await tx.story.update({ where: { id: request.storyId }, data: { status: newStatus } });
      }

      return updatedRequest;
    });
  },
};
