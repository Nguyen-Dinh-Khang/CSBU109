/**
 * TÊN FILE: index.js
 * CÔNG DỤNG: Tổng hợp toàn bộ routes của hệ thống (Common, Customer, Admin).
 * PHẠM VI DÙNG: Toàn hệ thống.
 */

import express from 'express';
import authRoutes from './common/auth.routes.js';
import scheduleRoutes from './customer/schedule.routes.js';
import { getDBStatus } from '../config/db.js';
import { Item } from '../models/Item.js';

const router = express.Router();

/** 1. Tuyến đường xác thực người dùng (Common) */
router.use('/auth', authRoutes);

/** 2. Tuyến đường lịch trình & đầu việc (Customer) */
router.use('/schedules', scheduleRoutes);

/** 3. Tuyến đường kiểm tra trạng thái máy chủ & MongoDB */
router.get('/status', (req, res) => {
  const dbStatus = getDBStatus();
  res.json({
    success: true,
    message: 'Backend Node.js đang hoạt động bình thường!',
    timestamp: new Date().toISOString(),
    database: dbStatus,
  });
});

/** 4. Tuyến đường items mẫu (kế thừa) */
router.get('/items', async (req, res) => {
  const dbStatus = getDBStatus();
  if (!dbStatus.isConnected) {
    return res.status(200).json({
      success: false,
      message: 'MongoDB chưa kết nối.',
      items: [],
    });
  }

  try {
    const items = await Item.find().sort({ createdAt: -1 });
    res.json({ success: true, items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
