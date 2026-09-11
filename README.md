# Full-Stack Web App: Node.js (Express) + MongoDB & React (Vite)

Dự án cơ bản đã được thiết lập hoàn chỉnh với cấu trúc Backend và Frontend tách biệt.

---

## 📁 Cấu Trúc Dự Án

```text
CSBU109-Assignments/
├── backend/                  # Máy chủ Node.js & REST API
│   ├── config/
│   │   └── db.js             # Cấu hình kết nối MongoDB với Mongoose
│   ├── models/
│   │   └── Item.js           # Schema mẫu MongoDB
│   ├── routes/
│   │   └── api.js            # Các REST API endpoints (/api/status, /api/items, ...)
│   ├── .env                  # Cấu hình biến môi trường (PORT, MONGODB_URI)
│   ├── .env.example          # Mẫu biến môi trường
│   ├── package.json          # Dependencies backend
│   └── server.js             # File khởi chạy máy chủ Express
│
├── frontend/                 # Giao diện người dùng React (Vite)
│   ├── src/
│   │   ├── App.jsx           # Giao diện hiển thị trạng thái kết nối & demo CRUD
│   │   ├── App.css           # Giao diện đẹp, hiện đại
│   │   └── main.jsx          # Entry point của React
│   ├── package.json          # Dependencies frontend
│   └── vite.config.js        # Cấu hình Vite & Proxy chuyển tiếp /api sang Backend
│
└── README.md
```

---

## 📦 Các Package Đã Cài Đặt

### 1. Backend:
- `express`: Framework dựng Web server & REST API.
- `mongoose`: Thư viện kết nối và định nghĩa schema cho MongoDB.
- `dotenv`: Đọc biến môi trường từ tệp `.env`.
- `cors`: Hỗ trợ chia sẻ tài nguyên cross-origin giữa React và Node.js.
- `nodemon` *(devDependency)*: Tự động khởi động lại server khi chỉnh sửa code.

### 2. Frontend:
- `react`, `react-dom`: Thư viện xây dựng giao diện người dùng.
- `axios`: Gửi HTTP Request tới backend.
- `vite`: Công cụ build và máy chủ phát triển cực nhanh.

---

## 🚀 Hướng Dẫn Khởi Chạy

Mở **2 tab terminal** riêng biệt trong VS Code:

### Terminal 1: Chạy Backend (Port 5000)
```bash
cd backend
npm run dev
```
> Server sẽ chạy tại `http://localhost:5000`

### Terminal 2: Chạy Frontend (Port 5173)
```bash
cd frontend
npm run dev
```
> Truy cập trình duyệt tại `http://localhost:5173`

---

## 🍃 Cách Kết Nối MongoDB

Khi bạn có chuỗi kết nối MongoDB (Atlas hoặc Local):

1. Mở file [backend/.env](file:///c:/Users/khang/.vscode/CSBU109-Assignments/backend/.env).
2. Dán link vào sau `MONGODB_URI=`:
   - **Ví dụ MongoDB Atlas**:
     ```env
     MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/myDatabase?retryWrites=true&w=majority
     ```
   - **Ví dụ MongoDB Local**:
     ```env
     MONGODB_URI=mongodb://127.0.0.1:27017/myDatabase
     ```
3. Lưu file `.env`. Backend sẽ tự động kết nối lại và hiển thị thông báo kết nối thành công!
