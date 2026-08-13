import type { RoleUpdateInput, UserDTO } from "@openfolklore/shared";
import { api } from "./client";

export const adminApi = {
  listUsers: () => api.get<{ users: UserDTO[] }>("/admin/users"),
  updateRole: (id: string, input: RoleUpdateInput) =>
    api.patch<{ user: UserDTO }>(`/admin/users/${id}/role`, input),
};
