/**
 * TÊN FILE: work.routes.js
 * CÔNG DỤNG: Định tuyến các endpoints phục vụ quản lý đầu việc lớn và các mục tiêu con (Function 1, 2, 5, 6, 7, 8).
 * PHẠM VI DÙNG: Phân hệ Customer.
 */

import express from 'express';
import * as workController from '../../controllers/customer/work.controller.js';
import * as goalController from '../../controllers/customer/goal.controller.js';
import { authenticateToken } from '../../middlewares/auth.middleware.js';

const router = express.Router();

/** Toàn bộ các route quản lý đầu việc & mục tiêu đều yêu cầu xác thực Access Token */
router.use(authenticateToken);

/** 1. Function 1: Tạo đầu việc mới */
router.post('/', workController.createWork);

/** 2. Function 5: Hiển thị danh sách đầu việc */
router.get('/', workController.getWorks);

/** 3. Function 6 (Edit): Cập nhật đầu việc */
router.put('/:work_id', workController.updateWork);

/** 4. Function 6 (Delete): Xóa đầu việc */
router.delete('/:work_id', workController.deleteWork);

/** 5. Function 2: Tạo mục tiêu thuộc đầu việc */
router.post('/:work_id/goals', goalController.createGoal);

/** 6. Function 7: Hiển thị danh sách mục tiêu của đầu việc */
router.get('/:work_id/goals', goalController.getGoalsByWorkId);

/** 7. Function 8 (Edit): Cập nhật mục tiêu */
router.put('/:work_id/goals/:goal_id', goalController.updateGoal);

/** 8. Function 8 (Check): Đảo trạng thái hoàn thành mục tiêu */
router.patch('/:work_id/goals/:goal_id/check', goalController.toggleCheckGoal);

/** 9. Function 8 (Delete): Xóa mục tiêu khỏi đầu việc */
router.delete('/:work_id/goals/:goal_id', goalController.deleteGoal);

export default router;
