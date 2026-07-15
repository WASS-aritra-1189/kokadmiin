import { api } from "@/lib/axios";

export interface Board {
  id: string;
  name: string;
  description: string | null;
  status: string;
  createdAt: string;
}

export interface BoardPayload {
  name: string;
  description?: string;
  status?: string;
}

const wrap = (r: any) => r.data;

export const boardService = {
  getAll: (params: { page?: number; limit?: number; search?: string }) =>
    api.get("/boards", { params }).then(wrap),
  getActive: () => api.get("/boards/active").then(wrap),
  create: (data: BoardPayload) => api.post("/boards", data).then(wrap),
  update: (id: string, data: Partial<BoardPayload>) => api.patch(`/boards/${id}`, data).then(wrap),
  changeStatus: (id: string, status: string) => api.patch(`/boards/status/${id}`, { status }).then(wrap),
  delete: (id: string) => api.delete(`/boards/${id}`).then(wrap),
};
