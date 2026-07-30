import { api } from "@/lib/axios";

const wrap = <T>(r: any): T => r.data?.data ?? r.data;

export interface Page {
  id: string;
  title: string;
  pageType: string;
  description: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface PagesQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
  status?: string[];
}

export const pagesService = {
  getAll: (query?: PagesQuery) => 
    api.get("/pages/list", { params: query }).then(wrap<{ data: Page[]; total: number; page: number; limit: number }>),
  
  getOne: (id: string) => 
    api.get(`/pages/${id}`).then(wrap<Page>),
  
  getByType: (type: string) => 
    api.get(`/pages/public/${type}`).then(wrap<Page>),
  
  create: (data: Partial<Page>) => 
    api.post("/pages", data).then(wrap<Page>),
  
  update: (id: string, data: Partial<Page>) => 
    api.patch(`/pages/${id}`, data).then(wrap<Page>),
  
  updateStatus: (id: string, status: string) => 
    api.patch(`/pages/${id}/${status}`, {}).then(wrap),
  
  delete: (id: string) => 
    api.delete(`/pages/${id}`, { data: {} }).then(wrap),
};

// Page type options for the UI
export const PAGE_TYPES = [
  { value: "ABOUT_US", label: "About Us" },
  { value: "CONTACT_US", label: "Contact Us" },
  { value: "TERMS_CONDITIONS", label: "Terms & Conditions" },
  { value: "PRIVACY_POLICY", label: "Privacy Policy" },
  { value: "REFUND_POLICY", label: "Refund Policy" },
  { value: "FAQ", label: "FAQ" },
  { value: "HELP", label: "Help" },
  { value: "SUPPORT", label: "Support" },
  { value: "CAREERS", label: "Careers" },
];