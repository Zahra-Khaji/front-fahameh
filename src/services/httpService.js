// src/services/httpService.js
import axios from "axios";

export const BASE_URL = import.meta.env.VITE_BASE_URL || "http://127.0.0.1:8001";
// export const BASE_URL = import.meta.env.VITE_BASE_URL || "http://192.168.0.4:8001";

const app = axios.create({
  baseURL: BASE_URL,
  withCredentials: false,
});

// Request Interceptor
app.interceptors.request.use(
  (config) => {
    // استفاده از توکن واقعی از localStorage
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    config.headers.Accept = "application/json";
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
app.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalConfig = error.config;

    if (error.response?.status === 401 && !originalConfig._retry) {
      originalConfig._retry = true;
      try {
        // در صورت انقضای توکن، کاربر به صفحه لاگین هدایت شود
        localStorage.removeItem("access_token");
        localStorage.removeItem("token_type");
        window.location.href = "/login";
        return Promise.reject(error);
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

const http = {
  get: app.get,
  post: app.post,
  delete: app.delete,
  put: app.put,
  patch: app.patch,
};

export default http;
