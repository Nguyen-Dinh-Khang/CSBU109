# CÁC QUY TẮC PHÁT TRIỂN DỰ ÁN (PROJECT RULES)

## 1. Ngôn ngữ & Công nghệ cốt lõi
- Sử dụng JavaScript thuần (`.jsx`, `.js`). Tuyệt đối KHÔNG sử dụng TypeScript (`.ts`, `.tsx`).
- Styling Frontend: Bắt buộc dùng **SCSS Modules** (`.module.scss`) cho từng giao diện/component.
- Không viết CSS/inline styles trực tiếp trong file `.jsx`.
- Code sạch, ưu tiên các cấu trúc đơn giản, rõ ràng, dễ đọc cho con người. Tránh viết code tắt, one-liner khó hiểu hoặc lồng ghép logic quá sâu.
- **Tính độc lập:** Mỗi hàm chỉ thực hiện đúng một nhiệm vụ duy nhất. Dữ liệu vào qua tham số (parameters), dữ liệu ra qua lệnh `return`.
- **Không phụ thuộc biến toàn cục ngoài hàm:** Thay đổi nội dung bên trong một hàm tuyệt đối không được làm ảnh hưởng đến interface bên ngoài (tên hàm, thứ tự tham số nhận vào và định dạng trả về phải giữ nguyên để code tổng thể không bị gãy).
---

## 2. Tiêu chuẩn Document & Chú thích (BẮT BUỘC)

### Đầu mỗi file (File Header)
Đầu mỗi file `.js` hoặc `.jsx` (cả Frontend lẫn Backend) bắt buộc phải có khối chú thích ngắn gọn:
```javascript
/**
 * TÊN FILE: auth.services.js
 * CÔNG DỤNG: Quản lý các hàm gọi API đăng nhập, đăng ký và xác thực token.
 * PHẠM VI DÙNG: Phân hệ Customer & Admin (Common).
 */
```

### Đầu mỗi function (Function Header)
Mọi hàm trong file (dù file chứa một hay nhiều hàm) đều bắt buộc phải có chú thích ngắn gọn để người người đọc biết nó đang làm gì


## 3. Kiến trúc cây thư mục  (Folder Hierarchy)
- Mọi hàm nghiệp vụ (service, controller, hook, utility phức tạp) đều phải có comment ngắn gọn mô tả công dụng.
- Các hàm đơn giản dưới 5–10 dòng có thể bỏ qua.


### Frontend
```text
src/
├── app/                  # CẤP 0: Khung xương toàn cục (Global Shell)
│   ├── App.jsx           # Root layout, điều hướng (Router)
│   ├── App.module.scss   # Khung giao diện toàn trang
│   ├── providers/        # Chứa các Context Provider (Auth, Theme...)
│   └── styles/           # Biến & cấu hình CSS toàn cục
│       ├── _variables.scss # Biến breakpoints màn hình, màu sắc
│       ├── _mixins.scss    # Media queries responsive
│       └── global.scss     # CSS reset, typography chung
│
├── components/           # CẤP 1: Các mảnh giao diện dùng chung ở nhiều nơi
│   └── [tên_layer]/   # Mỗi component nằm trong 1 folder riêng
│       ├── [tên_layer].jsx
│       ├── [tên_layer].module.scss
│       └── index.js      # Export component
│
├── common/               # CẤP 1: Màn hình/tính năng dùng chung cho mọi user (Login, 404...)
│   └── [tên_layer]/
│
├── admin/                # CẤP 1: Toàn bộ giao diện & tính năng DÀNH RIÊNG cho Admin
│   └── [tên_layer]/
│
├── customer/             # CẤP 1: Toàn bộ giao diện & tính năng DÀNH RIÊNG cho Khách hàng
│   └── [tên_layer]/
│
└── shared/               # Chứa code logic thuần không có giao diện
    ├── hooks/            # Custom hooks dùng chung (ví dụ: useDevice.js)
    ├── utils/            # Hàm tiện ích (format tiền, ngày tháng...)
    └── constants/        # Các hằng số toàn cục
```


### Backend
```
server/ (hoặc backend/)
├── config/               # CẤP 1: Cấu hình kết nối DB, biến môi trường
├── models/               # CẤP 1: Định nghĩa cấu trúc dữ liệu / Database Schema
│   ├── common/           # Model dùng chung (User, Notification...)
│   ├── admin/            # Model đặc thù cho quản trị (AuditLog, SystemConfig...)
│   └── customer/         # Model cho khách hàng (Order, Cart...)
│
├── controllers/          # CẤP 1: Nhận request, gọi service và trả response
│   ├── common/
│   ├── admin/
│   └── customer/
│
├── services/             # CẤP 1: Xử lý logic nghiệp vụ, tính toán dữ liệu
│   ├── common/
│   ├── admin/
│   └── customer/
│
├── routes/               # CẤP 1: Định tuyến các API endpoints
│   ├── common/
│   ├── admin/
│   └── customer/
│   └── index.js          # File tổng hợp gom toàn bộ routes
│
└── middlewares/          # CẤP 1: Kiểm tra authentication, validate dữ liệu, phân quyền
```


## 4. Trước khi sửa code
- Luôn đọc toàn bộ file liên quan trước khi sửa.
- Không được suy đoán nội dung file chưa đọc.
- Không được tự ý đổi tên hàm public.
- Không được tự ý đổi interface nếu không được yêu cầu.
- Không được tạo file mới nếu có thể tái sử dụng file hiện có.
- Ưu tiên sửa tối thiểu cần thiết.
- Nếu cần sửa nhiều file, phải đọc các file liên quan trước.


## 5. Trước khi sinh code mới:
- Ưu tiên tái sử dụng hàm, component, service hiện có.
- Không tạo code trùng chức năng nếu trong project đã có implementation tương tự.


## 6. RÀNG BUỘC PHẠM VI (STRICT BOUNDARIES)
- Cấm: Tuyệt đối không viết trực tiếp logic gọi API hoặc các hàm xử lý dữ liệu phức tạp ngay trong file .jsx.
- Cấm: Import chéo giữa các phân hệ: File trong thư mục admin/ tuyệt đối không được import file từ customer/ và ngược lại (áp dụng cho cả Frontend lẫn Backend). Nếu có logic hoặc component dùng chung, phải chuyển ra common/, components/ hoặc shared/.
- Không tóm tắt code: Khi sửa file hoặc sinh code, không được viết comment dạng // ...code cũ giữ nguyên... mà phải cung cấp toàn bộ nội dung hoặc vị trí diff chính xác.


# TEST

Khi trả lời hãy luôn bắt đầu bằng:
"[GEMINI-RULE-LOADED]"