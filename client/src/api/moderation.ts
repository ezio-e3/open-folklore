import type { ModerationDecisionInput, StoryDetailDTO, StorySummaryDTO } from "@openfolklore/shared";
import { api } from "./client";

export const moderationApi = {
  queue: () => api.get<{ stories: StorySummaryDTO[] }>("/moderation/queue"),
  getQueueItem: (id: string) => api.get<{ story: StoryDetailDTO }>(`/moderation/queue/${id}`),
  decide: (id: string, input: ModerationDecisionInput) =>
    api.post(`/moderation/${id}/decision`, input),
};
