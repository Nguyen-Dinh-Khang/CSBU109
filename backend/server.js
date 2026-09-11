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
app.use(cors());
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
