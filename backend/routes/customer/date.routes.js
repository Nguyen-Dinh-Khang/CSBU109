/**
 * TÊN FILE: date.routes.js
 * CÔNG DỤNG: Định tuyến các endpoints phục vụ quản lý ngày đặc biệt và sự kiện lịch trình (Function 3, 9, 10).
 * PHẠM VI DÙNG: Phân hệ Customer.
 */

import express from 'express';
import * as dateController from '../../controllers/customer/date.controller.js';
import { authenticateToken } from '../../middlewares/auth.middleware.js';

const router = express.Router();

/** Toàn bộ các route quản lý ngày đặc biệt đều yêu cầu xác thực Access Token */
router.use(authenticateToken);

/** 1. Function 3: Tạo ngày đặc biệt mới */
router.post('/', dateController.createDate);

/** 2. Function 9: Hiển thị ngày đặc biệt theo tháng/năm */
router.get('/', dateController.getDates);

/** 3. Function 10 (Edit): Cập nhật ngày đặc biệt */
router.put('/:date_id', dateController.updateDate);

/** 4. Function 10 (Delete): Xóa ngày đặc biệt */
router.delete('/:date_id', dateController.deleteDate);

export default router;
