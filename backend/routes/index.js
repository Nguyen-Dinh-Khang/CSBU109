/**
 * TÊN FILE: index.js
 * CÔNG DỤNG: Tổng hợp toàn bộ routes của hệ thống (Auth, Works, Dates, Dashboard, Schedules).
 * PHẠM VI DÙNG: Toàn hệ thống.
 */

import express from 'express';
import authRoutes from './common/auth.routes.js';
import workRoutes from './customer/work.routes.js';
import dateRoutes from './customer/date.routes.js';
import dashboardRoutes from './customer/dashboard.routes.js';
import scheduleRoutes from './customer/schedule.routes.js';
import { getDBStatus } from '../config/db.js';

const router = express.Router();

/** 1. Tuyến đường xác thực người dùng (Common) - Function 11, 12 */
router.use('/auth', authRoutes);

/** 2. Tuyến đường quản lý đầu việc & mục tiêu (Customer) - Function 1, 2, 5, 6, 7, 8 */
router.use('/works', workRoutes);

/** 3. Tuyến đường quản lý ngày đặc biệt & lịch trình (Customer) - Function 3, 9, 10 */
router.use('/dates', dateRoutes);

/** 4. Tuyến đường Dashboard tổng quan (Customer) - Function 4 */
router.use('/dashboard', dashboardRoutes);

/** 5. Tuyến đường lịch trình & đầu việc theo giai đoạn (Kế thừa) */
router.use('/schedules', scheduleRoutes);

/** 6. Tuyến đường kiểm tra trạng thái máy chủ & MongoDB */
router.get('/status', (req, res) => {
  const dbStatus = getDBStatus();
  res.json({
    success: true,
    message: 'Backend Node.js đang hoạt động bình thường!',
    timestamp: new Date().toISOString(),
    database: dbStatus,
  });
});


export default router;
