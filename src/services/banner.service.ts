import { api } from "@/lib/axios";
import { resolveBannerImage as resolveImage } from "@/lib/image-url";

export type BannerStatus = "ACTIVE" | "DEACTIVE" | "PENDING" | "DELETED";

export interface Banner {
  id: string;
  title?: string;
  image: string | null;
  imagePath: string | null;
  status: BannerStatus;
  createdAt: string;
  updatedAt: string;
}

export interface BannersResponse {
  success: boolean;
  data: {
    data: Banner[];
    total: number;
    page: number;
    limit: number;
  };
}

export interface BannerQuery {
  page?: number;
  limit?: number;
  status?: BannerStatus;
}

const wrap = (r: any) => r.data;
const wrapData = (r: any) => r.data?.data ?? r.data;

const API_BASE = (import.meta.env.VITE_API_URL ?? "https://apiserver.kokbooks.com/api/v1")
  .replace(/\/api\/v\d+\/?$/, "");

export function resolveBannerImage(banner: Banner): string | null {
  return resolveImage(banner.image, banner.imagePath);
}

export const bannerService = {
  getAll: (params: BannerQuery = {}) =>
    api.get<BannersResponse>("/banner", { params }).then(wrap),

  create: (file: File, status: BannerStatus = "ACTIVE", title: string = "Banner") => {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("status", status);
    fd.append("title", title);
    return api.post("/banner", fd, { headers: { "Content-Type": "multipart/form-data" } }).then(wrapData);
  },

  update: (id: string, file?: File, status?: BannerStatus, title?: string) => {
    const fd = new FormData();
    if (file) fd.append("file", file);
    if (status) fd.append("status", status);
    if (title) fd.append("title", title);
    return api.patch(`/banner/${id}`, fd, { headers: { "Content-Type": "multipart/form-data" } }).then(wrapData);
  },

  changeStatus: (id: string, status: BannerStatus) =>
    api.patch(`/banner/${id}/${status}`).then(wrapData),

  delete: (id: string) =>
    api.delete(`/banner/${id}`).then(wrapData),
};
