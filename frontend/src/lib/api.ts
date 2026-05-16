import axios from "axios";
import { useAuthStore } from "../store/auth";

export const api = axios.create({ baseURL: import.meta.env.VITE_API_URL });

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      if (window.location.pathname !== "/login") window.location.assign("/login");
    }
    return Promise.reject(error);
  }
);

export const unwrap = <T,>(promise: Promise<{ data: { success: boolean; data?: T; message?: string } }>) =>
  promise.then((response) => {
    if (!response.data.success) throw new Error(response.data.message || "Request failed");
    return response.data.data as T;
  });
