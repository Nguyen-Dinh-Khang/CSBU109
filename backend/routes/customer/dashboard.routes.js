/**
 * TÊN FILE: dashboard.routes.js
 * CÔNG DỤNG: Định tuyến endpoint lấy dữ liệu tổng quan cho Dashboard (Function 4).
 * PHẠM VI DÙNG: Phân hệ Customer.
 */

import express from 'express';
import * as dashboardController from '../../controllers/customer/dashboard.controller.js';
import { authenticateToken } from '../../middlewares/auth.middleware.js';

const router = express.Router();

/** Dashboard yêu cầu xác thực Access Token */
router.use(authenticateToken);

/** Function 4: Dashboard tổng quan */
router.get('/', dashboardController.getDashboardOverview);

export default router;
