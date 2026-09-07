import { api } from "@/lib/axios";

export type CommChannel = "EMAIL" | "SMS" | "PUSH" | "WHATSAPP";
export type RecipientType = "ALL" | "SELECTED";
export type BroadcastStatus = "PENDING" | "SENT" | "FAILED" | "PARTIAL";

export interface CommTemplate {
  id: string;
  name: string;
  channel: CommChannel;
  subject?: string;
  body: string;
  variables?: string[];
  status: string;
  createdAt: string;
}

export interface Broadcast {
  id: string;
  channel: CommChannel;
  subject: string;
  body: string;
  recipientType: RecipientType;
  accountIds?: string[];
  status: BroadcastStatus;
  totalRecipients: number;
  successCount: number;
  failureCount: number;
  errorLog?: string;
  template?: CommTemplate;
  createdAt: string;
}

function unwrap(r: any) { return r.data?.data ?? r.data; }

export const commTemplateService = {
  getAll: (channel?: CommChannel) =>
    api.get("/communication/templates", { params: channel ? { channel } : {} }).then(unwrap),
  getOne: (id: string) =>
    api.get(`/communication/templates/${id}`).then(unwrap),
  create: (data: Partial<CommTemplate>) =>
    api.post("/communication/templates", data).then(unwrap),
  update: (id: string, data: Partial<CommTemplate>) =>
    api.patch(`/communication/templates/${id}`, data).then(unwrap),
  delete: (id: string) =>
    api.delete(`/communication/templates/${id}`),
};

export const broadcastService = {
  getAll: (channel?: CommChannel) =>
    api.get("/communication/broadcasts", { params: channel ? { channel } : {} }).then(unwrap),
  send: (data: {
    templateId?: string;
    channel: CommChannel;
    subject: string;
    body: string;
    recipientType: RecipientType;
    accountIds?: string[];
  }) => api.post("/communication/broadcast", data).then(unwrap),
};
