import { api } from "@/lib/axios";

export interface Language {
  id: string;
  name: string;
  code: string | null;
  status: string;
  createdAt: string;
}

export interface LanguagePayload {
  name: string;
  code?: string;
  status?: string;
}

const wrap = (r: any) => r.data;

export const languageService = {
  getAll: (params: { page?: number; limit?: number; search?: string }) =>
    api.get("/languages", { params }).then(wrap),
  create: (data: LanguagePayload) => api.post("/languages", data).then(wrap),
  update: (id: string, data: Partial<LanguagePayload>) => api.patch(`/languages/${id}`, data).then(wrap),
  changeStatus: (id: string, status: string) => api.patch(`/languages/${id}`, { status }).then(wrap),
  delete: (id: string) => api.delete(`/languages/${id}`).then(wrap),
};
