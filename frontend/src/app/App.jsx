/**
 * TÊN FILE: App.jsx
 * CÔNG DỤNG: Root Layout khung xương toàn cục, điều phối 3 giao diện chính (Dashboard, WorkView, CalendarView), tích hợp AuthProvider, Header và AuthModal.
 * PHẠM VI DÙNG: Cấp 0 - App.
 */

import { useState, useCallback } from 'react';
import { AuthProvider } from './providers/AuthContext.jsx';
import Header from '../components/Header/index.js';
import AuthModal from '../common/Auth/index.js';
import Dashboard from '../customer/Dashboard/index.js';
import WorkView from '../customer/WorkView/index.js';
import CalendarView from '../customer/CalendarView/index.js';
import SnakeGame from '../components/SnakeGame/index.js';
import styles from './App.module.scss';

/**
 * Component thân chính của ứng dụng chứa luồng điều hướng 3 giao diện và hộp thoại xác thực.
 */
function MainApp() {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authInitialTab, setAuthInitialTab] = useState('login');

  // Quản lý 3 giao diện chính: 'dashboard' (Mặc định) | 'works' | 'calendar' | 'snake'
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedWorkFromDashboard, setSelectedWorkFromDashboard] = useState(null);

  /**
   * Mở hộp thoại đăng nhập hoặc đăng ký theo tab chỉ định.
   * @param {string} tab - Tên tab ('login' hoặc 'register')
   */
  const handleOpenAuth = useCallback((tab = 'login') => {
    setAuthInitialTab(tab);
    setAuthModalOpen(true);
  }, []);

  /**
   * Đóng hộp thoại xác thực.
   */
  const handleCloseAuth = useCallback(() => {
    setAuthModalOpen(false);
  }, []);

  /**
   * Chuyển đổi qua lại giữa 3 giao diện chính hoặc mini game.
   * @param {string} tabId - Định danh giao diện ('dashboard' | 'works' | 'calendar' | 'snake')
   */
  const handleChangeTab = useCallback((tabId) => {
    setActiveTab(tabId);
  }, []);

  /**
   * Chuyển từ Dashboard sang thẳng giao diện Work và tự động mở chi tiết Work được chọn.
   * @param {string} workId - ID của đầu việc cần xem
   */
  const handleSelectWorkFromDashboard = useCallback((workId) => {
    setSelectedWorkFromDashboard(workId);
    setActiveTab('works');
  }, []);

  /**
   * Xóa ID đầu việc tạm sau khi WorkView đã tự động mở xong.
   */
  const handleClearInitialWork = useCallback(() => {
    setSelectedWorkFromDashboard(null);
  }, []);

  if (activeTab === 'snake') {
    return <SnakeGame onOpenDashboard={() => handleChangeTab('dashboard')} />;
  }

  return (
    <div className={styles.appShell}>
      <Header
        activeTab={activeTab}
        onChangeTab={handleChangeTab}
        onOpenAuth={handleOpenAuth}
        onOpenSnakeGame={() => handleChangeTab('snake')}
      />

      <main className={styles.mainContent}>
        {activeTab === 'dashboard' && (
          <Dashboard
            onOpenAuth={handleOpenAuth}
            onNavigateTab={handleChangeTab}
            onSelectWorkFromDashboard={handleSelectWorkFromDashboard}
          />
        )}

        {activeTab === 'works' && (
          <WorkView
            initialSelectedWorkId={selectedWorkFromDashboard}
            onClearInitialWork={handleClearInitialWork}
            onOpenAuth={handleOpenAuth}
          />
        )}

        {activeTab === 'calendar' && <CalendarView onOpenAuth={handleOpenAuth} />}
      </main>

      <footer className={styles.footer}>
        <p>
          © 2026 StudyTrack — Hệ thống Quản lý Tổng quan (Dashboard), Đầu việc (Work) & Lịch ngày nhớ
          (Calendar).
        </p>
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
