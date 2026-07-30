import { api } from "@/lib/axios";

const wrap = <T>(r: any): T => r.data?.data ?? r.data;

export interface Setting {
  id: string;
  title: string;
  email: string;
  domain: string;
  ecommerceUrl: string;
  adminUrl: string;
  userDomain: string;
  adminDomain: string;
  mobileDomain: string;
  logo: string;
  logoPath: string;
  wpLink: string;
  fbLink: string;
  instaLink: string;
  companyName: string;
  companyYear: string;
  companyAddress: string;
  companyCity: string;
  companyPhone: string;
  companyGstin: string;
  clinicAddress: string;
  appointmentDurationMinutes: number;
  appointmentBufferMinutes: number;
  appointmentFee: number;
  gstPercentage: number;
  latitude: number;
  longitude: number;
  shiprocketAutoPickup: boolean;
  returnWindowDays: number;
  exchangeWindowDays: number;
  freeShippingAmount: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface SettingsQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
}

export const settingsService = {
  getAll: (query?: SettingsQuery) => 
    api.get("/settings", { params: query }).then(wrap<{ data: Setting[]; total: number; page: number; limit: number }>),
  
  getOne: (id: string) => 
    api.get(`/settings/${id}`).then(wrap<Setting>),
  
  getByDomain: () => 
    api.get("/settings/domain").then(wrap<Setting>),
  
  create: (data: Partial<Setting>) => 
    api.post("/settings", data).then(wrap<Setting>),
  
  update: (id: string, data: Partial<Setting>) => 
    api.patch(`/settings/${id}`, data).then(wrap),
  
  updateStatus: (id: string, status: string) => 
    api.patch(`/settings/${id}/${status}`, {}).then(wrap),
  
  delete: (id: string) => 
    api.delete(`/settings/${id}`, { data: {} }).then(wrap),
};