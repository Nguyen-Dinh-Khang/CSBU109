/**
 * TÊN FILE: ai.routes.js
 * CÔNG DỤNG: Định tuyến các endpoints phục vụ AI sinh lộ trình học tập, tinh chỉnh lộ trình và áp dụng vào tài khoản.
 * PHẠM VI DÙNG: Phân hệ Customer.
 */

import express from 'express';
import * as aiController from '../../controllers/customer/ai.controller.js';
import { authenticateToken } from '../../middlewares/auth.middleware.js';

const router = express.Router();

/** Toàn bộ các route AI đều yêu cầu xác thực Access Token */
router.use(authenticateToken);

/** 1. AI Roadmap: Sinh lộ trình học tập thông minh qua Gemini AI */
router.post('/roadmap', aiController.generateAIRoadmap);
router.post('/ai-roadmap', aiController.generateAIRoadmap);

/** 2. AI Roadmap: Tinh chỉnh lộ trình đã sinh theo góp ý của người dùng */
router.post('/roadmap/refine', aiController.refineAIRoadmap);
router.post('/ai-roadmap/refine', aiController.refineAIRoadmap);

/** 3. AI Roadmap: Áp dụng lộ trình AI thành một đầu việc hoàn chỉnh */
router.post('/roadmap/apply', aiController.applyAIRoadmap);
router.post('/apply-roadmap', aiController.applyAIRoadmap);

export default router;
