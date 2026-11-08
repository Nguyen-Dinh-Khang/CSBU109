/**
 * TÊN FILE: work.routes.js
 * CÔNG DỤNG: Định tuyến các endpoints phục vụ quản lý đầu việc lớn, mục tiêu con, chặng theo dõi và AI sinh lộ trình.
 * PHẠM VI DÙNG: Phân hệ Customer.
 */

import express from 'express';
import * as workController from '../../controllers/customer/work.controller.js';
import * as goalController from '../../controllers/customer/goal.controller.js';
import * as stageController from '../../controllers/customer/stage.controller.js';
import { authenticateToken } from '../../middlewares/auth.middleware.js';

const router = express.Router();

/** Toàn bộ các route quản lý đầu việc & mục tiêu đều yêu cầu xác thực Access Token */
router.use(authenticateToken);

/** 1. AI Roadmap: Sinh lộ trình học tập thông minh qua Gemini AI */
router.post('/ai-roadmap', stageController.generateAIRoadmap);

/** 2. AI Roadmap: Áp dụng lộ trình AI thành một đầu việc hoàn chỉnh */
router.post('/apply-roadmap', stageController.applyAIRoadmap);

/** 3. Function 1: Tạo đầu việc mới */
router.post('/', workController.createWork);

/** 4. Function 5: Hiển thị danh sách đầu việc */
router.get('/', workController.getWorks);

/** 5. Function 6 (Edit): Cập nhật đầu việc */
router.put('/:work_id', workController.updateWork);

/** 6. Function 6 (Delete): Xóa đầu việc */
router.delete('/:work_id', workController.deleteWork);

/** 7. Function 2: Tạo mục tiêu thuộc đầu việc */
router.post('/:work_id/goals', goalController.createGoal);

/** 8. Function 7: Hiển thị danh sách mục tiêu và chặng của đầu việc */
router.get('/:work_id/goals', goalController.getGoalsByWorkId);

/** 9. Function 8 (Edit): Cập nhật mục tiêu */
router.put('/:work_id/goals/:goal_id', goalController.updateGoal);

/** 10. Function 8 (Check): Đảo trạng thái hoàn thành mục tiêu */
router.patch('/:work_id/goals/:goal_id/check', goalController.toggleCheckGoal);

/** 11. Function 8 (Delete): Xóa mục tiêu khỏi đầu việc */
router.delete('/:work_id/goals/:goal_id', goalController.deleteGoal);

/** 12. Stage: Tạo chặng mới trong đầu việc */
router.post('/:work_id/stages', stageController.createStage);

/** 13. Stage: Cập nhật thông tin chặng */
router.put('/:work_id/stages/:stage_id', stageController.updateStage);

/** 14. Stage: Xóa chặng khỏi đầu việc */
router.delete('/:work_id/stages/:stage_id', stageController.deleteStage);

/** 15. Stage: Tự động gom mục tiêu vào các chặng theo mốc ngày */
router.post('/:work_id/stages/auto-assign', stageController.autoAssignGoals);

export default router;
