import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDB } from './config/db.js';
import apiRoutes from './routes/api.js';

// Nạp biến môi trường từ file .env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Khởi chạy kết nối MongoDB
connectDB();

// Middlewares
// Cấu hình CORS hỗ trợ kết nối từ Vercel và Localhost
const allowedOrigins = [
  'https://csbu-109.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Cho phép requests không có origin (như curl/postman) hoặc trùng khớp tên miền cho phép / vercel preview
      if (!origin || allowedOrigins.includes(origin) || /\.vercel\.app$/.test(origin)) {
        return callback(null, true);
      }
      return callback(null, true); // Cho phép kết nối rộng để tránh chặn nhầm
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json());

// Routes
app.use('/api', apiRoutes);

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
