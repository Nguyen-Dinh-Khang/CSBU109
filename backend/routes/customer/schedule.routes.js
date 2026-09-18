/**
 * TÊN FILE: schedule.routes.js
 * CÔNG DỤNG: Định tuyến các endpoints phục vụ quản lý lịch trình môn học, dự án và các giai đoạn nhỏ.
 * PHẠM VI DÙNG: Phân hệ Customer.
 */

import express from 'express';
import * as scheduleController from '../../controllers/customer/schedule.controller.js';
import { authenticateToken } from '../../middlewares/auth.middleware.js';

const router = express.Router();

/** Toàn bộ route trong phân hệ này đều yêu cầu đăng nhập */
router.use(authenticateToken);

/** Lấy danh sách lịch trình môn học / dự án của user */
router.get('/', scheduleController.getScheduleItems);

/** Tạo mới một môn học hoặc dự án */
router.post('/', scheduleController.createScheduleItem);

/** Cập nhật trạng thái hoàn thành của một giai đoạn nhỏ */
router.patch('/:itemId/stages/:stageId', scheduleController.updateStageStatus);

/** Xóa một môn học / dự án */
router.delete('/:itemId', scheduleController.deleteScheduleItem);

export default router;
