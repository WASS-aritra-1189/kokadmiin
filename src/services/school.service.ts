// src/services/school.service.ts
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
  limit: number | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
  deletedAt?: string | null;
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

export interface ApiResponse<T> {
  success: boolean;
  messageId: string;
  messageType: string;
  data: T;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export const schoolService = {
  getAll: (params: { page?: number; limit?: number; search?: string; status?: string }) =>
    api.get<ApiResponse<PaginatedResponse<School>>>("/schools", { params })
      .then(res => res.data.data),
  
  getById: (id: string) =>
    api.get<ApiResponse<School>>(`/schools/${id}`)
      .then(res => res.data.data),
  
  getActive: () =>
    api.get<ApiResponse<School[]>>("/schools/active")
      .then(res => res.data.data),
  
  create: (data: { name: string; email?: string; phone?: string; address?: string; city?: string; state?: string; pincode?: string; description?: string }) =>
    api.post<ApiResponse<School>>("/schools", data)
      .then(res => res.data.data),
  
  update: (id: string, data: Partial<School>) =>
    api.patch<ApiResponse<School>>(`/schools/${id}`, data)
      .then(res => res.data.data),
  
  changeStatus: (id: string, status: string) =>
    api.patch<ApiResponse<School>>(`/schools/status/${id}`, { status })
      .then(res => res.data.data),
  
  delete: (id: string) =>
    api.delete<ApiResponse<void>>(`/schools/${id}`)
      .then(res => res.data),
};

export const schoolClassService = {
  getAll: (params: { page?: number; limit?: number; search?: string; boardId?: string; status?: string }) =>
    api.get<ApiResponse<PaginatedResponse<SchoolClass>>>("/school-classes", { params })
      .then(res => res.data.data),
  
  getByBoard: (boardId: string) =>
    api.get<ApiResponse<SchoolClass[]>>(`/school-classes/by-board/${boardId}`)
      .then(res => res.data.data),
  
  create: (data: { name: string; boardId: string; description?: string; status?: string }) =>
    api.post<ApiResponse<SchoolClass>>("/school-classes", data)
      .then(res => res.data.data),
  
  update: (id: string, data: Partial<SchoolClass>) =>
    api.patch<ApiResponse<SchoolClass>>(`/school-classes/${id}`, data)
      .then(res => res.data.data),
  
  changeStatus: (id: string, status: string) =>
    api.patch<ApiResponse<SchoolClass>>(`/school-classes/status/${id}`, { status })
      .then(res => res.data.data),
  
  delete: (id: string) =>
    api.delete<ApiResponse<void>>(`/school-classes/${id}`)
      .then(res => res.data),
};