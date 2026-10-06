import { api } from "@/lib/axios";

export interface HomeSection {
  id: string;
  sectionType: string;
  title: string;
  subTitle: string | null;
  apiEndpoint: string | null;
  position: number;
  isActive: boolean;
  config: Record<string, any> | null;
  createdAt: string;
  updatedAt: string;
}

export interface HomeSectionsResponse {
  success: boolean;
  data: {
    data: HomeSection[];
    total: number;
    page: number;
    limit: number;
  };
}

const wrap = (r: any) => r.data;
const wrapData = (r: any) => r.data?.data ?? r.data;

export const homeSectionService = {
  getAll: (params: { page?: number; limit?: number; isActive?: boolean } = {}) =>
    api.get<HomeSectionsResponse>("/home-sections", { params }).then(wrap),

  create: (data: Omit<HomeSection, "id" | "createdAt" | "updatedAt">) =>
    api.post("/home-sections", data).then(wrapData),

  update: (id: string, data: Partial<HomeSection>) =>
    api.patch(`/home-sections/${id}`, data).then(wrapData),

  toggle: (id: string, isActive: boolean) =>
    api.patch(`/home-sections/${id}/toggle`, { isActive }).then(wrapData),

  reorder: (ids: string[]) =>
    api.patch("/home-sections/reorder", { ids }).then(wrapData),

  delete: (id: string) =>
    api.delete(`/home-sections/${id}`).then(wrapData),
};
