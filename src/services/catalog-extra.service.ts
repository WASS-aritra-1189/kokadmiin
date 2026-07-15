import { api } from "@/lib/axios";

const wrap = (r: any) => r.data;

// ─── Sub-Category ─────────────────────────────────────────────────────────────

export interface SubCategory {
  id: string;
  name: string;
  desc: string | null;
  image: string | null;
  isPopular: boolean;
  categoryId: string | null;
  category?: { id: string; name: string } | null;
  status: string;
  createdAt: string;
}

export const subCategoryService = {
  getAll: (params: { page?: number; limit?: number; search?: string; status?: string }) =>
    api.get("/sub-categories/list", { params }).then(wrap),
  create: (data: { name: string; categoryId?: string; desc?: string }) =>
    api.post("/sub-categories", data).then(wrap),
  update: (id: string, data: { name?: string; categoryId?: string; desc?: string; status?: string }) =>
    api.patch(`/sub-categories/${id}`, data).then(wrap),
  changeStatus: (id: string, status: string) =>
    api.patch(`/sub-categories/status/${id}`, { status }).then(wrap),
  delete: (id: string) =>
    api.delete(`/sub-categories/${id}`).then(wrap),
};

// ─── Coupon ───────────────────────────────────────────────────────────────────

export interface Coupon {
  id: string;
  code: string;
  description: string | null;
  discountType: "PERCENTAGE" | "FLAT";
  discountValue: number;
  maxDiscountAmount: number | null;
  minOrderAmount: number;
  totalUsageLimit: number | null;
  perUserLimit: number;
  startsAt: string;
  expiresAt: string;
  isActive: boolean;
  usageCount: number;
  createdAt: string;
}

export const couponService = {
  getAll: (params: { page?: number; limit?: number; search?: string }) =>
    api.get("/coupons", { params }).then(wrap),
  create: (data: {
    code: string;
    discountType: string;
    discountValue: number;
    startsAt: string;
    expiresAt: string;
    description?: string;
    minOrderAmount?: number;
    maxDiscountAmount?: number;
    totalUsageLimit?: number;
    perUserLimit?: number;
  }) => api.post("/coupons", data).then(wrap),
  update: (id: string, data: any) => api.patch(`/coupons/${id}`, data).then(wrap),
  delete: (id: string) => api.delete(`/coupons/${id}`).then(wrap),
};
