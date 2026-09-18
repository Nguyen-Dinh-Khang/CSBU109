/**
 * TÊN FILE: server.js
 * CÔNG DỤNG: Khởi tạo máy chủ Express, thiết lập kết nối cơ sở dữ liệu, middlewares và định tuyến API.
 * PHẠM VI DÙNG: Toàn hệ thống Backend.
 */

import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { connectDB } from './config/db.js';
import routes from './routes/index.js';

// Nạp biến môi trường từ file .env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Khởi chạy kết nối MongoDB
connectDB();

// Cấu hình danh sách tên miền được phép truy cập
const allowedOrigins = [
  'https://csbu-109.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.CLIENT_URL,
].filter(Boolean);

// Cấu hình Middleware CORS hỗ trợ Cookie và Credentials
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || /\.vercel\.app$/.test(origin)) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  })
);

// Middlewares xử lý JSON body và Cookie
app.use(express.json());
app.use(cookieParser());

// Định tuyến API tập trung
app.use('/api', routes);

// Endpoint mặc định
app.get('/', (req, res) => {
  res.send({
    message: 'Chào mừng đến với Node.js Backend API!',
    documentation: '/api/status để kiểm tra trạng thái máy chủ',
  });
});

// Khởi động server
app.listen(PORT, () => {
  console.log(`\x1b[36m%s\x1b[0m`, `🚀 Server Backend đang chạy tại http://localhost:${PORT}`);
});

