/**
 * TÊN FILE: AuthModal.jsx
 * CÔNG DỤNG: Giao diện Modal Đăng nhập & Đăng ký tài khoản người dùng kèm xác thực mã OTP qua Email trước khi gửi dữ liệu lên máy chủ.
 * PHẠM VI DÙNG: Phân hệ Common (Màn hình/tính năng dùng chung).
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../../app/providers/AuthContext.jsx';
import { generateOtpCode, sendVerificationEmail } from '../../shared/services/email.service.js';
import styles from './AuthModal.module.scss';

/**
 * Component Modal xử lý đăng nhập và tạo mới tài khoản có xác thực email.
 * @param {object} props - Thuộc tính component gồm isOpen, onClose, initialTab
 */
export function AuthModal({ isOpen, onClose, initialTab = 'login' }) {
  const { login, register } = useAuth();

  const [activeTab, setActiveTab] = useState(initialTab);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Trạng thái các bước đăng ký ('form' hoặc 'otp')
  const [registerStep, setRegisterStep] = useState('form');
  const [inputOtp, setInputOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [otpExpiresAt, setOtpExpiresAt] = useState(null);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [devOtpPreview, setDevOtpPreview] = useState('');

  // Dữ liệu Form đăng nhập
  const [loginData, setLoginData] = useState({
    identifier: '',
    password: '',
  });

  // Dữ liệu Form đăng ký
  const [registerData, setRegisterData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
  });

  // Reset dữ liệu và trạng thái khi mở modal hoặc đổi tab
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActiveTab(initialTab);
    setErrorMessage('');
    setSuccessMessage('');
    setRegisterStep('form');
    setInputOtp('');
    setGeneratedOtp('');
    setOtpExpiresAt(null);
    setResendCountdown(0);
    setDevOtpPreview('');
  }, [initialTab, isOpen]);

  // Bộ đếm ngược thời gian cho nút "Gửi lại mã"
  useEffect(() => {
    if (resendCountdown <= 0) return;

    const timer = setInterval(() => {
      setResendCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [resendCountdown]);

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
   * Cập nhật mã OTP người dùng nhập vào.
   * @param {object} e - Event thay đổi input
   */
  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setInputOtp(value);
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
   * Kiểm tra tính hợp lệ của dữ liệu biểu mẫu đăng ký.
   * @returns {boolean} - Trạng thái hợp lệ
   */
  const validateRegisterForm = () => {
    const { email, username, password, confirmPassword } = registerData;

    if (!email.trim() || !username.trim() || !password) {
      setErrorMessage('Vui lòng điền đầy đủ Email, Username và Mật khẩu.');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMessage('Định dạng email không hợp lệ. Vui lòng nhập đúng email.');
      return false;
    }

    if (password.length < 6) {
      setErrorMessage('Mật khẩu cần tối thiểu 6 ký tự.');
      return false;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Mật khẩu xác nhận không trùng khớp.');
      return false;
    }

    return true;
  };

  /**
   * Sinh mã OTP và gửi email xác nhận đến hòm thư người dùng.
   * @param {object} e - Form event
   */
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!validateRegisterForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      const newOtp = generateOtpCode();
      const sendResult = await sendVerificationEmail({
        email: registerData.email.trim(),
        username: registerData.username.trim(),
        otp: newOtp,
      });

      setGeneratedOtp(newOtp);
      // Thời hạn mã xác nhận là 5 phút
      setOtpExpiresAt(Date.now() + 5 * 60 * 1000);
      // Khóa nút gửi lại trong 60 giây
      setResendCountdown(60);
      setRegisterStep('otp');

      if (sendResult.isDevMode) {
        setDevOtpPreview(newOtp);
        setSuccessMessage('Hệ thống đang ở chế độ thử nghiệm: Mã OTP đã hiển thị bên dưới để bạn test.');
      } else {
        setDevOtpPreview('');
        setSuccessMessage('Mã xác nhận gồm 6 chữ số đã được gửi tới email của bạn. Vui lòng kiểm tra hộp thư!');
      }
    } catch (error) {
      setErrorMessage(error.message || 'Không thể gửi mã xác nhận. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Gửi lại mã xác nhận mới khi người dùng yêu cầu.
   */
  const handleResendOtp = async () => {
    if (resendCountdown > 0 || isSubmitting) return;

    setErrorMessage('');
    setSuccessMessage('');

    try {
      setIsSubmitting(true);
      const newOtp = generateOtpCode();
      const sendResult = await sendVerificationEmail({
        email: registerData.email.trim(),
        username: registerData.username.trim(),
        otp: newOtp,
      });

      setGeneratedOtp(newOtp);
      setOtpExpiresAt(Date.now() + 5 * 60 * 1000);
      setResendCountdown(60);
      setInputOtp('');

      if (sendResult.isDevMode) {
        setDevOtpPreview(newOtp);
        setSuccessMessage('Đã tạo mã OTP mới thành công!');
      } else {
        setDevOtpPreview('');
        setSuccessMessage('Mã xác nhận mới đã được gửi tới hòm thư của bạn.');
      }
    } catch (error) {
      setErrorMessage(error.message || 'Gửi lại mã thất bại. Vui lòng thử lại sau.');
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Quay lại bước chỉnh sửa thông tin đăng ký.
   */
  const handleBackToForm = () => {
    setRegisterStep('form');
    setErrorMessage('');
    setSuccessMessage('');
  };

  /**
   * Đối soát mã OTP và hoàn tất đăng ký tài khoản gửi lên Backend.
   * @param {object} e - Form event
   */
  const handleVerifyAndRegister = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!inputOtp || inputOtp.length !== 6) {
      setErrorMessage('Vui lòng nhập đầy đủ 6 chữ số mã xác nhận.');
      return;
    }

    if (otpExpiresAt && Date.now() > otpExpiresAt) {
      setErrorMessage('Mã xác nhận đã hết hạn (quá 5 phút). Vui lòng nhấn "Gửi lại mã".');
      return;
    }

    if (inputOtp !== generatedOtp) {
      setErrorMessage('Mã xác nhận không chính xác. Vui lòng kiểm tra lại.');
      return;
    }

    // Sau khi mã OTP hợp lệ, tiến hành gọi API backend
    try {
      setIsSubmitting(true);
      await register(
        registerData.email.trim(),
        registerData.username.trim(),
        registerData.password
      );

      setSuccessMessage('Xác thực email thành công! Đang chuyển tiếp...');
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
              setSuccessMessage('');
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
              setSuccessMessage('');
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
                  setSuccessMessage('');
                }}
              >
                Đăng ký ngay
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 className={styles.title}>
              {registerStep === 'form' ? 'Tạo tài khoản mới' : 'Xác thực Email'}
            </h2>
            <p className={styles.subtitle}>
              {registerStep === 'form'
                ? 'Nhập thông tin cơ bản để nhận mã xác nhận kích hoạt tài khoản.'
                : 'Nhập mã gồm 6 chữ số đã được gửi tới email để hoàn tất.'}
            </p>

            {errorMessage && <div className={styles.errorAlert}>{errorMessage}</div>}
            {successMessage && <div className={styles.successAlert}>{successMessage}</div>}

            {registerStep === 'form' ? (
              <form className={styles.form} onSubmit={handleRequestOtp}>
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
                  {isSubmitting ? 'Đang gửi mã qua email...' : 'Tiếp tục & Nhận mã qua Email'}
                </button>
              </form>
            ) : (
              <form className={styles.form} onSubmit={handleVerifyAndRegister}>
                <div className={styles.otpInfoBox}>
                  <span>
                    Mã gửi tới: <strong className={styles.otpTargetEmail}>{registerData.email}</strong>
                  </span>
                  <button
                    type="button"
                    className={styles.changeEmailBtn}
                    onClick={handleBackToForm}
                  >
                    Đổi email
                  </button>
                </div>

                {devOtpPreview && (
                  <div className={styles.devNotice}>
                    💡 <strong>Chế độ thử nghiệm:</strong> Mã OTP của bạn là{' '}
                    <strong>{devOtpPreview}</strong>
                  </div>
                )}

                <div className={styles.formGroup}>
                  <label className={styles.label} htmlFor="register-otp">
                    Mã xác nhận OTP (6 số)
                  </label>
                  <input
                    id="register-otp"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    className={`${styles.input} ${styles.otpInput}`}
                    placeholder="------"
                    value={inputOtp}
                    onChange={handleOtpChange}
                    autoComplete="one-time-code"
                    autoFocus
                    required
                  />
                </div>

                <div className={styles.otpActionsRow}>
                  <span>Hiệu lực mã: 5 phút</span>
                  <button
                    type="button"
                    className={styles.resendBtn}
                    onClick={handleResendOtp}
                    disabled={resendCountdown > 0 || isSubmitting}
                  >
                    {resendCountdown > 0 ? `Gửi lại mã sau (${resendCountdown}s)` : 'Gửi lại mã'}
                  </button>
                </div>

                <div className={styles.buttonGroup}>
                  <button
                    type="button"
                    className={styles.btnBack}
                    onClick={handleBackToForm}
                    disabled={isSubmitting}
                  >
                    Quay lại
                  </button>
                  <button
                    type="submit"
                    className={styles.btnConfirm}
                    disabled={isSubmitting || inputOtp.length !== 6}
                  >
                    {isSubmitting ? 'Đang xác thực...' : 'Xác thực & Tạo tài khoản'}
                  </button>
                </div>
              </form>
            )}

            <div className={styles.footerText}>
              Đã có tài khoản?
              <button
                type="button"
                onClick={() => {
                  setActiveTab('login');
                  setErrorMessage('');
                  setSuccessMessage('');
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
