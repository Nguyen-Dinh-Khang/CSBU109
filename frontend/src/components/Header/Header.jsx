/**
 * TÊN FILE: Header.jsx
 * CÔNG DỤNG: Giao diện thanh điều hướng Header hiển thị thương hiệu, 3 tab chuyển đổi giao diện chính (Dashboard, Work, Calendar) và thông tin người dùng.
 * PHẠM VI DÙNG: Component Header (Cấp 1 - Components).
 */

import { useAuth } from '../../app/providers/AuthContext.jsx';
import styles from './Header.module.scss';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'works', label: 'Đầu việc (Work)', icon: '📁' },
  { id: 'calendar', label: 'Lịch ngày nhớ', icon: '📅' },
];

/**
 * Component thanh điều hướng chính của ứng dụng.
 * @param {object} props - Thuộc tính gồm activeTab, onChangeTab, onOpenAuth và onOpenSnakeGame
 */
export function Header({ activeTab, onChangeTab, onOpenAuth, onOpenSnakeGame }) {
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  /**
   * Trích xuất ký tự đầu tiên của username làm biểu tượng avatar đại diện.
   * @param {string} name - Tên người dùng
   * @returns {string} - Ký tự hoa đầu tiên
   */
  const getAvatarLetter = (name) => {
    if (!name) return 'U';
    return name.charAt(0).toUpperCase();
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.leftSection}>
          <button
            type="button"
            className={styles.btnSnakeToggle}
            onClick={onOpenSnakeGame}
            title="Chuyển đổi sang giao diện game Rắn săn mồi"
          >
            <span>🎮</span>
            <span className={styles.snakeText}>Rắn săn mồi</span>
          </button>

          <div
            className={styles.brand}
            onClick={() => onChangeTab && onChangeTab('dashboard')}
          >
            <div className={styles.logoIcon}>✦</div>
            <div className={styles.brandText}>
              <span className={styles.brandName}>StudyTrack</span>
              <span className={styles.brandDesc}>Quản lý Mục tiêu & Lịch trình</span>
            </div>
          </div>
        </div>

        {/* Thanh điều hướng 3 giao diện chính */}
        <nav className={styles.navTabs} aria-label="Điều hướng chính">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`${styles.navTabBtn} ${
                activeTab === item.id ? styles.activeTab : ''
              }`}
              onClick={() => onChangeTab && onChangeTab(item.id)}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className={styles.actions}>
          {isLoading ? (
            <span className={styles.brandDesc}>Đang tải phiên...</span>
          ) : isAuthenticated && user ? (
            <>
              <div className={styles.userProfile}>
                <div className={styles.avatar}>{getAvatarLetter(user.username)}</div>
                <div className={styles.userInfo}>
                  <span className={styles.userName}>{user.username}</span>
                  <span className={styles.userIdBadge}>ID: #{user.userId}</span>
                </div>
              </div>
              <button
                type="button"
                className={styles.btnLogout}
                onClick={logout}
                title="Đăng xuất khỏi hệ thống"
              >
                Đăng xuất
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className={styles.btnLogin}
                onClick={() => onOpenAuth('login')}
              >
                Đăng nhập
              </button>
              <button
                type="button"
                className={styles.btnRegister}
                onClick={() => onOpenAuth('register')}
              >
                Đăng ký
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
