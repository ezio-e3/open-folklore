import type {
  StorySubmissionInput,
  StoryFiltersInput,
  StorySummaryDTO,
  StoryDetailDTO,
  TranscriptSource,
} from "@openfolklore/shared";
import { prisma } from "../lib/prisma.js";
import { AppError } from "../lib/errors.js";
import { storageService, type UploadedFile } from "./storage.service.js";
import { asrService } from "./asr.service.js";
import { logger } from "../lib/logger.js";
import type { Prisma } from "@prisma/client";

type StoryWithAudio = Prisma.StoryGetPayload<{ include: { audio: true } }>;

function toSummaryDTO(story: { id: string; title: string; status: string; language: string; region: string | null; ethnicGroup: string | null; narratorName: string; createdAt: Date; audio?: unknown }): StorySummaryDTO {
  return {
    id: story.id,
    title: story.title,
    status: story.status as StorySummaryDTO["status"],
    language: story.language,
    region: story.region,
    ethnicGroup: story.ethnicGroup,
    narratorName: story.narratorName,
    hasAudio: Boolean(story.audio),
    createdAt: story.createdAt.toISOString(),
  };
}

async function getVariantSummaries(storyId: string, requirePublished: boolean): Promise<StorySummaryDTO[]> {
  const links = await prisma.variantLink.findMany({
    where: { OR: [{ storyIdA: storyId }, { storyIdB: storyId }] },
  });
  const relatedIds = links.map((l) => (l.storyIdA === storyId ? l.storyIdB : l.storyIdA));
  if (relatedIds.length === 0) return [];

  const related = await prisma.story.findMany({
    where: { id: { in: relatedIds }, ...(requirePublished ? { status: "published" } : {}) },
    include: { audio: true },
  });
  return related.map(toSummaryDTO);
}

async function toDetailDTO(story: StoryWithAudio, requirePublished: boolean): Promise<StoryDetailDTO> {
  const variants = await getVariantSummaries(story.id, requirePublished);
  return {
    ...toSummaryDTO(story),
    textBody: story.textBody,
    license: story.license,
    submitterId: story.submitterId,
    updatedAt: story.updatedAt.toISOString(),
    audio: story.audio
      ? {
          id: story.audio.id,
          fileUrl: story.audio.fileUrl, // already a full URL — save() returns it directly (local path or Blob URL)
          durationSeconds: story.audio.durationSeconds,
          transcript: story.audio.transcript,
          transcriptSource: story.audio.transcriptSource as TranscriptSource,
        }
      : null,
    variants,
  };
}

export interface SubmitStoryInput extends StorySubmissionInput {
  submitterId: string;
  audioFile?: UploadedFile | null;
}

export const storyService = {
  async submitStory(input: SubmitStoryInput): Promise<{ id: string }> {
    // BR1: text or audio required. Zod already enforced the shape of each
    // field individually; this cross-cutting rule depends on the uploaded
    // file's presence, which is only known here (docs/phase6-design.md §4 notes).
    const hasText = Boolean(input.textBody && input.textBody.trim().length > 0);
    const hasAudio = Boolean(input.audioFile);
    if (!hasText && !hasAudio) {
      throw AppError.badRequest("A story needs text, audio, or both");
    }

    const story = await prisma.story.create({
      data: {
        title: input.title,
        textBody: hasText ? input.textBody : null,
        language: input.language,
        region: input.region || null,
        ethnicGroup: input.ethnicGroup || null,
        narratorName: input.narratorName,
        submitterId: input.submitterId,
        status: "pending_review",
      },
    });

    if (input.audioFile) {
      // save() performs the actual upload (local disk or Vercel Blob) and
      // returns the final servable URL directly — no separate "convert
      // stored value to URL" step at read time (docs/phase10-deployment.md §9).
      const fileUrl = await storageService.save(input.audioFile);
      await prisma.audioNarration.create({
        data: { storyId: story.id, fileUrl, transcriptSource: "none" },
      });

      // Best-effort, non-blocking (Reliability NFR, docs/phase3-srs.md §4) —
      // submission has already succeeded above regardless of what happens here.
      asrService
        .transcribe(fileUrl)
        .then((transcript) => {
          if (!transcript) return;
          return prisma.audioNarration.update({
            where: { storyId: story.id },
            data: { transcript, transcriptSource: "asr" },
          });
        })
        .catch((err) => logger.warn({ err, storyId: story.id }, "Post-submission ASR update failed"));
    }

    return { id: story.id };
  },

  async listPublished(filters: StoryFiltersInput): Promise<StorySummaryDTO[]> {
    const where: Prisma.StoryWhereInput = {
      status: "published", // cross-cutting invariant — never conditional (docs/phase6-design.md §5)
      ...(filters.region ? { region: { contains: filters.region } } : {}),
      ...(filters.ethnicGroup ? { ethnicGroup: { contains: filters.ethnicGroup } } : {}),
      ...(filters.language ? { language: { contains: filters.language } } : {}),
      ...(filters.q
        ? { OR: [{ title: { contains: filters.q } }, { textBody: { contains: filters.q } }] }
        : {}),
    };
    const stories = await prisma.story.findMany({
      where,
      include: { audio: true },
      orderBy: { createdAt: "desc" },
    });
    return stories.map(toSummaryDTO);
  },

  async getPublishedById(id: string): Promise<StoryDetailDTO> {
    const story = await prisma.story.findFirst({
      where: { id, status: "published" },
      include: { audio: true },
    });
    if (!story) throw AppError.notFound("Story not found");
    return toDetailDTO(story, true);
  },

  /** For moderators/admins — any status, used by the moderation queue detail view. */
  async getByIdForModerator(id: string): Promise<StoryDetailDTO> {
    const story = await prisma.story.findUnique({ where: { id }, include: { audio: true } });
    if (!story) throw AppError.notFound("Story not found");
    return toDetailDTO(story, false);
  },

  async getQueue(): Promise<StorySummaryDTO[]> {
    const stories = await prisma.story.findMany({
      where: { status: { in: ["pending_review", "changes_requested"] } },
      include: { audio: true },
      orderBy: { createdAt: "asc" },
    });
    return stories.map(toSummaryDTO);
  },

  async listPublishedForExport(): Promise<StoryDetailDTO[]> {
    const stories = await prisma.story.findMany({ where: { status: "published" }, include: { audio: true } });
    return Promise.all(stories.map((s) => toDetailDTO(s, true)));
  },

  // Closes D1 (docs/phase9-technical-debt.md) — FR7 said the Contributor is
  // "notified" of a moderation decision; no email/push channel is in scope
  // (Phase 6/7), so this gives them a place to check status themselves,
  // regardless of outcome (unlike every other read path, this one is NOT
  // published-only by design — a Contributor must see their own rejections).
  async listMine(submitterId: string): Promise<StorySummaryDTO[]> {
    const stories = await prisma.story.findMany({
      where: { submitterId },
      include: { audio: true },
      orderBy: { createdAt: "desc" },
    });
    return stories.map(toSummaryDTO);
  },
};
