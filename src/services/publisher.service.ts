import { api } from "@/lib/axios";

export interface Publisher {
  id: string;
  name: string;
  description: string | null;
  logo: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  address: string | null;
  status: string;
  createdAt: string;
}

export interface PublisherPayload {
  name: string;
  description?: string;
  logo?: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  status?: string;
}

const wrap = (r: any) => r.data;

export const publisherService = {
  getAll: (params: { page?: number; limit?: number; search?: string }) =>
    api.get("/publishers", { params }).then(wrap),
  create: (data: PublisherPayload) => api.post("/publishers", data).then(wrap),
  update: (id: string, data: Partial<PublisherPayload>) => api.patch(`/publishers/${id}`, data).then(wrap),
  changeStatus: (id: string, status: string) => api.patch(`/publishers/${id}/status`, { status }).then(wrap),
  
  // Step 1: Upload image first - returns full CDN URL
  uploadImage: async (file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    const res = await api.post("/uploads/local/file", fd, {
      headers: { "Content-Type": "multipart/form-data" }
    }).then(wrap);
    // Return the URL from local upload (response is nested: res.data.data.url)
    return res.data.data.url;
  },
  
  // Step 2: Use the path from upload to update publisher logo
  updateLogo: (id: string, logoPath: string) => 
    api.patch(`/publishers/${id}/logo`, { logo: logoPath }).then(wrap),
    
  delete: (id: string) => api.delete(`/publishers/${id}`).then(wrap),
};