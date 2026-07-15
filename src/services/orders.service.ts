import { api } from "@/lib/axios";

const wrap = (r: any) => r.data?.data ?? r.data;

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "REFUNDED"
  | "RETURN_REQUESTED"
  | "RETURN_APPROVED"
  | "RETURNED"
  | "EXCHANGE_REQUESTED"
  | "EXCHANGE_APPROVED"
  | "EXCHANGED";

export type ReturnRequestStatus = "PENDING" | "APPROVED" | "REJECTED" | "COMPLETED";
export type ExchangeRequestStatus = "PENDING" | "APPROVED" | "REJECTED" | "COMPLETED";

export interface ReturnRequest {
  id: string;
  orderId: string;
  accountId: string;
  status: ReturnRequestStatus;
  reason: string | null;
  items: { orderItemId: string; bookId: string; bookTitle: string; quantity: number; price: number }[];
  refundAmount: number;
  adminNote: string | null;
  approvedAt: string | null;
  completedAt: string | null;
  returnShipmentId: string | null;
  returnAwb: string | null;
  returnPickupStatus: string | null;
  pickupScheduledAt: string | null;
  order?: Order;
  createdAt: string;
  updatedAt: string;
}

export interface ExchangeRequest {
  id: string;
  orderId: string;
  accountId: string;
  status: ExchangeRequestStatus;
  reason: string | null;
  items: {
    orderItemId: string;
    bookId: string;
    bookTitle: string;
    quantity: number;
    originalPrice: number;
    newBookId: string;
    newBookTitle: string;
    newBookPrice: number;
  }[];
  priceDifference: number;
  adminNote: string | null;
  approvedAt: string | null;
  completedAt: string | null;
  returnShipmentId: string | null;
  returnAwb: string | null;
  returnPickupStatus: string | null;
  pickupScheduledAt: string | null;
  order?: Order;
  createdAt: string;
  updatedAt: string;
}

export type PaymentStatus =
  | "PENDING"
  | "SUCCESS"
  | "FAILED"
  | "CANCELLED"
  | "REFUNDED"
  | "REFUND_PROCESSING"
  | "PROCESSING"
  | "EXPIRED";

export interface OrderLineItem {
  id: string;
  orderId: string;
  bookId: string;
  bookTitle: string | null;
  quantity: number;
  price: number;
  total: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  accountId: string;
  status: OrderStatus;
  subtotal: number;
  discount: number;
  couponCode: string | null;
  shippingCharge: number;
  tax: number;
  totalAmount: number;
  paidAmount: number;
  paymentStatus: PaymentStatus;
  shipmentId: string | null;
  awb: string | null;
  trackingUrl: string | null;
  courierName: string | null;
  shipmentStatus: string | null;
  notes: string | null;
  transactionId: string | null;
  shippingAddressId: string;
  account?: { id: string; loginId: string } | null;
  shippingAddress?: {
    id: string;
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string | null;
    city: string;
    state: string;
    pincode: string;
    country: string;
  } | null;
  items?: OrderLineItem[];
  createdAt: string;
  updatedAt: string;
}

export interface Refund {
  id: string;
  accountId: string;
  refundType: string;
  refundAmount: number;
  razorpayPaymentId: string | null;
  razorpayRefundId: string | null;
  refundStatus: "PROCESSED" | "COMPLETED" | "FAILED" | "PENDING";
  reason: string | null;
  failureReason: string | null;
  processedAt: string | null;
  account?: { id: string; loginId: string } | null;
  createdAt: string;
  updatedAt: string;
}

export interface OrdersQuery {
  page?: number;
  limit?: number;
  status?: OrderStatus;
  search?: string;
  createdFrom?: string;
  createdTo?: string;
}

export const ordersService = {
  getAll: (params: OrdersQuery = {}) =>
    api.get("/orders", { params }).then(wrap),

  getById: (id: string) =>
    api.get(`/orders/${id}`).then(wrap),

  updateStatus: (id: string, status: OrderStatus, notes?: string) =>
    api.patch(`/orders/${id}/status`, { status, ...(notes ? { notes } : {}) }).then(wrap),

  schedulePickup: (id: string, pickupDate?: string) =>
    api.post(`/orders/${id}/pickup`, pickupDate ? { pickupDate } : {}).then(wrap),

  getLabel: (id: string) =>
    api.get(`/orders/${id}/label`).then(wrap),

  track: (id: string) =>
    api.get(`/orders/${id}/track`).then(wrap),

  // Returns
  getAllReturns: (status?: ReturnRequestStatus) =>
    api.get("/orders/returns", { params: status ? { status } : {} }).then(wrap),

  approveReturn: (orderId: string, adminNote?: string) =>
    api.patch(`/orders/${orderId}/return/approve`, { adminNote }).then(wrap),

  rejectReturn: (orderId: string, adminNote?: string) =>
    api.patch(`/orders/${orderId}/return/reject`, { adminNote }).then(wrap),

  completeReturn: (orderId: string) =>
    api.patch(`/orders/${orderId}/return/complete`).then(wrap),

  scheduleReturnPickup: (orderId: string) =>
    api.post(`/orders/${orderId}/return/pickup`).then(wrap),

  // Exchanges
  getAllExchanges: (status?: ExchangeRequestStatus) =>
    api.get("/orders/exchanges", { params: status ? { status } : {} }).then(wrap),

  approveExchange: (orderId: string, adminNote?: string) =>
    api.patch(`/orders/${orderId}/exchange/approve`, { adminNote }).then(wrap),

  rejectExchange: (orderId: string, adminNote?: string) =>
    api.patch(`/orders/${orderId}/exchange/reject`, { adminNote }).then(wrap),

  completeExchange: (orderId: string) =>
    api.patch(`/orders/${orderId}/exchange/complete`).then(wrap),

  scheduleExchangePickup: (orderId: string) =>
    api.post(`/orders/${orderId}/exchange/pickup`).then(wrap),

  // Refunds
  getAllRefunds: () =>
    api.get("/payment/refunds").then(wrap),
};
