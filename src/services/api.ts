import axios, { AxiosError } from "axios";
import type { AxiosInstance, InternalAxiosRequestConfig } from "axios";

const API_BASE_URL = "http://localhost:8080/api";

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - add JWT token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle 401 errors
apiClient.interceptors.response.use(
  (response: any) => response,
  (error: AxiosError) => {
    // CHỈ xóa token khi 401 từ API được bảo vệ (có Authorization header)
    // KHÔNG xóa khi đăng nhập sai (endpoint /auth/login không cần token)
    if (
      error.response?.status === 401 &&
      error.config?.headers?.Authorization
    ) {
      // Token hết hạn hoặc không hợp lệ: KHÔNG tự đăng xuất/redirect.
      // Trả lỗi về cho tầng UI xử lý (hiển thị thông báo và giữ nguyên trang).
      // Nếu muốn tự đăng xuất, có thể thực hiện ở từng màn hình theo nhu cầu.
    }
    return Promise.reject(error);
  }
);

export default apiClient;
