import { api } from "@/lib/axios";

// Handle different response formats properly
function wrapList(r: any) {
  return r.data.data;
}

function wrapData(r: any) {
  return r.data;
}

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
    api.get("/country", { params }).then(wrapList),
  create: (data: { name: string; code?: string }) =>
    api.post("/country", data).then(wrapData),
  update: (id: string, data: { name?: string; code?: string; status?: string }) =>
    api.patch(`/country/${id}`, data).then(wrapData),
  changeStatus: (id: string, status: string) =>
    api.patch(`/country/${id}`, { status }).then(wrapData),
  delete: (id: string) =>
    api.delete(`/country/${id}`).then(wrapData),
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
    api.get("/state", { params }).then(wrapList),
  create: (data: { name: string; countryId: string }) =>
    api.post("/state", data).then(wrapData),
  update: (id: string, data: { name?: string; countryId?: string; status?: string }) =>
    api.patch(`/state/${id}`, data).then(wrapData),
  changeStatus: (id: string, status: string) =>
    api.patch(`/state/${id}`, { status }).then(wrapData),
  delete: (id: string) =>
    api.delete(`/state/${id}`).then(wrapData),
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
    api.get("/city", { params }).then(wrapList),
  create: (data: { name: string; stateId: string }) =>
    api.post("/city", data).then(wrapData),
  update: (id: string, data: { name?: string; stateId?: string; status?: string }) =>
    api.patch(`/city/${id}`, data).then(wrapData),
  changeStatus: (id: string, status: string) =>
    api.patch(`/city/${id}`, { status }).then(wrapData),
  delete: (id: string) =>
    api.delete(`/city/${id}`).then(wrapData),
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
    api.get("/languages", { params }).then(wrapList),
  create: (data: { name: string; code?: string }) =>
    api.post("/languages", data).then(wrapData),
  update: (id: string, data: { name?: string; code?: string; status?: string }) =>
    api.patch(`/languages/${id}`, data).then(wrapData),
  changeStatus: (id: string, status: string) =>
    api.patch(`/languages/${id}`, { status }).then(wrapData),
  delete: (id: string) =>
    api.delete(`/languages/${id}`).then(wrapData),
};
