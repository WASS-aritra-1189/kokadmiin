import { api } from "@/lib/axios";

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface FAQsResponse {
  success: boolean;
  data: {
    data: FAQ[];
    total: number;
    page: number;
    limit: number;
  };
}

export interface FAQQuery {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  sortField?: string;
  sortValue?: "ASC" | "DESC";
}

export interface CreateFAQPayload {
  question: string;
  answer: string;
  category?: string;
  isActive?: boolean;
}

export interface UpdateFAQPayload {
  question?: string;
  answer?: string;
  category?: string;
  isActive?: boolean;
}

const wrap = (r: any) => r.data;
const wrapData = (r: any) => r.data?.data ?? r.data;

export const faqService = {
  getAll: (params: FAQQuery = {}) =>
    api.get<FAQsResponse>("/faqs", { params }).then(wrap),

  getById: (id: string) =>
    api.get(`/faqs/${id}`).then(wrapData),

  create: (payload: CreateFAQPayload) =>
    api.post("/faqs", payload).then(wrapData),

  update: (id: string, payload: UpdateFAQPayload) =>
    api.patch(`/faqs/${id}`, payload).then(wrapData),

  delete: (id: string) =>
    api.delete(`/faqs/${id}`).then(wrap),
};
