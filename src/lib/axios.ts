import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const raw = localStorage.getItem("bookadmin.token");
    if (raw) config.headers.Authorization = `Bearer ${raw}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (typeof window !== "undefined" && err.response?.status === 401) {
      localStorage.removeItem("bookadmin.token");
      localStorage.removeItem("bookadmin.user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  },
);

// Helper to extract error message from API response
export function getErrorMessage(err: any): string {
  // API returned an error response
  if (err.response?.data) {
    const data = err.response.data;
    
    // Try errors array first
    if (data?.data?.errors && Array.isArray(data.data.errors)) {
      return data.data.errors[0];
    }
    
    // Try messageId lookup (if we have message codes)
    if (data?.messageId) {
      return data.message; // Backend should return message with messageId
    }
    
    // Try message directly
    if (data?.message) {
      return data.message;
    }
  }
  
  // Network error
  if (err.code === 'ECONNABORTED' || err.message === 'Network Error') {
    return 'Network error. Please check your connection.';
  }
  
  // Default
  return 'Something went wrong. Please try again.';
}