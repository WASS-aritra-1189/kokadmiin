import { api } from "@/lib/axios";

export type TicketStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
export type TicketPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
export type TicketCategory = "ORDER" | "PAYMENT" | "DELIVERY" | "RETURN" | "PRODUCT" | "ACCOUNT" | "OTHER";

export interface TicketReply {
  id: string;
  ticketId: string;
  senderId: string;
  isAdmin: boolean;
  message: string;
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  accountId: string;
  subject: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  assignedTo: string | null;
  adminNote: string | null;
  replies: TicketReply[];
  createdAt: string;
  updatedAt: string;
}

export interface TicketsListResponse {
  success: boolean;
  data: {
    data: SupportTicket[];
    total: number;
    page: number;
    limit: number;
  };
}

export interface TicketsQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: TicketStatus;
  category?: TicketCategory;
  priority?: TicketPriority;
  accountId?: string;
}

export interface UpdateTicketStatusPayload {
  status: TicketStatus;
  adminNote?: string;
  priority?: TicketPriority;
  assignedTo?: string;
}

const wrap = (r: any) => r.data;
// backend envelope: { success, data: <entity> } — unwrap both axios layer and backend layer
const wrapData = (r: any) => r.data?.data ?? r.data;

export const supportTicketService = {
  getAll: (params: TicketsQuery = {}) =>
    api.get<TicketsListResponse>("/support-tickets/admin", { params }).then(wrap),

  getById: (id: string) =>
    api.get(`/support-tickets/admin/${id}`).then(wrapData),

  reply: (id: string, message: string) =>
    api.post(`/support-tickets/admin/${id}/reply`, { message }).then(wrap),

  updateStatus: (id: string, payload: UpdateTicketStatusPayload) =>
    api.patch(`/support-tickets/admin/${id}/status`, payload).then(wrapData),

  delete: (id: string) =>
    api.delete(`/support-tickets/admin/${id}`).then(wrap),
};
