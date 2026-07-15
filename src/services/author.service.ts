import { api } from "@/lib/axios";

export interface Author {
  id: string;
  name: string;
  bio: string | null;
  email: string | null;
  phone: string | null;
  nationality: string | null;
  profileImage: string | null;
  status: string;
  bookCount: number;
  createdAt: string;
}

export interface AuthorPayload {
  name: string;
  bio?: string;
  email?: string;
  phone?: string;
  nationality?: string;
  status?: string;
}

const wrap = (r: any) => r.data;

export const authorService = {
  getAll: (params: { page?: number; limit?: number; search?: string }) =>
    api.get("/authors", { params }).then(wrap),
  create: (data: AuthorPayload) => api.post("/authors", data).then(wrap),
  update: (id: string, data: Partial<AuthorPayload>) => api.patch(`/authors/${id}`, data).then(wrap),
  changeStatus: (id: string, status: string) => api.patch(`/authors/status/${id}`, { status }).then(wrap),
  delete: (id: string) => api.delete(`/authors/${id}`).then(wrap),
};
