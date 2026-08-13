// Zod validation schemas shared by client (form validation) and server (request
// validation) so BR1/BR2/BR3/BR7 are defined once and enforced identically on both
// sides. Source of truth: docs/phase7-implementation-plan.md §7.
import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/\d/, "Password must contain at least one digit"),
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});
export type LoginInput = z.infer<typeof loginSchema>;

// Fields of a story submission that arrive as multipart form fields (the audio
// file itself is validated separately by upload middleware — see server/src/middleware/upload.ts).
// BR1 (text or audio required) can only be fully checked once the presence of an
// uploaded file is known, so it is re-verified in StoryService, not only here.
export const storySubmissionSchema = z
  .object({
    title: z.string().trim().min(3).max(200),
    textBody: z.string().trim().max(20000).optional().or(z.literal("")),
    language: z.string().trim().min(2).max(60),
    region: z.string().trim().max(100).optional().or(z.literal("")),
    ethnicGroup: z.string().trim().max(100).optional().or(z.literal("")),
    narratorName: z.string().trim().min(2).max(100),
    attested: z
      .union([z.literal("true"), z.boolean()])
      .refine((v) => v === true || v === "true", {
        message: "You must confirm you have the right to share this story",
      }),
  })
  .refine((data) => Boolean(data.region) || Boolean(data.ethnicGroup), {
    message: "At least one of region or ethnic group is required",
    path: ["region"],
  });
export type StorySubmissionInput = z.infer<typeof storySubmissionSchema>;

export const moderationDecisionSchema = z
  .object({
    decision: z.enum(["approved", "rejected", "changes_requested"]),
    reason: z.string().trim().min(5).max(1000).optional(),
  })
  .refine((data) => data.decision !== "rejected" || Boolean(data.reason), {
    message: "A reason is required when rejecting a submission",
    path: ["reason"],
  });
export type ModerationDecisionInput = z.infer<typeof moderationDecisionSchema>;

export const variantLinkSchema = z.object({
  relatedStoryId: z.string().min(1),
});
export type VariantLinkInput = z.infer<typeof variantLinkSchema>;

export const takedownRequestSchema = z.object({
  storyId: z.string().min(1),
  requesterName: z.string().trim().min(2).max(100),
  requesterEmail: z.string().trim().email(),
  reason: z.string().trim().min(10).max(2000),
});
export type TakedownRequestInput = z.infer<typeof takedownRequestSchema>;

export const takedownResolveSchema = z.object({
  outcome: z.enum(["dismissed", "upheld"]),
});
export type TakedownResolveInput = z.infer<typeof takedownResolveSchema>;

export const roleUpdateSchema = z.object({
  role: z.enum(["contributor", "moderator", "admin"]),
});
export type RoleUpdateInput = z.infer<typeof roleUpdateSchema>;

export const storyFiltersSchema = z.object({
  region: z.string().trim().optional(),
  ethnicGroup: z.string().trim().optional(),
  language: z.string().trim().optional(),
  q: z.string().trim().max(200).optional(),
});
export type StoryFiltersInput = z.infer<typeof storyFiltersSchema>;
