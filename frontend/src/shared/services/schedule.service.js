/**
 * TÊN FILE: schedule.service.js
 * CÔNG DỤNG: Dịch vụ gọi API quản lý lịch trình môn học, dự án và các giai đoạn nhỏ.
 * PHẠM VI DÙNG: Toàn hệ thống Frontend (Shared).
 */

import { authApi } from './auth.service.js';

/**
 * Lấy danh sách toàn bộ các môn học và dự án của người dùng hiện tại.
 * @returns {Promise<Array>} - Danh sách các mục lịch trình
 */
export async function fetchScheduleItems() {
  const response = await authApi.get('/api/schedules');
  return response.data?.items || [];
}

/**
 * Tạo mới một môn học hoặc dự án kèm các giai đoạn nhỏ.
 * @param {object} itemData - Thông tin gồm title, category, description, stages
 * @returns {Promise<object>} - Bản ghi vừa được tạo
 */
export async function createScheduleItem(itemData) {
  const response = await authApi.post('/api/schedules', itemData);
  return response.data?.item;
}

/**
 * Cập nhật trạng thái hoàn thành của một giai đoạn nhỏ.
 * @param {string} itemId - ID môn học/dự án
 * @param {string} stageId - ID giai đoạn nhỏ
 * @param {boolean} isCompleted - Trạng thái đã hoàn thành hay chưa
 * @returns {Promise<object>} - Bản ghi sau khi cập nhật
 */
export async function toggleScheduleStage(itemId, stageId, isCompleted) {
  const response = await authApi.patch(`/api/schedules/${itemId}/stages/${stageId}`, {
    isCompleted,
  });
  return response.data?.item;
}

/**
 * Xóa một môn học hoặc dự án khỏi hệ thống.
 * @param {string} itemId - ID mục cần xóa
 * @returns {Promise<boolean>} - Trạng thái xóa thành công
 */
export async function deleteScheduleItem(itemId) {
  const response = await authApi.delete(`/api/schedules/${itemId}`);
  return response.data?.success;
}
