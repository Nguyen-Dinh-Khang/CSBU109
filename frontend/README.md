# Frontend - CSBU109 Project

Dự án Frontend xây dựng bằng React và Vite, quản lý tiến độ học tập và đồ án.

---

## 🛠 Hướng dẫn cấu hình EmailJS gửi mã xác thực (Production & Development)

Để kích hoạt tính năng gửi email xác thực mã OTP thực tế tới hòm thư người dùng khi đăng ký tài khoản:

### Bước 1: Đăng ký tài khoản EmailJS
1. Truy cập [https://www.emailjs.com/](https://www.emailjs.com/) và đăng ký một tài khoản miễn phí (gói Free hỗ trợ 200 email/tháng, hoàn toàn đủ cho nhu cầu đồ án và thử nghiệm).

### Bước 2: Tạo Email Service (Kết nối hòm thư gửi đi)
1. Tại Dashboard EmailJS, vào mục **Email Services** $\rightarrow$ chọn **Add New Service**.
2. Chọn dịch vụ hòm thư của bạn (khuyên dùng **Gmail** hoặc **Outlook**).
3. Đăng nhập tài khoản Gmail bạn muốn dùng làm hòm thư hệ thống để gửi mã.
4. Bấm **Create Service** và sao chép **Service ID** (ví dụ: `service_abc123`).

### Bước 3: Tạo Email Template (Mẫu thư OTP)
1. Vào mục **Email Templates** $\rightarrow$ chọn **Create New Template**.
2. Cấu hình các trường trong template tương ứng với các biến code frontend gửi lên:
   - **To Email**: `{{to_email}}` *(Bắt buộc phải điền đúng để email gửi về hòm thư người đăng ký)*
   - **Subject**: `Mã xác thực đăng ký tài khoản của bạn: {{otp_code}}`
   - **Nội dung email (Body)**:
     ```html
     Xin chào {{user_name}},

     Mã xác thực OTP để kích hoạt tài khoản của bạn là: {{otp_code}}

     Mã này có hiệu lực trong {{expiry_minutes}} phút. Vui lòng không chia sẻ mã này cho bất kỳ ai.

     Trân trọng,
     Hệ thống Quản lý Tiến độ CSBU109
     ```
3. Bấm **Save** và sao chép **Template ID** (ví dụ: `template_xyz789`).

### Bước 4: Lấy Public Key (API Key)
1. Nhấp vào mục **Account** (hoặc biểu tượng tài khoản ở góc dưới bên trái menu).
2. Chuyển sang tab **API Keys**.
3. Sao chép chuỗi **Public Key** (ví dụ: `user_xxxxxxxxxxxxxxxx` hoặc một chuỗi ký tự ngẫu nhiên).

### Bước 5: Cài đặt biến môi trường

#### Khi chạy Local:
Tạo tệp `frontend/.env` (hoặc sửa `.env.local`):
```env
VITE_API_URL=http://localhost:5000
VITE_EMAILJS_SERVICE_ID=service_abc123
VITE_EMAILJS_TEMPLATE_ID=template_xyz789
VITE_EMAILJS_PUBLIC_KEY=user_xxxxxxxxxxxxxxxx
```

#### Khi triển khai lên Production (Vercel / Netlify / Render / Cloudflare Pages):
1. Vào phần **Project Settings** $\rightarrow$ **Environment Variables** trên trang quản trị host (Vercel/Netlify/...).
2. Thêm 3 biến môi trường:
   - `VITE_EMAILJS_SERVICE_ID`: `<Service ID vừa lấy>`
   - `VITE_EMAILJS_TEMPLATE_ID`: `<Template ID vừa lấy>`
   - `VITE_EMAILJS_PUBLIC_KEY`: `<Public Key vừa lấy>`
3. Kích hoạt lại bản Build (Redeploy) để Vite đóng gói các biến môi trường vào ứng dụng.

> **Lưu ý**: Nếu bạn chưa điền 3 biến trên, hệ thống sẽ tự động bật **Chế độ Thử nghiệm (Dev Mode)**: mã OTP được hiển thị trực tiếp trên giao diện và in ra Console giúp kiểm thử các tính năng nhanh chóng.
