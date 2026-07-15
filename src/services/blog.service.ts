import { api } from "@/lib/axios";

export type BlogStatus = "ACTIVE" | "DEACTIVE" | "PENDING";
export type BlogCategory = "GENERAL" | "NEWS" | "TIPS" | "REVIEW" | "ANNOUNCEMENT";

export interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  coverImage: string | null;
  coverImagePath: string | null;
  category: BlogCategory;
  tags: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  status: BlogStatus;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BlogsResponse {
  success: boolean;
  data: {
    data: Blog[];
    total: number;
    page: number;
    limit: number;
  };
}

export interface BlogQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: BlogStatus;
  category?: BlogCategory;
}

const wrap = (r: any) => r.data;
const wrapData = (r: any) => r.data?.data ?? r.data;

const buildFormData = (fields: Record<string, string | undefined>, file?: File) => {
  const fd = new FormData();
  if (file) fd.append("file", file);
  Object.entries(fields).forEach(([k, v]) => { if (v !== undefined) fd.append(k, v); });
  return fd;
};

export const blogService = {
  getAll: (params: BlogQuery = {}) =>
    api.get<BlogsResponse>("/blog", { params }).then(wrap),

  getById: (id: string) =>
    api.get(`/blog/${id}`).then(wrapData),

  create: (fields: Record<string, string | undefined>, file?: File) =>
    api.post("/blog", buildFormData(fields, file), {
      headers: { "Content-Type": "multipart/form-data" },
    }).then(wrapData),

  update: (id: string, fields: Record<string, string | undefined>, file?: File) =>
    api.patch(`/blog/${id}`, buildFormData(fields, file), {
      headers: { "Content-Type": "multipart/form-data" },
    }).then(wrapData),

  changeStatus: (id: string, status: BlogStatus) =>
    api.patch(`/blog/${id}/${status}`).then(wrapData),

  delete: (id: string) =>
    api.delete(`/blog/${id}`).then(wrapData),
};
