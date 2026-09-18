/**
 * TÊN FILE: App.jsx
 * CÔNG DỤNG: Root Layout khung xương toàn cục, tích hợp AuthProvider, Header, Dashboard và AuthModal.
 * PHẠM VI DÙNG: Cấp 0 - App.
 */

import { useState } from 'react';
import { AuthProvider } from './providers/AuthContext.jsx';
import Header from '../components/Header/index.js';
import AuthModal from '../common/Auth/index.js';
import Dashboard from '../customer/Dashboard/index.js';
import SnakeGame from '../components/SnakeGame/index.js';
import styles from './App.module.scss';

/**
 * Component thân chính của ứng dụng chứa luồng hiển thị giao diện và hộp thoại xác thực.
 */
function MainApp() {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authInitialTab, setAuthInitialTab] = useState('login');
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard' | 'snake'

  /**
   * Mở hộp thoại đăng nhập hoặc đăng ký theo tab chỉ định.
   * @param {string} tab - Tên tab ('login' hoặc 'register')
   */
  const handleOpenAuth = (tab = 'login') => {
    setAuthInitialTab(tab);
    setAuthModalOpen(true);
  };

  /**
   * Đóng hộp thoại xác thực.
   */
  const handleCloseAuth = () => {
    setAuthModalOpen(false);
  };

  /**
   * Chuyển đổi giữa giao diện Dashboard và mini game Rắn săn mồi.
   * @param {string} view - Tên giao diện ('dashboard' hoặc 'snake')
   */
  const handleSwitchView = (view) => {
    setCurrentView(view);
  };

  if (currentView === 'snake') {
    return (
      <SnakeGame onOpenDashboard={() => handleSwitchView('dashboard')} />
    );
  }

  return (
    <div className={styles.appShell}>
      <Header
        onOpenAuth={handleOpenAuth}
        onOpenSnakeGame={() => handleSwitchView('snake')}
      />

      <main className={styles.mainContent}>
        <Dashboard onOpenAuth={handleOpenAuth} />
      </main>

      <footer className={styles.footer}>
        <p>© 2026 StudyTrack - Hệ thống Quản lý Lịch trình & Đầu việc theo Giai đoạn. Được thiết kế theo chuẩn GEMINI.</p>
      </footer>

      <AuthModal
        isOpen={authModalOpen}
        onClose={handleCloseAuth}
        initialTab={authInitialTab}
      />
    </div>
  );
}

/**
 * Component Root của ứng dụng được bọc bởi AuthProvider.
 */
export function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

export default App;
