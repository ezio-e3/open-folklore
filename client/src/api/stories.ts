import type { StoryDetailDTO, StoryFacetsDTO, StorySummaryDTO } from "@openfolklore/shared";
import { api } from "./client";

export interface StoryFilters {
  region?: string;
  ethnicGroup?: string;
  language?: string;
  q?: string;
}

function toQueryString(filters: StoryFilters): string {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export const storiesApi = {
  list: (filters: StoryFilters = {}) =>
    api.get<{ stories: StorySummaryDTO[] }>(`/stories${toQueryString(filters)}`),

  getById: (id: string) => api.get<{ story: StoryDetailDTO }>(`/stories/${id}`),

  mine: () => api.get<{ stories: StorySummaryDTO[] }>("/stories/mine"),

  facets: () => api.get<StoryFacetsDTO>("/stories/facets"),

  // multipart/form-data — the audio file (if any) travels alongside the text
  // fields (FR1/FR2, docs/phase7-implementation-plan.md M3/M4).
  submit: (formData: FormData) => api.post<{ id: string; status: string }>("/stories", formData),

  linkVariant: (storyId: string, relatedStoryId: string) =>
    api.post(`/stories/${storyId}/variant-link`, { relatedStoryId }),
};
