/**
 * TÊN FILE: AuthModal.jsx
 * CÔNG DỤNG: Giao diện Modal Đăng nhập & Đăng ký tài khoản người dùng với 3 thông số email, username, password.
 * PHẠM VI DÙNG: Phân hệ Common (Màn hình/tính năng dùng chung).
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../../app/providers/AuthContext.jsx';
import styles from './AuthModal.module.scss';

/**
 * Component Modal xử lý đăng nhập và tạo mới tài khoản.
 * @param {object} props - Thuộc tính component gồm isOpen, onClose, initialTab
 */
export function AuthModal({ isOpen, onClose, initialTab = 'login' }) {
  const { login, register } = useAuth();

  const [activeTab, setActiveTab] = useState(initialTab);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Dữ liệu Form đăng nhập
  const [loginData, setLoginData] = useState({
    identifier: '',
    password: '',
  });

  // Dữ liệu Form đăng ký (User cần nhập email, username và password)
  const [registerData, setRegisterData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
  });

  useEffect(() => {
    setActiveTab(initialTab);
    setErrorMessage('');
    setSuccessMessage('');
  }, [initialTab, isOpen]);

  if (!isOpen) return null;

  /**
   * Cập nhật trường dữ liệu form đăng nhập.
   * @param {object} e - Event thay đổi input
   */
  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData((prev) => ({ ...prev, [name]: value }));
    if (errorMessage) setErrorMessage('');
  };

  /**
   * Cập nhật trường dữ liệu form đăng ký.
   * @param {object} e - Event thay đổi input
   */
  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    setRegisterData((prev) => ({ ...prev, [name]: value }));
    if (errorMessage) setErrorMessage('');
  };

  /**
   * Xử lý gửi Form Đăng nhập.
   * @param {object} e - Form event
   */
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!loginData.identifier.trim() || !loginData.password) {
      setErrorMessage('Vui lòng nhập đầy đủ Email/Username và Mật khẩu.');
      return;
    }

    try {
      setIsSubmitting(true);
      await login(loginData.identifier, loginData.password);
      onClose();
    } catch (error) {
      const msg = error.response?.data?.message || 'Đăng nhập không thành công. Vui lòng kiểm tra lại.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Xử lý gửi Form Đăng ký tài khoản.
   * @param {object} e - Form event
   */
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const { email, username, password, confirmPassword } = registerData;

    if (!email.trim() || !username.trim() || !password) {
      setErrorMessage('Vui lòng điền đầy đủ Email, Username và Mật khẩu.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Mật khẩu cần tối thiểu 6 ký tự.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Mật khẩu xác nhận không trùng khớp.');
      return;
    }

    try {
      setIsSubmitting(true);
      await register(email, username, password);
      setSuccessMessage('Tạo tài khoản thành công! Đang chuyển tiếp...');
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (error) {
      const msg = error.response?.data?.message || 'Đăng ký tài khoản thất bại. Vui lòng thử lại.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Đóng modal">
          ✕
        </button>

        <div className={styles.tabs}>
          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === 'login' ? styles.active : ''}`}
            onClick={() => {
              setActiveTab('login');
              setErrorMessage('');
            }}
          >
            Đăng nhập
          </button>
          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === 'register' ? styles.active : ''}`}
            onClick={() => {
              setActiveTab('register');
              setErrorMessage('');
            }}
          >
            Đăng ký
          </button>
        </div>

        {activeTab === 'login' ? (
          <>
            <h2 className={styles.title}>Chào mừng trở lại!</h2>
            <p className={styles.subtitle}>Đăng nhập để tiếp tục theo dõi tiến độ các môn học và dự án.</p>

            {errorMessage && <div className={styles.errorAlert}>{errorMessage}</div>}

            <form className={styles.form} onSubmit={handleLoginSubmit}>
              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="login-identifier">
                  Email hoặc Username
                </label>
                <input
                  id="login-identifier"
                  type="text"
                  name="identifier"
                  className={styles.input}
                  placeholder="name@example.com hoặc username"
                  value={loginData.identifier}
                  onChange={handleLoginChange}
                  autoComplete="username"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="login-password">
                  Mật khẩu
                </label>
                <input
                  id="login-password"
                  type="password"
                  name="password"
                  className={styles.input}
                  placeholder="Nhập mật khẩu của bạn"
                  value={loginData.password}
                  onChange={handleLoginChange}
                  autoComplete="current-password"
                  required
                />
              </div>

              <button type="submit" className={styles.btnSubmit} disabled={isSubmitting}>
                {isSubmitting ? 'Đang xác thực...' : 'Đăng nhập ngay'}
              </button>
            </form>

            <div className={styles.footerText}>
              Chưa có tài khoản?
              <button
                type="button"
                onClick={() => {
                  setActiveTab('register');
                  setErrorMessage('');
                }}
              >
                Đăng ký ngay
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 className={styles.title}>Tạo tài khoản mới</h2>
            <p className={styles.subtitle}>Chỉ cần 3 thông tin cơ bản: Email, Username và Mật khẩu.</p>

            {errorMessage && <div className={styles.errorAlert}>{errorMessage}</div>}
            {successMessage && <div className={styles.successAlert}>{successMessage}</div>}

            <form className={styles.form} onSubmit={handleRegisterSubmit}>
              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="register-email">
                  Địa chỉ Email
                </label>
                <input
                  id="register-email"
                  type="email"
                  name="email"
                  className={styles.input}
                  placeholder="name@example.com"
                  value={registerData.email}
                  onChange={handleRegisterChange}
                  autoComplete="email"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="register-username">
                  Tên người dùng (Username)
                </label>
                <input
                  id="register-username"
                  type="text"
                  name="username"
                  className={styles.input}
                  placeholder="Ví dụ: hoangnam, developer99"
                  value={registerData.username}
                  onChange={handleRegisterChange}
                  autoComplete="username"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="register-password">
                  Mật khẩu
                </label>
                <input
                  id="register-password"
                  type="password"
                  name="password"
                  className={styles.input}
                  placeholder="Tối thiểu 6 ký tự"
                  value={registerData.password}
                  onChange={handleRegisterChange}
                  autoComplete="new-password"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="register-confirm">
                  Xác nhận lại mật khẩu
                </label>
                <input
                  id="register-confirm"
                  type="password"
                  name="confirmPassword"
                  className={styles.input}
                  placeholder="Nhập lại mật khẩu"
                  value={registerData.confirmPassword}
                  onChange={handleRegisterChange}
                  autoComplete="new-password"
                  required
                />
              </div>

              <button type="submit" className={styles.btnSubmit} disabled={isSubmitting}>
                {isSubmitting ? 'Đang tạo tài khoản...' : 'Tạo tài khoản'}
              </button>
            </form>

            <div className={styles.footerText}>
              Đã có tài khoản?
              <button
                type="button"
                onClick={() => {
                  setActiveTab('login');
                  setErrorMessage('');
                }}
              >
                Đăng nhập
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default AuthModal;
