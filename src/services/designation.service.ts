import { api } from "@/lib/axios";

const wrap = (r: any) => {
  const body = r?.data;
  if (body && typeof body === "object") {
    if ("data" in body) return body.data;
    return body;
  }
  return r;
};

export type Designation = {
  id: string;
  name: string;
  description?: string | null;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type DesignationPayload = {
  name: string;
  description?: string;
  status?: string;
};

export const designationService = {
  getAll: (params?: { page?: number; limit?: number; search?: string; status?: string }) =>
    api.get("/designations", { params }).then(wrap),

  create: (payload: DesignationPayload) =>
    api.post("/designations", payload).then(wrap),

  update: (id: string, payload: Partial<DesignationPayload>) =>
    api.patch(`/designations/${id}`, payload).then(wrap),

  delete: (id: string) =>
    api.delete(`/designations/${id}`).then(wrap),

  changeStatus: (id: string, status: string) =>
    api.patch(`/designations/${id}/${status}`, { status }).then(wrap),
};
