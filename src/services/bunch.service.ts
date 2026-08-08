import { api } from "@/lib/axios";

// Paginated response wrapper - returns full paginated object
// bunch.service.ts
const wrapPaginated = (r: any) => {
  console.log("[wrapPaginated] input r.data:", r.data);
  
  // Response structure: { success: true, data: { data: [...], total: X, page: Y, limit: Z } }
  const responseData = r.data?.data;
  
  // Check if responseData exists and has a 'data' property (which is the array)
  if (responseData && typeof responseData === 'object' && 'data' in responseData) {
    // Extract the actual array from the nested structure
    const result = {
      data: Array.isArray(responseData.data) ? responseData.data : [],
      total: responseData.total ?? 0,
      page: responseData.page ?? 1,
      limit: responseData.limit ?? 10
    };
    console.log("[wrapPaginated] output:", result);
    console.log("[wrapPaginated] output.data is array:", Array.isArray(result.data));
    return result;
  }
  
  // Fallback: if responseData is already an array
  if (Array.isArray(responseData)) {
    return {
      data: responseData,
      total: responseData.length,
      page: 1,
      limit: responseData.length
    };
  }
  
  // Last resort fallback
  console.warn("[wrapPaginated] Unexpected response structure:", r.data);
  return {
    data: [],
    total: 0,
    page: 1,
    limit: 10
  };
};

// Array response wrapper (direct array from data.data)
const wrapArray = (r: any) => r.data?.data;

// Single item response wrapper
const wrap = (r: any) => r.data.data;

export interface Bunch {
  id: string;
  name: string;
  description: string | null;
  classId: string;
  languageId: string;
  totalAmount: number;
  quantity: number;
  allowPartialBuy: boolean;
  status: string;
  class?: { id: string; name: string; board?: { id: string; name: string } } | null;
  language?: { id: string; name: string } | null;
  schools?: {
    city: ReactNode;
    state: ReactNode; id: string; name: string 
}[];
  books?: {
    isbn: import("react").JSX.Element;
    price: import("react").JSX.Element;
    discountPrice: any; id: string; title: string 
}[];
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
  paymentMethod?: string;
  orderStatus: string;
  shipmentStatus: string | null;
  shipmentId: string | null;
  awb: string | null;
  trackingUrl: string | null;
  courierName: string | null;
  hasAccess: boolean;
  bunch?: { id: string; name: string } | null;
  account?: { id: string; loginId: string } | null;
  shippingAddress?: { fullName: string; phone: string; addressLine1: string; addressLine2?: string; city: string; state: string; pincode: string } | null;
  createdAt: string;
}

export const bunchService = {
  getAll: (params: { page?: number; limit?: number; search?: string; schoolId?: string; classId?: string; languageId?: string }) =>
    api.get("/bunches", { params }).then(wrapPaginated),
  create: (data: {
    name: string;
    classId: string;
    languageId: string;
    schoolIds: string[];
    bookIds: string[];
    totalAmount: number;
    quantity: number;
    allowPartialBuy: boolean;
    description?: string;
    status?: string;
  }) => api.post("/bunches", data).then(wrap),
  update: (id: string, data: any) => api.patch(`/bunches/${id}`, data).then(wrap),
  changeStatus: (id: string, status: string) =>
    api.patch(`/bunches/status/${id}`, { status }).then(wrap),
  delete: (id: string) => api.delete(`/bunches/${id}`).then(wrap),
  findOne:(id:string)=>api.get(`/bunches/${id}`).then(wrap)
};

export const bunchOrderService = {
  getAll: (params: { page?: number; limit?: number; search?: string }) =>
    api.get("/bunch-orders", { params }).then(wrapPaginated),
  findOne: (id: string) => api.get(`/bunch-orders/${id}`).then(wrap),
  schedulePickup: (id: string, pickupDate?: string) =>
    api.post(`/bunch-orders/${id}/pickup`, { pickupDate }).then(wrap),
  getLabel: (id: string) => api.get(`/bunch-orders/${id}/label`).then(wrap),
  track: (id: string) => api.get(`/bunch-orders/${id}/track`).then(wrap),
  confirmCOD: (id: string) => api.post(`/bunch-orders/${id}/confirm-cod`, null).then(wrap),
  updateStatus: (id: string, status: string, notes?: string) =>
    api.patch(`/bunch-orders/${id}/status`, { status, notes }).then(wrap),
  cancel: (id: string) => api.patch(`/bunch-orders/${id}/cancel`, {}).then(wrap),

  // Returns
  getAllReturns: (params = {}) =>
    api.get("/bunch-orders/returns/all", { params }).then(wrapArray),
  getReturn: (id: string) =>
    api.get(`/bunch-orders/${id}/return`).then(wrap),
  approveReturn: (id: string, adminNote?: string) =>
    api.post(`/bunch-orders/${id}/return/approve`, { adminNote }).then(wrap),
  rejectReturn: (id: string, adminNote?: string) =>
    api.post(`/bunch-orders/${id}/return/reject`, { adminNote }).then(wrap),
  scheduleReturnPickup: (id: string) =>
    api.post(`/bunch-orders/${id}/return/pickup`).then(wrap),
  completeReturn: (id: string) =>
    api.post(`/bunch-orders/${id}/return/complete`).then(wrap),

  // Exchanges
  getAllExchanges: (params = {}) =>
    api.get("/bunch-orders/exchanges/all", { params }).then(wrapArray),
  getExchange: (id: string) =>
    api.get(`/bunch-orders/${id}/exchange`).then(wrap),
  approveExchange: (id: string, adminNote?: string) =>
    api.post(`/bunch-orders/${id}/exchange/approve`, { adminNote }).then(wrap),
  rejectExchange: (id: string, adminNote?: string) =>
    api.post(`/bunch-orders/${id}/exchange/reject`, { adminNote }).then(wrap),
  scheduleExchangePickup: (id: string) =>
    api.post(`/bunch-orders/${id}/exchange/pickup`).then(wrap),
  completeExchange: (id: string) =>
    api.post(`/bunch-orders/${id}/exchange/complete`).then(wrap),
};
