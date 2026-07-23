import { api } from "@/lib/axios";

const wrap = (r: any) => r.data?.data ?? r.data;

export interface TransactionItem {
  bookTitle: string;
  quantity: number;
  price: number;
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pincode: string;
}

export interface PaymentHistory {
  status: string;
  previousStatus: string | null;
  remarks: string | null;
  createdAt: string;
}

export interface Transaction {
  id: string;
  orderId: string;
  orderNumber: string;
  transactionId: string | null;
  paymentId: string | null;
  amount: number;
  paidAmount: number;
  paymentStatus: string;
  paymentMethod: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  orderStatus: string;
  orderItems: TransactionItem[];
  shippingAddress: ShippingAddress | null;
  createdAt: string;
  updatedAt: string;
  paymentHistory: PaymentHistory[];
}

export interface TransactionStats {
  totalCollected: number;
  totalPending: number;
  totalRefunded: number;
  successCount: number;
  pendingCount: number;
  refundedCount: number;
}

export interface PaginatedTransactions {
  data: Transaction[];
  total: number;
  page: number;
  limit: number;
  stats: TransactionStats;
}

interface FetchTransactionsParams {
  page?: number;
  limit?: number;
  search?: string;
  orderStatus?: string;
  paymentStatus?: string;
  dateFrom?: string;
  dateTo?: string;
}

export const transactionsService = {
  findAll(params: FetchTransactionsParams = {}) {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set("page", String(params.page));
    if (params.limit) searchParams.set("limit", String(params.limit));
    if (params.search) searchParams.set("search", params.search);
    if (params.orderStatus) searchParams.set("orderStatus", params.orderStatus);
    if (params.paymentStatus) searchParams.set("paymentStatus", params.paymentStatus);
    if (params.dateFrom) searchParams.set("dateFrom", params.dateFrom);
    if (params.dateTo) searchParams.set("dateTo", params.dateTo);
    return api.get<PaginatedTransactions>(`/transactions?${searchParams}`).then(wrap);
  },

  findAllCod(params: Omit<FetchTransactionsParams, 'orderStatus' | 'paymentStatus'> & { status?: string } = {}) {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set("page", String(params.page));
    if (params.limit) searchParams.set("limit", String(params.limit));
    if (params.search) searchParams.set("search", params.search);
    if (params.status) searchParams.set("status", params.status);
    if (params.dateFrom) searchParams.set("dateFrom", params.dateFrom);
    if (params.dateTo) searchParams.set("dateTo", params.dateTo);
    return api.get<PaginatedTransactions>(`/cod?${searchParams}`).then(wrap);
  },

  findAllRefunds(params: Omit<FetchTransactionsParams, 'orderStatus' | 'paymentStatus'> & { status?: string } = {}) {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set("page", String(params.page));
    if (params.limit) searchParams.set("limit", String(params.limit));
    if (params.search) searchParams.set("search", params.search);
    if (params.status) searchParams.set("status", params.status);
    if (params.dateFrom) searchParams.set("dateFrom", params.dateFrom);
    if (params.dateTo) searchParams.set("dateTo", params.dateTo);
    return api.get<PaginatedTransactions>(`/refunds?${searchParams}`).then(wrap);
  },

  findOne(id: string) {
    return api.get<Transaction>(`/transactions/${id}`).then(wrap);
  },
};