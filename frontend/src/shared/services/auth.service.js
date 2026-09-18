/**
 * TÊN FILE: auth.service.js
 * CÔNG DỤNG: Quản lý các hàm gọi API xác thực, lưu trữ Access Token trong bộ nhớ và tự động refresh token qua HttpOnly Cookie.
 * PHẠM VI DÙNG: Toàn hệ thống Frontend (Shared).
 */

import axios from 'axios';

// Lấy Base URL của API
const getBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/+$/, '');
  }
  return '';
};

// Khởi tạo instance Axios có cấu hình gửi Cookie (withCredentials: true)
export const authApi = axios.create({
  baseURL: getBaseUrl(),
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Biến lưu trữ Access Token trong bộ nhớ (In-memory) nhằm chống tấn công XSS
let inMemoryAccessToken = null;

/**
 * Lấy Access Token hiện tại trong bộ nhớ.
 * @returns {string|null} - Chuỗi token hoặc null
 */
export function getAccessToken() {
  return inMemoryAccessToken;
}

/**
 * Cập nhật Access Token mới vào bộ nhớ.
 * @param {string|null} token - Chuỗi token mới
 */
export function setAccessToken(token) {
  inMemoryAccessToken = token;
}

// Request Interceptor: Tự động gắn Authorization Header nếu có Access Token
authApi.interceptors.request.use(
  (config) => {
    if (inMemoryAccessToken) {
      config.headers.Authorization = `Bearer ${inMemoryAccessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Bắt mã lỗi 401 để tự động gọi refresh token và retry request
let isRefreshing = false;
let failedQueue = [];

/**
 * Xử lý hàng đợi các request bị hoãn trong quá trình làm mới token.
 * @param {Error|null} error - Lỗi nếu có
 * @param {string|null} token - Access token mới
 */
const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

authApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Nếu gặp lỗi 401 và request chưa từng retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      const isAuthUrl =
        originalRequest.url.includes('/api/auth/login') ||
        originalRequest.url.includes('/api/auth/register') ||
        originalRequest.url.includes('/api/auth/refresh');

      if (isAuthUrl) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return authApi(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await authApi.post('/api/auth/refresh');
        setAccessToken(data.accessToken);
        processQueue(null, data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return authApi(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        setAccessToken(null);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

/**
 * Gửi yêu cầu đăng ký tài khoản mới lên máy chủ.
 * @param {object} param0 - Gồm email, username, password
 * @returns {Promise<object>} - Dữ liệu trả về từ máy chủ
 */
export async function registerUser({ email, username, password }) {
  const response = await authApi.post('/api/auth/register', {
    email,
    username,
    password,
  });
  if (response.data?.accessToken) {
    setAccessToken(response.data.accessToken);
  }
  return response.data;
}

/**
 * Gửi yêu cầu đăng nhập tài khoản lên máy chủ.
 * @param {object} param0 - Gồm identifier và password
 * @returns {Promise<object>} - Dữ liệu trả về từ máy chủ
 */
export async function loginUser({ identifier, password }) {
  const response = await authApi.post('/api/auth/login', {
    identifier,
    password,
  });
  if (response.data?.accessToken) {
    setAccessToken(response.data.accessToken);
  }
  return response.data;
}

/**
 * Gửi yêu cầu làm mới Access Token từ Cookie HttpOnly.
 * @returns {Promise<object>} - Dữ liệu gồm token mới và thông tin user
 */
export async function refreshAccessToken() {
  const response = await authApi.post('/api/auth/refresh');
  if (response.data?.accessToken) {
    setAccessToken(response.data.accessToken);
  }
  return response.data;
}

/**
 * Gửi yêu cầu đăng xuất để hủy Cookie và phiên làm việc.
 * @returns {Promise<object>} - Dữ liệu xác nhận thành công
 */
export async function logoutUser() {
  try {
    const response = await authApi.post('/api/auth/logout');
    return response.data;
  } finally {
    setAccessToken(null);
  }
}

/**
 * Lấy thông tin tài khoản người dùng hiện tại từ máy chủ.
 * @returns {Promise<object>} - Thông tin user
 */
export async function getCurrentUser() {
  const response = await authApi.get('/api/auth/me');
  return response.data;
}
