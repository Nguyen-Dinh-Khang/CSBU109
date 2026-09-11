import express from 'express';
import { getDBStatus } from '../config/db.js';
import { Item } from '../models/Item.js';

const router = express.Router();

// 1. Endpoint kiểm tra trạng thái máy chủ & MongoDB
router.get('/status', (req, res) => {
  const dbStatus = getDBStatus();
  res.json({
    success: true,
    message: 'Backend Node.js đang hoạt động bình thường!',
    timestamp: new Date().toISOString(),
    database: dbStatus,
  });
});

// 2. Endpoint lấy danh sách items
router.get('/items', async (req, res) => {
  const dbStatus = getDBStatus();
  if (!dbStatus.isConnected) {
    return res.status(200).json({
      success: false,
      message: 'MongoDB chưa được kết nối. Hãy cấu hình MONGODB_URI trong file backend/.env để lưu trữ dữ liệu thật.',
      items: [
        {
          _id: 'mock-1',
          title: 'Dữ liệu mẫu 1 (Chế độ mô phỏng)',
          description: 'Dữ liệu này hiển thị khi chưa gắn link MongoDB.',
          createdAt: new Date().toISOString(),
        },
        {
          _id: 'mock-2',
          title: 'Dữ liệu mẫu 2 (Chế độ mô phỏng)',
          description: 'Khi bạn thêm link MongoDB vào backend/.env, dữ liệu thật sẽ được lưu vào database.',
          createdAt: new Date().toISOString(),
        },
      ],
    });
  }

  try {
    const items = await Item.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      items,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 3. Endpoint tạo mới item
router.post('/items', async (req, res) => {
  const dbStatus = getDBStatus();
  if (!dbStatus.isConnected) {
    return res.status(400).json({
      success: false,
      message: 'Chưa thể tạo mới dữ liệu do MongoDB chưa được kết nối. Vui lòng thêm MONGODB_URI vào file backend/.env trước.',
    });
  }

  try {
    const { title, description } = req.body;
    if (!title) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp tiêu đề (title).' });
    }

    const newItem = await Item.create({ title, description });
    res.status(201).json({
      success: true,
      message: 'Tạo item thành công!',
      item: newItem,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 4. Endpoint xóa item
router.delete('/items/:id', async (req, res) => {
  const dbStatus = getDBStatus();
  if (!dbStatus.isConnected) {
    return res.status(400).json({
      success: false,
      message: 'MongoDB chưa kết nối.',
    });
  }

  try {
    const { id } = req.params;
    await Item.findByIdAndDelete(id);
    res.json({ success: true, message: 'Đã xóa item thành công!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
