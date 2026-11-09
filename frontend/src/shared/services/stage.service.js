/**
 * TÊN FILE: stage.service.js
 * CÔNG DỤNG: Dịch vụ gọi API Frontend cho các tính năng quản lý chặng (Stages), tự động gom mục tiêu và AI Roadmap.
 * PHẠM VI DÙNG: Toàn hệ thống Frontend (Shared).
 */

import { authApi } from './auth.service.js';

/**
 * Gọi API tạo chặng mới trong một đầu việc.
 * @param {string} workId - ID đầu việc
 * @param {object} stageData - Dữ liệu chặng (stage_name, stage_order, stage_start_date, stage_end_date, stage_description, stage_color)
 * @returns {Promise<object>} - Chặng vừa tạo
 */
export async function createStage(workId, stageData) {
  const response = await authApi.post(`/api/works/${workId}/stages`, stageData);
  return response.data.data;
}

/**
 * Gọi API cập nhật thông tin chặng.
 * @param {string} workId - ID đầu việc
 * @param {string} stageId - ID chặng
 * @param {object} updateData - Dữ liệu cập nhật
 * @returns {Promise<object>} - Chặng sau khi cập nhật
 */
export async function updateStage(workId, stageId, updateData) {
  const response = await authApi.put(`/api/works/${workId}/stages/${stageId}`, updateData);
  return response.data.data;
}

/**
 * Gọi API xóa một chặng khỏi đầu việc.
 * @param {string} workId - ID đầu việc
 * @param {string} stageId - ID chặng cần xóa
 * @returns {Promise<object>} - Dữ liệu stages và goals sau khi xóa
 */
export async function deleteStage(workId, stageId) {
  const response = await authApi.delete(`/api/works/${workId}/stages/${stageId}`);
  return response.data.data;
}

/**
 * Gọi API tự động gom mục tiêu vào các chặng theo mốc ngày.
 * @param {string} workId - ID đầu việc
 * @returns {Promise<object>} - Dữ liệu stages và goals sau khi phân bổ
 */
export async function autoAssignGoals(workId) {
  const response = await authApi.post(`/api/works/${workId}/stages/auto-assign`);
  return response.data.data;
}

/**
 * Gọi API AI để sinh lộ trình học tập thông minh.
 * @param {object} params - Gồm subjectName, weeks, goalDescription, level
 * @returns {Promise<object>} - Bản phác thảo lộ trình AI
 */
export async function generateAIRoadmap(params) {
  const response = await authApi.post('/api/works/ai-roadmap', params);
  return response.data.data;
}

/**
 * Gọi API tinh chỉnh lộ trình AI theo phản hồi / góp ý của người dùng.
 * @param {object} params - Gồm currentRoadmap và feedbackComment
 * @returns {Promise<object>} - Lộ trình mới sau khi tinh chỉnh
 */
export async function refineAIRoadmap({ currentRoadmap, feedbackComment }) {
  const response = await authApi.post('/api/works/ai-roadmap/refine', {
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
  const response = await authApi.post('/api/works/apply-roadmap', roadmapData);
  return response.data.data;
}
