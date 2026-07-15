import { api } from "@/lib/axios";

export interface ProductCategory {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
  status: string;
  createdAt: string;
}

export interface ProductCategoryListResponse {
  success: boolean;
  data: {
    data: ProductCategory[];
    total: number;
    page: number;
    limit: number;
  };
}

export interface ProductCategoryPayload {
  name: string;
  description?: string;
  status?: string;
}

const wrap = (r: any) => r.data;

export const productCategoryService = {
  getAll: (params: { page?: number; limit?: number; search?: string }) =>
    api.get("/product-categories", { params }).then(wrap),

  create: (data: ProductCategoryPayload) =>
    api.post("/product-categories", data).then(wrap),

  update: (id: string, data: Partial<ProductCategoryPayload>) =>
    api.patch(`/product-categories/${id}`, data).then(wrap),

  changeStatus: (id: string, status: string) =>
    api.patch(`/product-categories/status/${id}`, { status }).then(wrap),

  delete: (id: string) =>
    api.delete(`/product-categories/${id}`).then(wrap),
};
