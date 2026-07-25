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
