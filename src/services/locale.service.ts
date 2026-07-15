import { api } from "@/lib/axios";

const wrap = (r: any) => r.data;

// ─── Country ──────────────────────────────────────────────────────────────────

export interface Country {
  id: string;
  name: string;
  code: string | null;
  status: string;
  createdAt: string;
}

export const countryService = {
  getAll: (params: { page?: number; limit?: number; search?: string; status?: string }) =>
    api.get("/country", { params }).then(wrap),
  create: (data: { name: string; code?: string }) =>
    api.post("/country", data).then(wrap),
  update: (id: string, data: { name?: string; code?: string; status?: string }) =>
    api.patch(`/country/${id}`, data).then(wrap),
  changeStatus: (id: string, status: string) =>
    api.patch(`/country/${id}`, { status }).then(wrap),
  delete: (id: string) =>
    api.delete(`/country/${id}`).then(wrap),
};

// ─── State ────────────────────────────────────────────────────────────────────

export interface State {
  id: string;
  name: string;
  countryId: string;
  country?: { id: string; name: string } | null;
  status: string;
  createdAt: string;
}

export const stateService = {
  getAll: (params: { page?: number; limit?: number; search?: string; status?: string; countryId?: string }) =>
    api.get("/state", { params }).then(wrap),
  create: (data: { name: string; countryId: string }) =>
    api.post("/state", data).then(wrap),
  update: (id: string, data: { name?: string; countryId?: string; status?: string }) =>
    api.patch(`/state/${id}`, data).then(wrap),
  changeStatus: (id: string, status: string) =>
    api.patch(`/state/${id}`, { status }).then(wrap),
  delete: (id: string) =>
    api.delete(`/state/${id}`).then(wrap),
};

// ─── City ─────────────────────────────────────────────────────────────────────

export interface City {
  id: string;
  name: string;
  stateId: string;
  state?: { id: string; name: string; country?: { id: string; name: string } | null } | null;
  status: string;
  createdAt: string;
}

export const cityService = {
  getAll: (params: { page?: number; limit?: number; search?: string; status?: string; stateId?: string; countryId?: string }) =>
    api.get("/city", { params }).then(wrap),
  create: (data: { name: string; stateId: string }) =>
    api.post("/city", data).then(wrap),
  update: (id: string, data: { name?: string; stateId?: string; status?: string }) =>
    api.patch(`/city/${id}`, data).then(wrap),
  changeStatus: (id: string, status: string) =>
    api.patch(`/city/${id}`, { status }).then(wrap),
  delete: (id: string) =>
    api.delete(`/city/${id}`).then(wrap),
};

// ─── Language (locale) ────────────────────────────────────────────────────────

export interface LocaleLanguage {
  id: string;
  name: string;
  code: string | null;
  status: string;
  createdAt: string;
}

export const localeLanguageService = {
  getAll: (params: { page?: number; limit?: number; search?: string; status?: string }) =>
    api.get("/languages", { params }).then(wrap),
  create: (data: { name: string; code?: string }) =>
    api.post("/languages", data).then(wrap),
  update: (id: string, data: { name?: string; code?: string; status?: string }) =>
    api.patch(`/languages/${id}`, data).then(wrap),
  changeStatus: (id: string, status: string) =>
    api.patch(`/languages/${id}`, { status }).then(wrap),
  delete: (id: string) =>
    api.delete(`/languages/${id}`).then(wrap),
};
