import { api } from "@/lib/axios";

export interface Subject {
  id: string;
  name: string;
  description: string | null;
  boardId: string;
  board?: { id: string; name: string } | null;
  classId: string;
  schoolClass?: { id: string; name: string } | null;
  status: string;
  createdAt: string;
}

export interface SubjectPayload {
  name: string;
  boardId: string;
  classId: string;
  description?: string;
  status?: string;
}

const wrap = (r: any) => r.data;

export const subjectService = {
  getAll: (params: { page?: number; limit?: number; search?: string }) =>
    api.get("/subjects", { params }).then(wrap),
  create: (data: SubjectPayload) => api.post("/subjects", data).then(wrap),
  update: (id: string, data: Partial<SubjectPayload>) => api.patch(`/subjects/${id}`, data).then(wrap),
  changeStatus: (id: string, status: string) => api.patch(`/subjects/status/${id}`, { status }).then(wrap),
  delete: (id: string) => api.delete(`/subjects/${id}`).then(wrap),
};
