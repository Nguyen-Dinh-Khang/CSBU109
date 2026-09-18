/**
 * TÊN FILE: auth.routes.js
 * CÔNG DỤNG: Định tuyến các endpoints phục vụ xác thực người dùng (đăng ký, đăng nhập, refresh, logout, profile).
 * PHẠM VI DÙNG: Toàn hệ thống (Common).
 */

import express from 'express';
import * as authController from '../../controllers/common/auth.controller.js';
import { authenticateToken } from '../../middlewares/auth.middleware.js';

const router = express.Router();

/** Tuyến đường đăng ký tài khoản mới */
router.post('/register', authController.register);

/** Tuyến đường đăng nhập tài khoản */
router.post('/login', authController.login);

/** Tuyến đường làm mới Access Token từ Cookie */
router.post('/refresh', authController.refresh);

/** Tuyến đường đăng xuất và hủy token */
router.post('/logout', authController.logout);

/** Tuyến đường lấy thông tin tài khoản hiện tại (yêu cầu Access Token) */
router.get('/me', authenticateToken, authController.getMe);

export default router;
