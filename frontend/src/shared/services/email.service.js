/**
 * TÊN FILE: email.service.js
 * CÔNG DỤNG: Xử lý việc sinh mã OTP xác thực và gửi email xác nhận cho người dùng trực tiếp từ Frontend qua EmailJS hoặc Dev Mode Fallback.
 * PHẠM VI DÙNG: Toàn hệ thống Frontend (Shared).
 */

/**
 * Sinh mã OTP ngẫu nhiên gồm 6 chữ số.
 * @returns {string} - Chuỗi 6 chữ số OTP
 */
export function generateOtpCode() {
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  return String(randomNum);
}

/**
 * Gửi email chứa mã xác nhận OTP tới hòm thư người dùng.
 * Sử dụng dịch vụ EmailJS nếu đã có cấu hình trong file .env, ngược lại chạy chế độ Dev Mode.
 * @param {object} param0 - Gồm email, username, otp
 * @returns {Promise<object>} - Kết quả gửi email { success, isDevMode, message }
 */
export async function sendVerificationEmail({ email, username = '', otp }) {
  const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
  const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
  const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

  // Nếu người dùng đã cấu hình đầy đủ thông tin EmailJS
  if (serviceId && templateId && publicKey) {
    try {
      const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          service_id: serviceId,
          template_id: templateId,
          user_id: publicKey,
          template_params: {
            to_email: email,
            user_name: username || 'Bạn',
            otp_code: otp,
            passcode: otp,
            time: '5 phút',
            expiry_minutes: 5,
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Không thể gửi email xác nhận qua EmailJS.');
      }

      return {
        success: true,
        isDevMode: false,
        message: 'Mã xác nhận đã được gửi đến email của bạn.',
      };
    } catch (error) {
      console.error('[EmailService] Lỗi khi gửi email:', error);
      throw new Error('Gửi email xác thực thất bại. Vui lòng kiểm tra lại địa chỉ email hoặc kết nối mạng.', {
        cause: error,
      });
    }
  }

  // Chế độ Dev Mode: Khi chưa cấu hình key EmailJS, hiển thị thông báo để test nhanh
  console.info(
    `%c[EMAIL VERIFICATION - DEV MODE]%c\nĐích gửi: ${email}\nNgười nhận: ${username}\nMã OTP: ${otp}\nHiệu lực: 5 phút`,
    'background: #4f46e5; color: #fff; font-weight: bold; padding: 4px 8px; border-radius: 4px;',
    'color: #0284c7; font-size: 13px; font-weight: bold;'
  );

  return {
    success: true,
    isDevMode: true,
    message: 'Mã xác nhận thử nghiệm đã được tạo thành công!',
  };
}
