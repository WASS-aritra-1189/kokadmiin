import { api } from "@/lib/axios";

const wrap = (r: any) => r.data;

export interface School {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  description: string | null;
  status: string;
  createdAt: string;
}

export interface SchoolClass {
  id: string;
  name: string;
  description: string | null;
  boardId: string;
  board?: { id: string; name: string } | null;
  status: string;
  createdAt: string;
}

export const schoolService = {
  getAll: (params: { page?: number; limit?: number; search?: string; status?: string }) =>
    api.get("/schools", { params }).then(wrap),
  getActive: () => api.get("/schools/active").then(wrap),
  create: (data: { name: string; email?: string; phone?: string; address?: string; city?: string; state?: string; pincode?: string; description?: string }) =>
    api.post("/schools", data).then(wrap),
  update: (id: string, data: any) => api.patch(`/schools/${id}`, data).then(wrap),
  changeStatus: (id: string, status: string) =>
    api.patch(`/schools/status/${id}`, { status }).then(wrap),
  delete: (id: string) => api.delete(`/schools/${id}`).then(wrap),
};

export const schoolClassService = {
  getAll: (params: { page?: number; limit?: number; search?: string; boardId?: string; status?: string }) =>
    api.get("/school-classes", { params }).then(wrap),
  getByBoard: (boardId: string) => api.get(`/school-classes/by-board/${boardId}`).then(wrap),
  create: (data: { name: string; boardId: string; description?: string; status?: string }) =>
    api.post("/school-classes", data).then(wrap),
  update: (id: string, data: any) => api.patch(`/school-classes/${id}`, data).then(wrap),
  changeStatus: (id: string, status: string) =>
    api.patch(`/school-classes/status/${id}`, { status }).then(wrap),
  delete: (id: string) => api.delete(`/school-classes/${id}`).then(wrap),
};
