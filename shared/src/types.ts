// Domain enums and DTOs shared between server and client.
// Source of truth: docs/phase6-design.md §3.2 (Class Diagram) and §4 (Database Schema).

export type Role = "contributor" | "moderator" | "admin";

// "unpublished" added in SRS v1.1 (docs/phase3-srs.md §9 changelog) after the
// Phase 5 analysis finding that an upheld takedown must have a defined effect on the Story.
export type StoryStatus =
  | "pending_review"
  | "published"
  | "rejected"
  | "changes_requested"
  | "unpublished";

export type ModerationDecision = "approved" | "rejected" | "changes_requested";

export type TakedownStatus = "open" | "dismissed" | "upheld";

export type TakedownOutcome = "dismissed" | "upheld";

export type TranscriptSource = "asr" | "manual" | "none";

export interface UserDTO {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
}

export interface AudioNarrationDTO {
  id: string;
  fileUrl: string;
  durationSeconds: number | null;
  transcript: string | null;
  transcriptSource: TranscriptSource;
}

export interface VariantLinkDTO {
  id: string;
  storyIdA: string;
  storyIdB: string;
  linkedBy: string;
  createdAt: string;
}

export interface ModerationActionDTO {
  id: string;
  storyId: string;
  moderatorId: string;
  decision: ModerationDecision;
  reason: string | null;
  createdAt: string;
}

// Summary shape used in browse/search lists (FR8).
export interface StorySummaryDTO {
  id: string;
  title: string;
  status: StoryStatus;
  language: string;
  region: string | null;
  ethnicGroup: string | null;
  narratorName: string;
  hasAudio: boolean;
  createdAt: string;
}

// Full shape used on the story detail page (FR9, FR10) and moderation queue (FR5).
export interface StoryDetailDTO extends StorySummaryDTO {
  textBody: string | null;
  license: string;
  submitterId: string;
  audio: AudioNarrationDTO | null;
  variants: StorySummaryDTO[];
  updatedAt: string;
}

export interface TakedownRequestDTO {
  id: string;
  storyId: string;
  requesterName: string;
  requesterEmail: string;
  reason: string;
  status: TakedownStatus;
  reviewedBy: string | null;
  createdAt: string;
  resolvedAt: string | null;
}

export const CONTENT_LICENSE_DEFAULT = "CC BY-NC-SA 4.0";

// Curated suggestions, not an enforced enum — the taxonomy stays free-text
// and extensible per the Internationalization NFR (docs/phase3-srs.md §4).
export const LANGUAGE_SUGGESTIONS = [
  "Twi",
  "Ewe",
  "Ga",
  "Dagbani",
  "Yoruba",
  "Zulu",
  "Swahili",
  "Amharic",
  "English",
] as const;

export const REGION_SUGGESTIONS = [
  "Ghana",
  "Nigeria",
  "South Africa",
  "Kenya/Tanzania (Swahili Coast)",
  "Ethiopia",
] as const;
