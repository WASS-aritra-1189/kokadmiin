import { api } from "@/lib/axios";

export interface Stream {
  id: string;
  name: string;
  description: string | null;
  status: string;
  createdAt: string;
}

export interface StreamPayload {
  name: string;
  description?: string;
  status?: string;
}

const wrap = (r: any) => r.data;

export const streamService = {
  getAll: (params: { page?: number; limit?: number; search?: string }) =>
    api.get("/streams", { params }).then(wrap),
  getActive: () => api.get("/streams/active").then(wrap),
  create: (data: StreamPayload) => api.post("/streams", data).then(wrap),
  update: (id: string, data: Partial<StreamPayload>) => api.patch(`/streams/${id}`, data).then(wrap),
  changeStatus: (id: string, status: string) => api.patch(`/streams/status/${id}`, { status }).then(wrap),
  delete: (id: string) => api.delete(`/streams/${id}`).then(wrap),
};
