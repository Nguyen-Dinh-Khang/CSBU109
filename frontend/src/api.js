import axios from 'axios';

// Lấy URL Backend từ biến môi trường (nếu có cấu hình trên Vercel hoặc file .env)
// Nếu ở production và không có biến môi trường, tự động fallback sang URL Render
// Nếu ở development, để trống '' để tận dụng Vite dev proxy sang http://localhost:5000
const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/+$/, '');
  }
  if (import.meta.env.PROD) {
    return 'https://csbu109.onrender.com';
  }
  return '';
};

export const API_BASE_URL = getApiBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
