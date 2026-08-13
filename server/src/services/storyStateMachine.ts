import type { StoryStatus } from "@openfolklore/shared";
import { AppError } from "../lib/errors.js";

// State pattern: every valid Story status transition is defined once, here.
// Nothing else in the codebase should assign story.status directly — this is
// the single place an invalid transition (e.g. rejected -> published) can be
// caught (docs/phase6-design.md §6; state diagram docs/phase6-design.md §3.4).
export type StoryTransition = "approve" | "reject" | "request_changes" | "resubmit" | "uphold_takedown";

const TRANSITIONS: Record<StoryTransition, { from: StoryStatus[]; to: StoryStatus }> = {
  approve: { from: ["pending_review"], to: "published" },
  reject: { from: ["pending_review"], to: "rejected" },
  request_changes: { from: ["pending_review"], to: "changes_requested" },
  resubmit: { from: ["changes_requested"], to: "pending_review" },
  uphold_takedown: { from: ["published"], to: "unpublished" }, // BR9
};

export function nextStoryStatus(current: StoryStatus, transition: StoryTransition): StoryStatus {
  const rule = TRANSITIONS[transition];
  if (!rule.from.includes(current)) {
    throw AppError.conflict(
      `Cannot apply "${transition}" to a story in status "${current}"`,
    );
  }
  return rule.to;
}
