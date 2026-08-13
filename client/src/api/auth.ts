import type { LoginInput, RegisterInput, UserDTO } from "@openfolklore/shared";
import { api } from "./client";

export const authApi = {
  register: (input: RegisterInput) => api.post<{ user: UserDTO }>("/auth/register", input),
  login: (input: LoginInput) => api.post<{ user: UserDTO }>("/auth/login", input),
  logout: () => api.post<void>("/auth/logout"),
  me: () => api.get<{ user: UserDTO | null }>("/auth/me"),
};
