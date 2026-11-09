/**
 * TÊN FILE: ai.controller.js
 * CÔNG DỤNG: Tiếp nhận HTTP request cho các API gợi ý lộ trình thông minh từ AI (Gemini AI), tinh chỉnh lộ trình theo góp ý và áp dụng lộ trình thành đầu việc.
 * PHẠM VI DÙNG: Phân hệ Customer.
 */

import * as aiService from '../../services/common/ai.service.js';
import * as stageService from '../../services/customer/stage.service.js';

/**
 * Tiếp nhận request gợi ý lộ trình thông minh từ AI (Gemini AI).
 * @param {object} req - Request object từ Express
 * @param {object} res - Response object từ Express
 */
export async function generateAIRoadmap(req, res) {
  try {
    const { subjectName, weeks, goalDescription, level } = req.body;

    const roadmap = await aiService.generateRoadmapWithAI({
      subjectName,
      weeks,
      goalDescription,
      level,
    });

    return res.status(200).json({
      success: true,
      message: 'Sinh lộ trình thành công!',
      data: roadmap,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Lỗi khi sinh lộ trình AI.',
    });
  }
}

/**
 * Tiếp nhận request tinh chỉnh lộ trình AI theo góp ý / nhận xét của người dùng.
 * @param {object} req - Request object từ Express
 * @param {object} res - Response object từ Express
 */
export async function refineAIRoadmap(req, res) {
  try {
    const { currentRoadmap, feedbackComment } = req.body;

    const refinedRoadmap = await aiService.refineRoadmapWithAI({
      currentRoadmap,
      feedbackComment,
    });

    return res.status(200).json({
      success: true,
      message: 'Tinh chỉnh lộ trình thành công!',
      data: refinedRoadmap,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Lỗi khi tinh chỉnh lộ trình AI.',
    });
  }
}

/**
 * Tiếp nhận request áp dụng lộ trình AI vào tài khoản (tạo Work + Stages + Goals).
 * @param {object} req - Request object từ Express
 * @param {object} res - Response object từ Express
 */
export async function applyAIRoadmap(req, res) {
  try {
    const userId = req.user.id || req.user._id || req.user.userId;
    const createdWork = await stageService.applyRoadmap(userId, req.body);

    return res.status(201).json({
      success: true,
      message: 'Áp dụng lộ trình học tập thành công!',
      data: createdWork,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Lỗi khi áp dụng lộ trình.',
    });
  }
}
