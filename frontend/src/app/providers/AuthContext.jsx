/**
 * TÊN FILE: AuthContext.jsx
 * CÔNG DỤNG: Cung cấp Context quản lý trạng thái đăng nhập, người dùng toàn ứng dụng và cơ chế khôi phục phiên từ Cookie.
 * PHẠM VI DÙNG: Toàn hệ thống Frontend (Cấp 0 - Providers).
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  loginUser,
  registerUser,
  logoutUser,
  refreshAccessToken,
  getCurrentUser,
} from '../../shared/services/auth.service.js';

const AuthContext = createContext(null);

/**
 * Component bọc Provider cung cấp dữ liệu và các hành động xác thực cho toàn bộ cây thư mục giao diện.
 * @param {object} props - Thuộc tính component gồm children
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Khởi tạo và kiểm tra phiên làm việc tự động từ Cookie khi người dùng mở trang web.
   */
  const checkAuthStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      // Gọi refresh để lấy lại accessToken nếu cookie còn hiệu lực
      await refreshAccessToken();
      const meResponse = await getCurrentUser();
      if (meResponse?.user) {
        setUser(meResponse.user);
      }
    } catch {
      // Người dùng là khách (chưa đăng nhập hoặc cookie hết hạn)
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  /**
   * Xử lý hành động đăng nhập từ giao diện.
   * @param {string} identifier - Email hoặc Username
   * @param {string} password - Mật khẩu
   * @returns {Promise<object>} - Dữ liệu đăng nhập thành công
   */
  const login = async (identifier, password) => {
    const data = await loginUser({ identifier, password });
    if (data?.user) {
      setUser(data.user);
    }
    return data;
  };

  /**
   * Xử lý hành động đăng ký tài khoản từ giao diện.
   * @param {string} email - Email người dùng
   * @param {string} username - Username người dùng
   * @param {string} password - Mật khẩu người dùng
   * @returns {Promise<object>} - Dữ liệu đăng ký thành công
   */
  const register = async (email, username, password) => {
    const data = await registerUser({ email, username, password });
    if (data?.user) {
      setUser(data.user);
    }
    return data;
  };

  /**
   * Xử lý hành động đăng xuất tài khoản.
   */
  const logout = async () => {
    try {
      await logoutUser();
    } finally {
      setUser(null);
    }
  };

  const value = {
    user,
    isAuthenticated: Boolean(user),
    isLoading,
    login,
    register,
    logout,
    checkAuthStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Custom hook hỗ trợ truy cập AuthContext nhanh chóng và an toàn trong các components.
 * @returns {object} - Các trạng thái và phương thức auth
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth phải được sử dụng bên trong AuthProvider.');
  }
  return context;
}
