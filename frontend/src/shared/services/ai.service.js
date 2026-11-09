/**
 * TÊN FILE: ai.service.js
 * CÔNG DỤNG: Dịch vụ gọi API Frontend cho các tính năng trí tuệ nhân tạo (Gemini AI) - sinh lộ trình học tập, tinh chỉnh theo phản hồi và áp dụng vào tài khoản.
 * PHẠM VI DÙNG: Toàn hệ thống Frontend (Shared).
 */

import { authApi } from './auth.service.js';

/**
 * Gọi API AI để sinh lộ trình học tập thông minh.
 * @param {object} params - Gồm subjectName, weeks, goalDescription, level
 * @returns {Promise<object>} - Bản phác thảo lộ trình AI
 */
export async function generateAIRoadmap(params) {
  const response = await authApi.post('/api/ai/roadmap', params);
  return response.data.data;
}

/**
 * Gọi API tinh chỉnh lộ trình AI theo phản hồi / góp ý của người dùng.
 * @param {object} params - Gồm currentRoadmap và feedbackComment
 * @returns {Promise<object>} - Lộ trình mới sau khi tinh chỉnh
 */
export async function refineAIRoadmap({ currentRoadmap, feedbackComment }) {
  const response = await authApi.post('/api/ai/roadmap/refine', {
    currentRoadmap,
    feedbackComment,
  });
  return response.data.data;
}

/**
 * Gọi API lưu trọn gói một lộ trình AI thành đầu việc chính thức trong tài khoản.
 * @param {object} roadmapData - Lộ trình hoàn chỉnh
 * @returns {Promise<object>} - Đầu việc vừa tạo
 */
export async function applyAIRoadmap(roadmapData) {
  const response = await authApi.post('/api/ai/roadmap/apply', roadmapData);
  return response.data.data;
}
