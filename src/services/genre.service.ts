import { api } from "@/lib/axios";

export interface Genre {
  id: string;
  name: string;
  description: string | null;
  status: string;
  externalId: string | null;
  level: number | null;
  shortCode: string | null;
  parentId: string | null;
  createdAt: string;
}

export interface GenrePayload {
  name: string;
  description?: string;
  status?: string;
}

const wrap = (r: any) => r.data;

export const genreService = {
  getAll: (params: { page?: number; limit?: number; search?: string }) =>
    api.get("/genres", { params }).then(wrap),
  getActive: () => api.get("/genres/active").then(wrap),
  create: (data: GenrePayload) => api.post("/genres", data).then(wrap),
  update: (id: string, data: Partial<GenrePayload>) => api.patch(`/genres/${id}`, data).then(wrap),
  changeStatus: (id: string, status: string) => api.patch(`/genres/status/${id}`, { status }).then(wrap),
  delete: (id: string) => api.delete(`/genres/${id}`).then(wrap),
};
