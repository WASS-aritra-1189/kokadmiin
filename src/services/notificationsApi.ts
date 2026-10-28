import { api } from "@/lib/axios";

export interface AdminNotification {
  id: string;
  title: string;
  message: string;
  category: string;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
}

export const notificationsApi = {
  getMyNotifications: (page = 1, limit = 10) =>
    api.get<{ data: AdminNotification[]; total: number; page: number; limit: number }>(
      "/notifications/me",
      { params: { page, limit } },
    ),

  getUnreadCount: () =>
    api.get<{ count: number }>("/notifications/me/unread-count"),

  markAsRead: (id: string) =>
    api.patch(`/notifications/${id}/read`),

  markAllAsRead: () =>
    api.patch("/notifications/me/mark-all-read"),
};
