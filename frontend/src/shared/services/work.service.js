/**
 * TÊN FILE: work.service.js
 * CÔNG DỤNG: Cung cấp các hàm gọi API Frontend cho 10 chức năng nghiệp vụ (Works, Goals, Dates, Dashboard) theo kiến trúc chuẩn.
 * PHẠM VI DÙNG: Toàn hệ thống Frontend (Shared).
 */

import { authApi } from './auth.service.js';

/**
 * Function 1: Gọi API tạo đầu việc mới.
 * @param {object} workData - Gồm work_name, work_start_date, work_end_date, work_color, work_description
 * @returns {Promise<object>} - Object đầu việc vừa tạo
 */
export async function createWork(workData) {
  const response = await authApi.post('/api/works', workData);
  return response.data.data;
}

/**
 * Function 5: Gọi API lấy danh sách toàn bộ đầu việc của người dùng.
 * @returns {Promise<Array>} - Danh sách đầu việc
 */
export async function fetchWorks() {
  const response = await authApi.get('/api/works');
  return response.data.data || [];
}

/**
 * Function 6 (Edit): Gọi API cập nhật thông tin đầu việc.
 * @param {string} workId - ID đầu việc
 * @param {object} updateData - Dữ liệu cập nhật
 * @returns {Promise<object>} - Đầu việc sau khi cập nhật
 */
export async function updateWork(workId, updateData) {
  const response = await authApi.put(`/api/works/${workId}`, updateData);
  return response.data.data;
}

/**
 * Function 6 (Delete): Gọi API xóa một đầu việc.
 * @param {string} workId - ID đầu việc cần xóa
 * @returns {Promise<boolean>} - Trạng thái thành công
 */
export async function deleteWork(workId) {
  const response = await authApi.delete(`/api/works/${workId}`);
  return response.data.success;
}

/**
 * Function 2: Gọi API tạo mục tiêu mới trong một đầu việc.
 * @param {string} workId - ID đầu việc cha
 * @param {object} goalData - Gồm goal_name, goal_end_date, goal_color, goal_range, goal_description
 * @returns {Promise<object>} - Mục tiêu vừa tạo
 */
export async function createGoal(workId, goalData) {
  const response = await authApi.post(`/api/works/${workId}/goals`, goalData);
  return response.data.data;
}

/**
 * Function 7: Gọi API lấy danh sách mục tiêu của một đầu việc cụ thể.
 * @param {string} workId - ID đầu việc
 * @returns {Promise<object>} - Gồm work_name và mảng danh sách goals
 */
export async function fetchGoals(workId) {
  const response = await authApi.get(`/api/works/${workId}/goals`);
  return response.data;
}

/**
 * Function 8 (Edit): Gọi API cập nhật thông tin mục tiêu.
 * @param {string} workId - ID đầu việc
 * @param {string} goalId - ID mục tiêu
 * @param {object} updateData - Dữ liệu cập nhật
 * @returns {Promise<object>} - Mục tiêu sau khi sửa
 */
export async function updateGoal(workId, goalId, updateData) {
  const response = await authApi.put(`/api/works/${workId}/goals/${goalId}`, updateData);
  return response.data.data;
}

/**
 * Function 8 (Check): Gọi API đảo trạng thái hoàn thành mục tiêu.
 * @param {string} workId - ID đầu việc
 * @param {string} goalId - ID mục tiêu
 * @returns {Promise<object>} - Mục tiêu với trạng thái mới
 */
export async function toggleCheckGoal(workId, goalId) {
  const response = await authApi.patch(`/api/works/${workId}/goals/${goalId}/check`);
  return response.data.data;
}

/**
 * Function 8 (Delete): Gọi API xóa mục tiêu khỏi đầu việc.
 * @param {string} workId - ID đầu việc
 * @param {string} goalId - ID mục tiêu cần xóa
 * @returns {Promise<boolean>} - Trạng thái thành công
 */
export async function deleteGoal(workId, goalId) {
  const response = await authApi.delete(`/api/works/${workId}/goals/${goalId}`);
  return response.data.success;
}

/**
 * Function 3: Gọi API tạo ngày đặc biệt mới.
 * @param {object} dateData - Gồm date_name, date_date, date_color
 * @returns {Promise<object>} - Ngày đặc biệt vừa tạo
 */
export async function createDate(dateData) {
  const response = await authApi.post('/api/dates', dateData);
  return response.data.data;
}

/**
 * Function 9: Gọi API lấy danh sách ngày đặc biệt theo tháng và năm.
 * @param {number} month - Tháng (1 - 12)
 * @param {number} year - Năm (ví dụ 2026)
 * @returns {Promise<Array>} - Danh sách ngày đặc biệt
 */
export async function fetchDates(month, year) {
  const params = {};
  if (month) params.month = month;
  if (year) params.year = year;
  const response = await authApi.get('/api/dates', { params });
  return response.data.data || [];
}

/**
 * Function 10 (Edit): Gọi API cập nhật ngày đặc biệt.
 * @param {string} dateId - ID ngày đặc biệt
 * @param {object} updateData - Dữ liệu cập nhật
 * @returns {Promise<object>} - Ngày đặc biệt sau khi sửa
 */
export async function updateDate(dateId, updateData) {
  const response = await authApi.put(`/api/dates/${dateId}`, updateData);
  return response.data.data;
}

/**
 * Function 10 (Delete): Gọi API xóa ngày đặc biệt.
 * @param {string} dateId - ID ngày đặc biệt cần xóa
 * @returns {Promise<boolean>} - Trạng thái thành công
 */
export async function deleteDate(dateId) {
  const response = await authApi.delete(`/api/dates/${dateId}`);
  return response.data.success;
}

/**
 * Function 4: Gọi API lấy dữ liệu tổng quan cho trang Dashboard.
 * @returns {Promise<object>} - Gồm upcoming_goals và upcoming_dates
 */
export async function fetchDashboard() {
  const response = await authApi.get('/api/dashboard');
  return response.data.data;
}
