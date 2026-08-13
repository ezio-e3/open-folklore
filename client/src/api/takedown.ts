import type { TakedownRequestInput, TakedownRequestDTO, TakedownResolveInput } from "@openfolklore/shared";
import { api } from "./client";

export const takedownApi = {
  create: (input: TakedownRequestInput) => api.post<{ request: TakedownRequestDTO }>("/takedown-requests", input),
  listOpen: () => api.get<{ requests: TakedownRequestDTO[] }>("/admin/takedown-requests"),
  resolve: (id: string, input: TakedownResolveInput) =>
    api.post<{ request: TakedownRequestDTO }>(`/admin/takedown-requests/${id}/resolve`, input),
};
