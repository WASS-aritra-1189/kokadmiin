import { api } from "@/lib/axios";

const wrap = (r: any) => r.data;

export interface Bunch {
  id: string;
  name: string;
  description: string | null;
  classId: string;
  languageId: string;
  totalAmount: number;
  quantity: number;
  status: string;
  class?: { id: string; name: string; board?: { id: string; name: string } } | null;
  language?: { id: string; name: string } | null;
  schools?: { id: string; name: string }[];
  books?: { id: string; title: string }[];
  createdAt: string;
}

export interface BunchOrder {
  id: string;
  orderNumber: string;
  accountId: string;
  bunchId: string;
  totalAmount: number;
  paidAmount: number;
  paymentStatus: string;
  orderStatus: string;
  shipmentStatus: string | null;
  shipmentId: string | null;
  awb: string | null;
  trackingUrl: string | null;
  courierName: string | null;
  hasAccess: boolean;
  bunch?: { id: string; name: string } | null;
  account?: { id: string; loginId: string } | null;
  shippingAddress?: { fullName: string; phone: string; addressLine1: string; city: string; state: string; pincode: string } | null;
  createdAt: string;
}

export const bunchService = {
  getAll: (params: { page?: number; limit?: number; search?: string; schoolId?: string; classId?: string; languageId?: string }) =>
    api.get("/bunches", { params }).then(wrap),
  create: (data: {
    name: string;
    classId: string;
    languageId: string;
    schoolIds: string[];
    bookIds: string[];
    totalAmount: number;
    quantity: number;
    description?: string;
    status?: string;
  }) => api.post("/bunches", data).then(wrap),
  update: (id: string, data: any) => api.patch(`/bunches/${id}`, data).then(wrap),
  changeStatus: (id: string, status: string) =>
    api.patch(`/bunches/status/${id}`, { status }).then(wrap),
  delete: (id: string) => api.delete(`/bunches/${id}`).then(wrap),
};

export const bunchOrderService = {
  getAll: (params: { page?: number; limit?: number; search?: string }) =>
    api.get("/bunch-orders", { params }).then(wrap),
  findOne: (id: string) => api.get(`/bunch-orders/${id}`).then(wrap),
  schedulePickup: (id: string, pickupDate: string) =>
    api.post(`/bunch-orders/${id}/pickup`, { pickupDate }).then(wrap),
  getLabel: (id: string) => api.get(`/bunch-orders/${id}/label`).then(wrap),
  track: (id: string) => api.get(`/bunch-orders/${id}/track`).then(wrap),
};
