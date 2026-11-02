/**
 * TÊN FILE: ThemeContext.jsx
 * CÔNG DỤNG: Cung cấp Context và Hook quản lý trạng thái giao diện Sáng / Tối (Dark / Light Theme), lưu cấu hình vào localStorage và cập nhật thuộc tính data-theme trên tài liệu.
 * PHẠM VI DÙNG: Toàn hệ thống Frontend (Cấp 0 - Providers).
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ThemeContext = createContext(null);

const THEME_STORAGE_KEY = 'studytrack_theme';

/**
 * Lấy giao diện ban đầu từ localStorage hoặc dựa theo thiết lập của hệ điều hành.
 * @returns {string} - 'dark' hoặc 'light'
 */
function getInitialTheme() {
  if (typeof window === 'undefined') return 'dark';
  const saved = localStorage.getItem(THEME_STORAGE_KEY);
  if (saved === 'dark' || saved === 'light') {
    return saved;
  }
  const prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
  return prefersLight ? 'light' : 'dark';
}

/**
 * Component Provider bao bọc ứng dụng để cung cấp context chủ đề màu sắc.
 * @param {object} props - Thuộc tính component gồm children
 */
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  /**
   * Đổi qua lại giữa giao diện Tối (dark) và Sáng (light).
   */
  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, isDark: theme === 'dark', toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Hook sử dụng Theme Context trong các component con.
 * @returns {object} - Gồm theme, isDark, toggleTheme
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme phải được sử dụng bên trong ThemeProvider.');
  }
  return context;
}
