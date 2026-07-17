import { api } from "@/lib/axios";

const wrap = (r: any) => r.data?.data ?? r.data;

export type Menu = {
  id: string;
  name: string;
  title: string;
  description: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
};

export type MenuPayload = {
  name: string;
  title: string;
  description: string;
};

export const menuService = {
  getAll: (params?: { page?: number; limit?: number; search?: string; status?: string }) =>
    api.get("/menu/list", { params }).then(wrap),

  create: (payload: MenuPayload) =>
    api.post("/menu", payload).then(wrap),

  update: (id: string, payload: Partial<MenuPayload>) =>
    api.patch(`/menu/${id}`, payload).then(wrap),

  status: (id: string, status: string) =>
    api.patch(`/menu/${id}/${status}`).then(wrap),

  delete: (id: string) =>
    api.delete(`/menu/${id}`).then(wrap),
};